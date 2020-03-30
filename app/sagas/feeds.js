import { call, delay, put, select } from 'redux-saga/effects'
import { InteractionManager } from 'react-native'
import { 
  CLEAR_READ_ITEMS,
  MARK_ITEMS_READ,
  REMOVE_ITEMS 
} from '../store/items/types'
import {
  ADD_FEED_SUCCESS,
  ADD_FEEDS_SUCCESS,
  CACHE_FEED_ICON_ERROR,
  REFRESH_FEED_LIST,
  SET_CACHED_FEED_ICON,
  UPDATE_FEED
} from '../store/feeds/types'
import { addFeed, fetchFeeds, getFeedDetails, isRizzleBasic, removeFeed, updateFeed } from '../backends'
import { id, getFeedColor, getImageDimensions } from '../utils'
import { hexToHsl, rgbToHsl } from '../utils/colors'
import feeds from '../utils/seedfeeds.js'
const RNFS = require('react-native-fs')

import { getConfig, getFeeds, getFeedsLocal, getIndex, getItems, getUnreadItems, isFirstTime } from './selectors'

function * prepareAndAddFeed (feed) {
  const feeds = yield select(getFeeds)
  if (feeds.find(f => (f.url && f.url === feed.url) ||
    (f._id && f._id === feed._id))) return
  feed._id = feed._id || id()
  feed.color = feed.color || getFeedColor()
  feed = yield addFeed(feed)
  return feed
}

export function * subscribeToFeed (action) {
  const feed = yield prepareAndAddFeed(action.feed)
  if (feed) {
    console.log(`Added feed: ${feed.title}`)
    yield put ({
      type: ADD_FEED_SUCCESS,
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
  if (!config.isOnline || isRizzleBasic()) return []

  let oldFeeds = yield select(getFeeds) || []
  let newFeeds = yield fetchFeeds()
  let toRemove = oldFeeds.filter(of => !newFeeds.find(nf => nf.id === of.id || nf.url === of.url))
  if (toRemove) {
    oldFeeds = oldFeeds.filter(of => !toRemove.includes(of))
  }
  newFeeds = newFeeds.filter(f => !oldFeeds
      .find(feed => feed.url === f.url || feed.id === f.id || feed._id === f._id))
  const feeds = oldFeeds.concat(newFeeds)

  yield put({
    type: REFRESH_FEED_LIST,
    feeds
  })

  if (toRemove && toRemove.length) {
    const items = yield select(getUnreadItems)
    const dirtyFeedIds = toRemove.map(f => f._id)
    const dirtyItems = items.filter(i => dirtyFeedIds.includes(i.feed_id))
    yield put({
      type: REMOVE_ITEMS,
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
      type: MARK_ITEMS_READ,
      items: itemsToMarkRead.map(i => ({
        _id: i._id,
        id: i.id,
        feed_id: i.feed_id
      }))
    })
    yield call(InteractionManager.runAfterInteractions)
    yield put({
      type: CLEAR_READ_ITEMS
    })
  } catch (error) {
    console.log(error)
  }
}

export function * inflateFeeds () {
  const feeds = yield select(getFeeds)
  for (let feed of feeds) {
    let inflatedFeed
    yield delay((typeof __TEST__ === 'undefined') ? 500 : 10)
    if (feed.inflatedDate && Date.now() - feed.inflatedDate < 1000 * 60 * 60 * 24 * 7) {
      inflatedFeed = feed
    } else if (!feed.favicon) {
      let details = yield call(getFeedDetails, feed)
      inflatedFeed = {
        ...feed,
        ...details,
        inflatedDate: Date.now()
      }
    } else {
      inflatedFeed = {
        ...feed,
        inflatedDate: Date.now()
      }
    }
    inflatedFeed = convertColorIfNecessary(inflatedFeed)
    yield call(InteractionManager.runAfterInteractions)
    yield put({
      type: UPDATE_FEED,
      feed: inflatedFeed
    })
    updateFeed(inflatedFeed)
  }
  yield cacheFeedFavicons()
}

function convertColorIfNecessary (feed) {
  let color
  if (feed.color && feed.color.indexOf('#') === 0 && feed.color.length === 7) {
    color = hexToHsl(feed.color.substring(1))
  } else if (feed.color && feed.color.indexOf('rgb') === 0) {
    let rgb = feed.color.substring(4, feed.color.length - 1).split(',')
      .map(l => l.trim())
    color = rgbToHsl(Number.parseInt(rgb[0], 10), Number.parseInt(rgb[1], 10), Number.parseInt(rgb[2], 10))
  } else if (typeof feed.color === 'object' && feed.color.length === 3) {
    color = [ ...feed.color ]
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
    ...feed,
    color: color || feed.color
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
          type: SET_CACHED_FEED_ICON,
          cachedIconPath: fileName,
          dimensions,
          id: feed._id
        })
      } catch (error) {
        // log(`Error downloading icon for ${feed.url}: ${error.message}`)
        yield put({
          type: CACHE_FEED_ICON_ERROR,
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
    let f = yield prepareAndAddFeed(action.feeds[i])
    if (f) feeds.push(f)
  }
  yield put({
    type: ADD_FEEDS_SUCCESS,
    feeds
  })
}

export function * seedFeeds () {
  const shouldSeed = yield select(isFirstTime)
  if (shouldSeed) {
    yield subscribeToFeeds({feeds})
  }
}
