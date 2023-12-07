import { call, delay, put, select, spawn } from 'redux-saga/effects'
import { loadMercuryStuff } from '../backends'
import * as FileSystem from 'expo-file-system'
import { InteractionManager, Platform } from 'react-native'
import { 
  ITEM_DECORATION_FAILURE,
  ITEM_DECORATION_SUCCESS
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
import { persistDecoration } from './update-item'


let pendingDecoration = [] // a local cache
let toDispatch = []

const showLogs = true

export function * decorateItems (action) {
  let items
  let item
  let count = 0

  yield spawn(function * () {
    while (true) {
      const nextItem = yield getNextItemToDecorate()
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
  let items: ItemInflated[] = yield call(getItemsSQLite, [i])
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

function * applyDecoration (decoration: Decoration, isSaved: boolean = false) {
  yield call(InteractionManager.runAfterInteractions)
  const displayMode = yield select(getDisplay)
  yield call(persistDecoration, {...decoration})
  yield put({
    type: ITEM_DECORATION_SUCCESS,
    ...decoration,
    isSaved,
    displayMode
  })
  const items = [ ...yield select(getItems) ]
  decoratedCount = items.filter((item) => item.isDecorated).length
  // consoleLog(`DECORATED ${decoratedCount} OUT OF ${items.length}`)

  yield call(InteractionManager.runAfterInteractions)
  yield put({
    type: 'ITEM_DECORATION_PROGRESS',
    totalCount: items.length,
    decoratedCount
  })

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

function * getNextItemToDecorate () {
  let nextItem
  const savedItems = yield select(getSavedItems)
  nextItem = savedItems.find(item => item.title === 'Loading...' &&
    (!item.decoration_failures || item.decoration_failures < 5))
  if (nextItem) return nextItem

  const items = yield select(getItems)
  const index = yield select(getIndex)
  const feeds = yield select(getFeeds)
  const categories = yield select(state => state.categories.categories)
  const filter = yield select(state => state.config.filter)
  const activeFilter = filter?._id ? categories.find(c => c._id === filter._id) : null
  const feedsWithoutDecoration = feeds.filter(feed => {
    // external items handle their own decoration
    return !items.filter(i => !i.readAt && !i.isExternal && i.feed_id === feed._id)
      .find(item => typeof item.coverImageUrl !== 'undefined')
  })
  let count = 0
  let feed
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
      item.decoration_failures < 5 &&
      !pendingDecoration.find(pd => pd._id === item._id))
  }
  return nextItem
}

export function * decorateItem (i) {
  let item = { ...i }
  let imageStuff = {}
  // external items come through here before they have any styles
item.styles = item.styles ? { ...item.styles } : {}
  let items = Platform.OS === 'web' ?
    yield call(getItemsIDB, [item]) :
    yield call (getItemsSQLite, [item])
  item = items.length ? items[0] : item
  const mercuryStuff = yield call(loadMercuryStuff, item)
  if (!mercuryStuff) {
    return false
  }

  // consoleLog(`Loading Mercury stuff for ${item._id} done`)
  if (mercuryStuff.lead_image_url) {
    if (Platform.OS !== 'web') {
      let coverImageFile = yield call (cacheCoverImage, item, mercuryStuff.lead_image_url)
      if (coverImageFile) {
        try {
          const imageDimensions = yield call(getImageDimensions, getCachedCoverImagePath(item))
          const faceCentreNormalised = yield call(faceDetection, coverImageFile, imageDimensions)
          imageStuff = {
            coverImageFile,
            imageDimensions,
            faceCentreNormalised
          }
        } catch (error) {
          consoleLog(error)
        }
      }
      if (imageStuff.faceCentreNormalised) {
        const { x, y } = imageStuff.faceCentreNormalised
        const hAlign = x < 0.333 ? 'left' :
          x < 0.666 ? 'center' : 'right'
        const vAlign = y < 0.5 ? 'bottom' : 'top'
        setCoverAlign(hAlign, item.styles)
        setTitleVAlign(vAlign, item.styles)
      }
    }

    if (!!item.title &&
      ((
        Math.random() > 0.5 /*&&
        imageStuff.imageDimensions?.height < imageStuff.imageDimensions?.width / 1.8*/
      ) || mercuryStuff.excerpt && mercuryStuff.excerpt.length > 180)) {
      if (item.styles) {
        item.styles = setCoverInline(item.styles)
      }
      item.showCoverImage = true
    }
  }


  return {
    item,
    mercuryStuff,
    imageStuff
  }
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
