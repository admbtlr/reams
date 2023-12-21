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
import { getActiveItems, getItem } from './selectors'
import log from '../utils/log'
// import { faceDetection } from '../utils/face-detection'

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
import { Feed } from '../store/feeds/types'
import { Category } from '../store/categories/types'
import { RootState } from '../store/reducers'
import { Filter } from '../store/config/config'
import { addCoverImageToItem, addMercuryStuffToItem, deflateItem, removeCachedCoverImageDuplicate, setShowCoverImage } from '../utils/item-utils'

let pendingDecoration: Item[] = [] // a local cache
let toDispatch = []

const showLogs = true

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
        consoleLog(`Got item to decorate: ${nextItem.title}`)
        pendingDecoration.push(nextItem)
        yield delay(3000)
        if (!nextItem) continue // somehow item can become undefined here...?
        yield decorateItem(nextItem)
      } else {
        yield delay(3000)
      }
    }
  })
}

export function * decorateItem (item: Item) {
  console.log(`Inside decorateItem "${item.title}"`)
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
  if (Platform.OS === 'web') {
    yield call(updateItemIDB, item)
  } else {
    yield call(updateItemSQLite, item)
  }
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
  const items: Item[] = [ ...yield select(getItems, isSaved ? ItemType.saved : ItemType.unread) ]

  let item = items.find(item => item._id === decoration.item._id)
  if (item) {
    try {
      if (Platform.OS === 'web') {
        yield call(updateItemIDB, item)
      } else {
        yield call(updateItemSQLite, item)
      }
    } catch(err) {
      log('decorateItems', err)
    }
  }
  if (decoration.item) {
    pendingDecoration = pendingDecoration.filter(pending => pending._id !== decoration.item._id)
  }
}

function * persistDecoration (decoration: Decoration) {
  const {imageStuff, item, mercuryStuff} = decoration
  const decorated = addMercuryStuffToItem(item, mercuryStuff)
  let wholeItem = {
    ...item,
    ...decorated
  }
  wholeItem = addCoverImageToItem(wholeItem, imageStuff)
  wholeItem.hasCoverImage = !!wholeItem.coverImageFile
  wholeItem = setShowCoverImage(wholeItem)
  wholeItem = removeCachedCoverImageDuplicate(wholeItem)
  wholeItem.styles = adjustStylesToCoverImage(decoration)
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
        // const faceCentreNormalised = yield call(faceDetection, coverImageFile, imageDimensions)
        imageStuff = {
          coverImageFile,
          imageDimensions,
          // faceCentreNormalised
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

  if (!!item.title &&
    ((
      Math.random() > 0.5 /*&&
      imageStuff.imageDimensions?.height < imageStuff.imageDimensions?.width / 1.8*/
    ) || mercuryStuff.excerpt && mercuryStuff.excerpt.length > 180)) {
    if (styles) {
      styles = setCoverInline(styles)
    }
    item.showCoverImage = true
  }
  return styles
}

export async function cacheCoverImage (item, imageURL) {
  const splitted = imageURL.split('.')
  // const extension = splitted[splitted.length - 1].split('?')[0].split('%')[0]
  // making a big assumption on the .jpg extension here...
  // and it seems like Image adds '.png' to a filename if there's no extension
  const fileName = getCachedCoverImagePath(item)
  // consoleLog(`Loading cover image for ${item._id}...`)
  const fileInfo = await FileSystem.getInfoAsync(fileName)
  if (fileInfo.exists) return fileName
  try {
    await FileSystem.downloadAsync(imageURL, fileName)
    return fileName
  } catch(err) {
    consoleLog(`Loading cover image for ${item._id} failed :(`)
    consoleLog(err)
    return false
  }
}

function * getNextItemToDecorate () {
  let nextItem
  const savedItems: Item[] = yield select(getSavedItems)
  nextItem = savedItems.find(item => item.title === 'Loading...' &&
    (!item.decoration_failures || item.decoration_failures < 5) &&
    !item.isExternal) // external items handle their own decoration
  if (nextItem) return nextItem

  const items: Item[] = yield select(getItems, ItemType.unread)
  const index: number = yield select(getIndex, ItemType.unread)
  const feeds: Feed[] = yield select(getFeeds)
  const categories: Category[] = yield select(state => state.categories.categories)
  const filter: Filter = yield select((state: RootState) => state.config.filter)
  const activeFilter = filter?._id ? categories.find(c => c._id === filter._id) : null
  const feedsWithoutDecoration = feeds.filter(feed => {
    // external items handle their own decoration
    return !items.filter(i => !i.readAt && !i.isExternal && i.feed_id === feed._id)
      .find(item => typeof item.coverImageUrl !== 'undefined')
  })
  let count = 0
  let feed: Feed
  const candidateItems = items.filter(item => {
    return !item.isDecorated &&
      (!item.decoration_failures || item.decoration_failures < 3) &&
      !item.readAt &&
      items.indexOf(item) >= index &&
      items.indexOf(item) < index + 20 &&
      (!activeFilter || activeFilter.feeds.includes(item.feed_id))
  })
  if (candidateItems.length) {
    nextItem = candidateItems.find(item => !item.isDecorated
      && !pendingDecoration.find(pd => pd._id === item._id))
  }
  if (!nextItem) {
    while (feedsWithoutDecoration.length > 0 && count < feedsWithoutDecoration.length && !nextItem) {
      feed = feedsWithoutDecoration[count++]
      nextItem = items.find(i => !i.readAt &&
        i.feed_id === feed._id &&
        !i.isDecorated &&
        (i.decoration_failures ? i.decoration_failures < 5 : true) &&
        !pendingDecoration.find(pd => pd._id === i._id))
    }
  }
  if (!nextItem) {
    nextItem = savedItems.find(item => !item.isDecorated &&
      item.decoration_failures &&
      item.decoration_failures < 5 &&
      !pendingDecoration.find(pd => pd._id === item._id))
  }
  return nextItem
}

