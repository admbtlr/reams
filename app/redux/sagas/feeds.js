import { call, delay, put, select } from 'redux-saga/effects'
import { InteractionManager } from 'react-native'
import { addFeed, fetchFeeds, getFeedDetails, hasBackend, removeFeed, updateFeed } from '../backends'
import { id, getFeedColor, getImageDimensions } from '../../utils/'
import { hexToHsl, rgbToHsl } from '../../utils/colors'
import feeds from '../../utils/seedfeeds.js'
const { desaturated } = require('../../utils/colors.json')
const RNFS = require('react-native-fs')

import { getConfig, getFeeds, getFeedsLocal, getIndex, getItems, getUnreadItems, isFirstTime } from './selectors'
import log from '../../utils/log'

function * prepareAndAddFeed (feed) {
  const feeds = yield select(getFeeds)
  if (feeds.find(f => (f.url && f.url === feed.url) ||
    (f._id && f._id === feed._id))) return
  feed._id = feed._id || id()
  feed.color = getFeedColor()
  yield addFeed(feed)
  return feed
}

export function * subscribeToFeed (action) {
  const feed = yield prepareAndAddFeed(action.feed)
  if (feed) {
    console.log(`Added feed: ${feed.title}`)
    yield put ({
      type: 'FEEDS_ADD_FEED_SUCCESS',
      feed
    })
  }
}

export function * unsubscribeFromFeed (action) {
  // no need to wait until this has completed...
  removeFeed(action.feed)
}

export function * fetchAllFeeds () {
  const config = yield select(getConfig)
  if (!config.isOnline || !hasBackend()) return

  let oldFeeds = yield select(getFeeds) || []
  let newFeeds = yield fetchFeeds()
  let toRemove = oldFeeds.filter(of => !newFeeds.find(nf => nf.id === of.id || nf.url === of.url))
  if (toRemove) {
    oldFeeds = oldFeeds.filter(of => !toRemove.includes(of))
  }
  newFeeds = newFeeds.filter(f => !oldFeeds
      .find(feed => feed.url === f.url || feed.id === f.id || feed._id === f._id))
    .map(f => ({
      ...f,
      isNew: true
    }))
  const feeds = oldFeeds.concat(newFeeds)

  yield put({
    type: 'FEEDS_REFRESH_FEED_LIST',
    feeds
  })

  if (toRemove && toRemove.length) {
    const items = yield select(getUnreadItems)
    const dirtyFeedIds = toRemove.map(f => f._id)
    const dirtyItems = items.filter(i => dirtyFeedIds.includes(i.feed_id))
    yield put({
      type: 'ITEMS_REMOVE_ITEMS',
      items: dirtyItems
    })
  }
}

export function * markFeedRead (action) {
  try {
    const olderThan = action.olderThan || (Date.now() / 1000)
    const items = yield select(getUnreadItems)
    // if no feedId specified, then we mean ALL items
    const itemsToMarkRead = items.filter(item => (!action.id ||
      item.feed_id === action.id) &&
      item.created_at < olderThan).map(item => ({
        _id: item._id,
        feed_id: item.feed_id,
        title: item.title
      }))
    yield call(InteractionManager.runAfterInteractions)
    yield put({
      type: 'ITEMS_MARK_READ',
      items: itemsToMarkRead.map(i => ({
        _id: i._id,
        id: i.id,
        feed_id: i.feed_id
      }))
    })
    yield call(InteractionManager.runAfterInteractions)
    yield put({
      type: 'ITEMS_CLEAR_READ'
    })
  } catch (error) {
    console.log(error)
  }
}

export function * inflateFeeds () {
  const feeds = yield select(getFeeds)
  for (let feed of feeds) {
    yield delay((typeof __TEST__ === 'undefined') ? 500 : 10)
    if (feed.inflatedDate && Date.now() - feed.inflatedDate < 1000 * 60 * 60 * 24 * 7) continue
    let details = yield call(getFeedDetails, feed)
    details = convertColorIfNecessary(details)
    const inflatedFeed = {
      ...feed,
      ...details,
      inflatedDate: Date.now()
    }
    yield call(InteractionManager.runAfterInteractions)
    yield put({
      type: 'FEEDS_UPDATE_FEED',
      feed: inflatedFeed
    })
    updateFeed(inflatedFeed)
  }
  yield cacheFeedFavicons()
}

