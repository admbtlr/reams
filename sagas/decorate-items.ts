import { call, delay, put, select, spawn } from 'redux-saga/effects'
import { loadMercuryStuff } from '../backends'
import * as FileSystem from 'expo-file-system'
import { InteractionManager, Platform } from 'react-native'
import { 
  ITEM_DECORATION_FAILURE,
  ITEM_DECORATION_SUCCESS,
  ImageStuff,
  Item,
  ItemInflated,
  ItemType,
  MercuryStuff,
  UPDATE_ITEM
} from '../store/items/types'
import { getCachedCoverImagePath, getImageDimensions } from '../utils'
import { setCoverInline, setCoverAlign, setTitleVAlign } from '../utils/createItemStyles'
import { getItem, getNewsletters } from './selectors'
import { faceDetection } from '../utils/face-detection'

import {
  getIndex,
  getItems,
  getDisplay,
  getFeeds,
  getSavedItems
} from './selectors'
import { 
  getItems as getItemsSQLite, 
  updateItem as updateItemSQLite
} from '../storage/sqlite'
import { 
  getItems as getItemsIDB, 
  updateItem as updateItemIDB
} from '../storage/idb-storage'
import { Feed, Source } from '../store/feeds/types'
import { Category } from '../store/categories/types'
import { RootState } from '../store/reducers'
import { Filter } from '../store/config/config'
import { addCoverImageToItem, addMercuryStuffToItem, deflateItem, removeCachedCoverImageDuplicate, setShowCoverImage } from '../utils/item-utils'
import log from '../utils/log'
import { downloadContent } from '../backends/fastmail'
import { Newsletter } from '../store/newsletters/types'

let pendingDecoration: Item[] = [] // a local cache
let toDispatch = []

const showLogs = true

export const MAX_DECORATION_FAILURES = 1

interface Decoration {
  item: WholeItem
  mercuryStuff: MercuryStuff
  imageStuff: ImageStuff
}

interface WholeItem extends Item, ItemInflated {}

export function * decorateItems () {
  let items
  let item
  let count = 0

  yield spawn(function * () {
    while (true) {
      const nextItem: Item = yield getNextItemToDecorate()
      // console.log('Looking for new item')
      if (nextItem) {
        // consoleLog(`Got item to decorate: ${nextItem.title}`)
        pendingDecoration.push(nextItem)
        yield delay(2000)
        if (!nextItem) continue // somehow item can become undefined here...?
        yield decorateItem(nextItem)
      } else {
        yield delay(2000)
      }
    }
  })
}

export function * decorateItem (item: Item) {
  // console.log(`Inside decorateItem "${item.title}"`)
  try {    
    const decoration: Decoration = yield assembleDecoration(item)
    if (decoration && decoration.mercuryStuff && !decoration.mercuryStuff.error) {
      yield applyDecoration(decoration)
      console.log(`Decorated item "${item.title}"`)
    } else {
      yield decorationFailed(item)
    }
  } catch (error) {
    yield decorationFailed(item)
  }
}

function * decorationFailed (item: Item) {
  if (!item) return
  consoleLog(`Error decorating item "${item.title}", trying again next time around`)
  yield call(InteractionManager.runAfterInteractions)
  yield put({
    type: ITEM_DECORATION_FAILURE,
    item,
    isSaved: item.isSaved
  })
  item = yield select(getItem, item._id, item.isSaved ? ItemType.saved : ItemType.unread)
  // I don't think this is necessary anymore
  // if (Platform.OS === 'web') {
  //   yield call(updateItemIDB, item)
  // } else {
  //   yield call(updateItemSQLite, item)
  // }
  pendingDecoration = pendingDecoration.filter(pending => pending._id !== item._id)
}

function consoleLog(txt: string) {
  if (showLogs) {
    console.log(txt)
  }
}

