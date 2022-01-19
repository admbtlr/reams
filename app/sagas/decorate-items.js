import { call, delay, put, select, spawn } from 'redux-saga/effects'
import { loadMercuryStuff } from '../backends'
const RNFS = require('react-native-fs')
import { InteractionManager } from 'react-native'
import { 
  FLATE_ITEMS,
  ITEM_DECORATION_FAILURE,
  ITEM_DECORATION_SUCCESS
} from '../store/items/types'
import { getCachedCoverImagePath, getImageDimensions } from '../utils'
import { setCoverInline, setCoverAlign, setTitleVAlign } from '../utils/createItemStyles'
import { deflateItem } from '../utils/item-utils'
import { getActiveItems } from './selectors'
import log from '../utils/log'
import { faceDetection } from '../utils/face-detection'

import {
  getIndex,
  getItems,
  getDisplay,
  getFeeds,
  getSavedItems
} from './selectors'
import { getItemsAS, updateItemAS } from '../storage/async-storage'


let pendingDecoration = [] // a local cache
let toDispatch = []

const showLogs = true

export function * decorateItems (action) {
  let items
  let item
  let count = 0

  yield spawn(function * () {
    while (true) {
      const nextItem = yield getNextItemToDecorate(pendingDecoration)
      // console.log('Looking for new item')
      if (nextItem) {
        // consoleLog(`Got item to decorate: ${nextItem.title}`)
        pendingDecoration.push(nextItem)
        yield delay(3000)
        if (!nextItem) continue // somehow item can become undefined here...?
        // consoleLog(`About to retrieve decoration for ${nextItem.title}`)
        try {
          const decoration = yield decorateItem(nextItem)
          if (decoration) {
            // consoleLog(`Got decoration for ${nextItem.title}`)
            if (decoration.mercuryStuff.error) {
              yield decorationFailed(nextItem)
            } else {
              yield applyDecoration(decoration, nextItem.isSaved)
            }
          } else {
            yield decorationFailed(nextItem)
          }
        } catch (error) {
          yield decorationFailed(nextItem)
        }
      } else {
        yield delay(3000)
      }
    }
  })
}

function * decorationFailed (item) {
  if (!item) return
  consoleLog(`Error decorating item "${item.title}", trying again next time around`)
  yield call(InteractionManager.runAfterInteractions)
  yield put({
    type: ITEM_DECORATION_FAILURE,
    item,
    isSaved: item.isSaved
  })
  pendingDecoration = pendingDecoration.filter(pending => pending._id !== item._id)
}

function consoleLog(txt) {
  if (showLogs) {
    console.log(txt)
  }
}

function * applyDecoration (decoration, isSaved) {
  yield call(InteractionManager.runAfterInteractions)
  const displayMode = yield select(getDisplay)
  yield put({
    type: ITEM_DECORATION_SUCCESS,
    ...decoration,
    isSaved,
    displayMode
  })
  const items = yield select(getItems)
  decoratedCount = items.filter((item) => item.hasLoadedMercuryStuff).length
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
      updateItemAS(item)
    } catch(err) {
      log('decorateItems', err)
    }

    // and finally, deflate the item so that redux-persist doesn't explode
    yield call(InteractionManager.runAfterInteractions)
    const activeItems = yield select(getActiveItems)
    if (!activeItems.find(ai => ai._id === item._id)) {
      item = deflateItem(item)
      yield put({
        type: FLATE_ITEMS,
        itemsToInflate: [],
        itemsToDeflate: [item]
      })
    }
  }
}

function * getNextItemToDecorate (pendingDecoration) {
  let nextItem
  const savedItems = yield select(getSavedItems)
  nextItem = savedItems.find(item => item.title === 'Loading...' &&
    (!item.decoration_failures || item.decoration_failures < 5))
  if (nextItem) return nextItem

  const items = yield select(getItems)
  const index = yield select(getIndex)
  const feeds = yield select(getFeeds)
  const feedsWithoutDecoration = feeds.filter(feed => {
    // external items handle their own decoration
    return !items.filter(i => !i.readAt && !i.is_external && i.feed_id === feed._id)
      .find(item => typeof item.banner_image !== 'undefined')
  })
  let count = 0
  let feed
  const candidateItems = items.filter(item => {
    return !item.hasLoadedMercuryStuff &&
      (!item.decoration_failures || item.decoration_failures < 3) &&
      !item.readAt &&
      items.indexOf(item) >= index &&
      items.indexOf(item) < index + 20
  })
  if (candidateItems.length) {
    nextItem = candidateItems.find(item => !item.hasLoadedMercuryStuff
      && !pendingDecoration.find(pd => pd._id === item._id))
  }
  if (!nextItem) {
    while (feedsWithoutDecoration.length > 0 && count < feedsWithoutDecoration.length && !nextItem) {
      feed = feedsWithoutDecoration[count++]
      nextItem = items.find(i => !i.readAt &&
        i.feed_id === feed._id &&
        !i.hasLoadedMercuryStuff &&
        i.decoration_failures ? i.decoration_failures < 5 : true &&
        !pendingDecoration.find(pd => pd._id === i._id))
    }
  }
  return nextItem
}

export function * decorateItem (item) {
  let imageStuff = {}
  let items = yield getItemsAS([item])
  // TODO do something about this...
  // feed_color is mutable and could have changed while the item was deflated
  if (items[0]) {
    item = {
      ...items[0],
      feed_color: item.feed_color || items[0].feed_color
    }
  } else if (!item.is_external) {
    // this item is not in AS... how is that possible? in any case, bail on it
    return false
  }
  // consoleLog(`Loading Mercury stuff for ${item._id}...`)
  const mercuryStuff = yield call(loadMercuryStuff, item)
  if (!mercuryStuff) {
    return false
  }

  // consoleLog(`Loading Mercury stuff for ${item._id} done`)
  if (mercuryStuff.lead_image_url) {
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
  }

  if (imageStuff.imageDimensions && imageStuff.imageDimensions.width) {
    if (!!item.title &&
      ((
        Math.random() > 0.5 &&
        imageStuff.imageDimensions.height < imageStuff.imageDimensions.width / 1.8
      ) || mercuryStuff.excerpt && mercuryStuff.excerpt.length > 120)) {
      if (item.styles) {
        item.styles = setCoverInline(item.styles)
      }
      item.showCoverImage = true
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
  if (await RNFS.exists(fileName)) return fileName
  try {
    await RNFS.downloadFile({
      fromUrl: imageURL,
      toFile: fileName,
      begin: () => {},
      progress: () => {}
    }).promise
    return fileName
  } catch(err) {
    consoleLog(`Loading cover image for ${item._id} failed :(`)
    consoleLog(err)
    return false
  }
}