function convertColorIfNecessary (details) {
  let color
  debugger
  if (details.color && details.color.indexOf('#') === 0 && details.color.length === 7) {
    color = hexToHsl(details.color.substring(1))
  } else if (details.color && details.color.indexOf('rgb') === 0) {
    let rgb = details.color.substring(4, details.color.length - 1).split(',')
      .map(l => l.trim())
    color = rgbToHsl(Number.parseInt(rgb[0], 10), Number.parseInt(rgb[1], 10), Number.parseInt(rgb[2], 10))
  } else if (typeof details.color === 'object' && details.color.length === 3) {
    color = details.color
  } else {
    color = [Math.round(Math.random() * 360), 50, 30]
  }
  if (color[1] > 70) {
    color[1] = Math.round(30 + (color[1] - 30) / 2)
  }
  if (color[2] > 50) {
    color[2] = Math.round(30 + (color[2] - 30) / 2)
  }
  return {
    ...details,
    color: color || details.color
  }
}

function * cacheFeedFavicons () {
  const feeds = yield select(getFeeds)
  const feedsLocal = yield select(getFeedsLocal)
  for (let feed of feeds) {
    const feedLocal = feedsLocal.find(fl => fl._id === feed._id)
    const shouldCacheIcon = feedLocal ?
      !feedLocal.hasCachedIcon &&
        (feedLocal.numCachingErrors || 0) < 10 &&
        (Date.now() - (feedLocal.lastCachingError || 0)) > (1000 * 60) :
      true
    if (feed.favicon && shouldCacheIcon) {
      try {
        const fileName = yield call(downloadFeedFavicon, feed)
        const dimensions = yield call(getImageDimensions, fileName)
        yield call(InteractionManager.runAfterInteractions)
        yield put({
          type: 'FEED_SET_CACHED_FEED_ICON',
          cachedIconPath: fileName,
          dimensions,
          id: feed._id
        })
      } catch (error) {
        // log(`Error downloading icon for ${feed.url}: ${error.message}`)
        yield put({
          type: 'FEED_ERROR_CACHING_ICON',
          id: feed._id
        })
      }
    }
  }
}

function downloadFeedFavicon (feed) {
  const host = feed.link.split('?')[0]
  const path = feed.favicon.path
  let url = feed.favicon.url ||
    (path.startsWith('//') ?
      `https:${path}` :
      (host.endsWith('/')
        ? host + feed.favicon.path.substring(1)
        : host + feed.favicon.path))
  console.log(url)
  let extension = /.*\.([a-zA-Z]*)/.exec(url)[1]
  if (['png', 'jpg', 'jpeg'].indexOf(extension.toLowerCase()) === -1) {
    extension = 'png' // nnnggh
  }
  const fileName = `${RNFS.DocumentDirectoryPath}/feed-icons/${feed._id}.${extension}`
  return RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/feed-icons`).then(_ =>
    RNFS.downloadFile({
      fromUrl: url,
      toFile: fileName
    }).promise.then((result) => {
      return fileName
    })
  ).catch((err) => {
    console.log(`Loading feed favicon for ${feed._id} failed :(`)
    console.log(err)
    return false
  })
}

export function * subscribeToFeeds (action) {
  let feeds = []
  for (var i = 0; i < action.feeds.length; i++) {
    let f = yield prepareAndAddFeed(feeds[i])
    if (f) feeds.push(f)
  }
  yield put({
    type: 'FEEDS_ADD_FEEDS_SUCCESS',
    feeds
  })
}

export function * seedFeeds () {
  const shouldSeed = yield select(isFirstTime)
  if (shouldSeed) {
    yield subscribeToFeeds({feeds})
    // yield put({
    //   type: 'CONFIG_TOGGLE_FIRST_TIME',
    //   isFirstTime: false
    // })
  }
}