export function * assembleDecoration (i: Item): Generator<any, Decoration | boolean, any> {
  let items: ItemInflated[] = Platform.OS === 'web' ?
    yield call(getItemsIDB, [i]) :
    yield call(getItemsSQLite, [i])
  let itemInflated = items[0]
  let item: WholeItem = { ...i , ...itemInflated}
  if (item.blobId) {
    const { content_html, url } = yield call(downloadContent, item)
    item = { 
      ...item, 
      content_html, 
      url 
    }
    if (Platform.OS === 'web') {
      yield call(updateItemIDB, item)
    } else {
      yield call(updateItemSQLite, item)
    }
    yield put({ 
      type: UPDATE_ITEM,
      item: deflateItem(item)
    })
  }
  const mercuryStuff: MercuryStuff = yield call(loadMercuryStuff, item)
  if (!mercuryStuff) {
    return false
  }
  const imageStuff: ImageStuff = yield call(prepareCoverImage, item, mercuryStuff)
  return {
    item,
    mercuryStuff,
    imageStuff
  }
}

function * applyDecoration (decoration: Decoration) {
  yield call(InteractionManager.runAfterInteractions)
  const displayMode: string = yield select(getDisplay)
  const isSaved = decoration.item.isSaved
  yield call(persistDecoration, {...decoration})
  yield put({
    type: ITEM_DECORATION_SUCCESS,
    ...decoration,
    isSaved,
    displayMode
  })
  //@ts-ignore
  const items: Item[] = [ ...yield select(getItems, isSaved ? ItemType.saved : ItemType.unread) ]

  // this appears to have been replace by the call to persistDecoration above
  // let item = items.find(item => item._id === decoration.item._id)
  // if (item) {
  //   try {
  //     if (Platform.OS === 'web') {
  //       yield call(updateItemIDB, item)
  //     } else {
  //       yield call(updateItemSQLite, item)
  //     }
  //   } catch(err) {
  //     log('decorateItems', err)
  //   }
  // }
  if (decoration.item) {
    pendingDecoration = pendingDecoration.filter(pending => pending._id !== decoration.item._id)
  }
}

function * persistDecoration (decoration: Decoration) {
  const {imageStuff, item, mercuryStuff} = decoration
  const isWeb = Platform.OS === 'web'
  const decorated = addMercuryStuffToItem(item, mercuryStuff)
  let wholeItem = {
    ...item,
    ...decorated
  }
  wholeItem = addCoverImageToItem(wholeItem, imageStuff)
  if (!!wholeItem.coverImageFile || (isWeb && !!wholeItem.coverImageUrl)) {
    wholeItem.hasCoverImage = isWeb ?
      !!wholeItem.coverImageUrl :
      !!wholeItem.coverImageFile
    wholeItem = setShowCoverImage(wholeItem)
    wholeItem.styles = adjustStylesToCoverImage(decoration)
    wholeItem = removeCachedCoverImageDuplicate(wholeItem)  
  }
  if (Platform.OS === 'web') {
    yield call(updateItemIDB, wholeItem)
  } else {
    yield call(updateItemSQLite, wholeItem)
  }
  yield put({ 
    type: UPDATE_ITEM,
    item: deflateItem(wholeItem)
  })
}

function * prepareCoverImage (item: Item, mercuryStuff: MercuryStuff): Generator<any, ImageStuff, any> {
  let imageStuff = {}
  if (mercuryStuff.lead_image_url && Platform.OS !== 'web') {
    let coverImageFile = yield call (cacheCoverImage, item, mercuryStuff.lead_image_url)
    if (coverImageFile) {
      try {
        const imageDimensions = yield call(getImageDimensions, getCachedCoverImagePath(item))
        let faceCentreNormalised
        //@ts-ignore
        if (Platform.OS !== 'web') {
          faceCentreNormalised = yield call(faceDetection, coverImageFile, imageDimensions)
        }
        imageStuff = {
          coverImageFile,
          imageDimensions,
          faceCentreNormalised
        }
      } catch (error: any) {
        consoleLog(error)
      }
    }
  }
  return imageStuff
}

