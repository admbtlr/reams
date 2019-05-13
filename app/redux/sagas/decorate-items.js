import { delay } from 'redux-saga'
import { call, put, takeEvery, select, spawn } from 'redux-saga/effects'
import { loadMercuryStuff } from '../backends'
const RNFS = require('react-native-fs')
import { Image, InteractionManager } from 'react-native'
import { getCachedImagePath } from '../../utils'
import { deflateItem } from '../../utils/item-utils'
import log from '../../utils/log'
const co = require('co')

import { getIndex, getItems, getCurrentItem, getDisplay, getFeeds } from './selectors'
import { updateItemAS } from '../async-storage'

let pendingDecoration = [] // a local cache
let toDispatch = []

const showLogs = false

export function * decorateItems (action) {
  let items
  let item
  let count = 0

  // this is weird... but it was the only way I could dispatch actions
  // it's not possible from within the co call below
  yield spawn(function * () {
    let decoratedCount
    while (true) {
      yield call(delay, 300)
      const dispatchNow = [...toDispatch]
      toDispatch = []
      for (decoration of dispatchNow) {
        if (decoration.error) {
          yield call(InteractionManager.runAfterInteractions)
          yield put({
            type: 'ITEM_DECORATION_FAILURE',
            ...decoration
          })
        } else {
          yield applyDecoration(decoration)
        }
      }
    }
  })

  while (true) {
    yield call(delay, 2000)
    const nextItem = yield getNextItemToDecorate(pendingDecoration)
    if (nextItem) {
      consoleLog(`Got item to decorate: ${nextItem.title}`)
      pendingDecoration.push(nextItem)
      setTimeout(() => {
        if (!nextItem) return // somehow item can become undefined here...?
        consoleLog(`About to retrieve decoration for ${nextItem.title}`)
        return co(decorateItem(nextItem)).then((decoration) => {
          if (decoration) {
            consoleLog(`Got decoration for ${nextItem.title}`)
            toDispatch.push(decoration)
            setTimeout(() => {
              pendingDecoration = pendingDecoration.filter(pending => pending._id !== decoration.item._id)
            }, 1000)
          }
        }).catch(error => {
          consoleLog('Error decorating item, trying again next time around')
          toDispatch.push({
            error: true,
            item: {
              _id: nextItem._id
            }
          })
          pendingDecoration = pendingDecoration.filter(pending => pending._id !== nextItem._id)
        })
      }, 2000)
    }
  }
}

function consoleLog(txt) {
  if (showLogs) {
    consoleLog(txt)
  }
}

function * applyDecoration (decoration) {
  yield call(InteractionManager.runAfterInteractions)
  yield put({
    type: 'ITEM_DECORATION_SUCCESS',
    ...decoration
  })
  items = yield select(getItems)
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
    item = deflateItem(item)
    yield put({
      type: 'ITEMS_FLATE',
      itemsToInflate: [],
      itemsToDeflate: [item]
    })
  }
}

function * getNextItemToDecorate (pendingDecoration) {
  let nextItem
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
  while (feedsWithoutDecoration.length > 0 && count < feedsWithoutDecoration.length && !nextItem) {
    feed = feedsWithoutDecoration[count++]
    nextItem = items.find(i => !i.readAt &&
      i.feed_id === feed._id &&
      !i.hasLoadedMercuryStuff &&
      !pendingDecoration.find(pd => pd._id === i._id))
  }
  if (!nextItem) {
    const candidateItems = items.filter(item => {
      return !item.hasLoadedMercuryStuff &&
        (!item.decoration_failures || item.decoration_failures < 5) &&
        !item.readAt &&
        items.indexOf(item) >= index &&
        items.indexOf(item) < index + 20
    })
    if (candidateItems.length) {
      nextItem = candidateItems.find(item => !item.hasLoadedMercuryStuff
        && !pendingDecoration.find(pd => pd._id === item._id))
    }
  }
  return nextItem
}

function * loadMercuryForItem (item) {
  return yield loadMercuryStuff(item)
}

export function * decorateItem(item) {
  let imageStuff = {}
  consoleLog(`Loading Mercury stuff for ${item._id}...`)
  const mercuryStuff = yield loadMercuryForItem(item)
  consoleLog(`Loading Mercury stuff for ${item._id} done`)

  if (!mercuryStuff) {
    return false
  }

  if (mercuryStuff.lead_image_url) {
    let hasCoverImage = yield cacheCoverImage(item, mercuryStuff.lead_image_url)
    if (hasCoverImage) {
      try {
        const imageDimensions = yield getImageDimensions(item)
        imageStuff = {
          hasCoverImage,
          imageDimensions
        }
      } catch (error) {
        consoleLog(error)
      }
    }
  }

  return {
    item,
    mercuryStuff,
    imageStuff
  }
}

function cacheCoverImage (item, imageURL) {
  const splitted = imageURL.split('.')
  // const extension = splitted[splitted.length - 1].split('?')[0].split('%')[0]
  // making a big assumption on the .jpg extension here...
  // and it seems like Image adds '.png' to a filename if there's no extension
  const fileName = getCachedImagePath(item)
  // consoleLog(`Loading cover image for ${item._id}...`)
  return RNFS.downloadFile({
    fromUrl: imageURL,
    toFile: fileName
  }).promise.then((result) => {
    // consoleLog(`Downloaded file ${fileName} from ${imageURL}, status code: ${result.statusCode}, bytes written: ${result.bytesWritten}`)
    // consoleLog(`Loading cover image for ${item._id} done`)
    return true
  }).catch((err) => {
    consoleLog(`Loading cover image for ${item._id} failed :(`)
    consoleLog(err)
    return false
  })
}

function getImageDimensions (item) {
  return new Promise((resolve, reject) => {
    Image.getSize(`file://${getCachedImagePath(item)}`, (imageWidth, imageHeight) => {
      resolve({
        width: imageWidth,
        height: imageHeight
      })
    }, (error) => {
      consoleLog(error)
      reject(error)
    })
  })
}