function adjustStylesToCoverImage (decoration: Decoration): {} {
  let { imageStuff, item, mercuryStuff } = decoration
  let styles = { ...item.styles }
  if (imageStuff.faceCentreNormalised) {
    const { x, y } = imageStuff.faceCentreNormalised
    const hAlign = x < 0.333 ? 'left' :
      x < 0.666 ? 'center' : 'right'
    const vAlign = y < 0.5 ? 'bottom' : 'top'
    styles = setCoverAlign(hAlign, styles)
    styles = setTitleVAlign(vAlign, styles)
  }

  const setImageInline = () => Math.random() > 0.5
    || (mercuryStuff.excerpt && mercuryStuff.excerpt.length > 180)


  if (setImageInline()) {
    styles = setCoverInline(styles)
  } else {
    // title.bg has a different meaning for fullbleed cover images
    // check that title is short enough
    styles.title.bg  = styles.title.bg && item.title.length < 40
  }
  return styles
}

export async function cacheCoverImage (item: Item, imageURL: string) {
  const splitted = imageURL.split('.')
  // const extension = splitted[splitted.length - 1].split('?')[0].split('%')[0]
  // making a big assumption on the .jpg extension here...
  // and it seems like Image adds '.png' to a filename if there's no extension
  const fileName = getCachedCoverImagePath(item)
  // consoleLog(`Loading cover image for ${item._id}...`)

  try {
    const fileInfo = await FileSystem.getInfoAsync(fileName)
    if (fileInfo.exists) return fileName
    await FileSystem.downloadAsync(imageURL, fileName)
    return fileName
  } catch(err) {
    consoleLog(`Loading cover image for ${item._id} failed :(`)
    log('cacheCoverImage', err)
    return false
  }
}

function * getNextItemToDecorate () {
  const isItemViable = (item: Item) => {
    return !item.isDecorated &&
      (!item.decoration_failures || item.decoration_failures < MAX_DECORATION_FAILURES) &&
      !pendingDecoration.find(pd => pd._id === item._id)
  }

  let nextItem
  const displayMode: string = yield select(getDisplay)
  const savedItems: Item[] = yield select(getSavedItems)

  if (displayMode === ItemType.saved) {
    const index: number = yield select(getIndex, ItemType.saved)
    if (isItemViable(savedItems[index])) {
      return savedItems[index]
    }
    nextItem = savedItems.find(isItemViable)
    if (nextItem) return nextItem
  }
  // the getItems selector calls utils/get-item/getItems
  // which applies the filter
  const items: Item[] = yield select(getItems, ItemType.unread)
  const index: number = yield select(getIndex, ItemType.unread)
  const feeds: Feed[] = yield select(getFeeds)
  const newsletters: Newsletter[] = yield select(getNewsletters)
  let sourcesWithoutDecoration: Source[] = feeds.filter(feed => {
    // external items handle their own decoration
    return !items.filter(i => !i.readAt && !i.isExternal && i.feed_id === feed._id)
      .find(item => typeof item.coverImageUrl !== 'undefined')
  })
  sourcesWithoutDecoration = sourcesWithoutDecoration.concat(newsletters.filter(nl => {
    return !items.filter(i => !i.readAt && !i.isExternal && i.feed_id === nl._id)
      .find(item => typeof item.coverImageUrl !== 'undefined')

  }))
  let count = 0
  const candidateItems = items.filter(item => {
    return !item.isDecorated &&
      (!item.decoration_failures || item.decoration_failures < 3) &&
      // !item.readAt &&
      items.indexOf(item) >= index &&
      items.indexOf(item) < index + 20
  })
  if (candidateItems.length) {
    nextItem = candidateItems.find(item => !item.isDecorated
      && !pendingDecoration.find(pd => pd._id === item._id))
  }
  if (!nextItem) {
    while (sourcesWithoutDecoration.length > 0 && count < sourcesWithoutDecoration.length && !nextItem) {
      const feed = sourcesWithoutDecoration[count++]
      nextItem = items.find(i => !i.readAt &&
        i.feed_id === feed._id &&
        !i.isDecorated &&
        (i.decoration_failures ? i.decoration_failures < MAX_DECORATION_FAILURES : true) &&
        !pendingDecoration.find(pd => pd._id === i._id))
    }
  }
  if (!nextItem) {
    nextItem = savedItems.find(item => !item.isDecorated &&
      item.decoration_failures &&
      item.decoration_failures < MAX_DECORATION_FAILURES &&
      !pendingDecoration.find(pd => pd._id === item._id))
  }
  return nextItem
}
