import { call, delay, put, select } from 'redux-saga/effects'
import { InteractionManager, Platform } from 'react-native'
import { 
  CLEAR_READ_ITEMS,
  Item,
  MARK_ITEMS_READ,
  REMOVE_ITEMS 
} from '../store/items/types'
import {
  ADD_FEEDS,
  ADD_FEEDS_TO_STORE,
  CACHE_FEED_ICON_ERROR,
  Feed,
  FeedLocal,
  REMOVE_FEED,
  REMOVE_FEEDS,
  SET_CACHED_FEED_ICON,
  SET_FEEDS,
  UPDATE_FEED
} from '../store/feeds/types'
import {
  ADD_MESSAGE,
  FETCH_ITEMS,
  REMOVE_MESSAGE
} from '../store/ui/types'
import { addFeed as addFeedBackend, fetchFeeds, getFeedMeta, removeFeed, updateFeed } from '../backends'
import { id, getFeedColor, getImageDimensions } from '../utils'
import { hexToHsl, rgbToHsl } from '../utils/colors'
import feeds from '../utils/seedfeeds.js'
import * as FileSystem from 'expo-file-system'

import { getConfig, getFeeds, getFeedsLocal, getIndex, getItems, getUnreadItems, getUser } from './selectors'
import { Backend, UserState } from '../store/user/user'
import { ConfigState } from '../store/config/config'

interface FeedSkeleton {
  url: string, _id?: string, color?: number[] 
}

function * prepareAndAddFeed (feed: FeedSkeleton) {
  const currentFeeds: Feed[] = yield select(getFeeds)
  if (currentFeeds.find(f => (f.url && f.url === feed.url) ||
    (f._id && f._id === feed._id))) return
  const fullFeed: Feed = yield addFeedBackend(feed)
  return fullFeed
}

export function * subscribeToFeed (action: { feed: FeedSkeleton}) {
  const feed: Feed = yield prepareAndAddFeed(action.feed)
  if (feed) {
    console.log(`Added feed: ${feed.title}`)
    yield put ({
      type: ADD_FEEDS_TO_STORE,
      feeds: [feed]
    })
    yield put({
      type: FETCH_ITEMS,
      includeSaved: false
    })
  }
}

export function * subscribeToFeeds (action: {feeds: FeedSkeleton[]}) {
  let feeds = []
  for (var i = 0; i < action.feeds.length; i++) {
    let f: Feed = yield prepareAndAddFeed(action.feeds[i])
    if (f) feeds.push(f)
  }
  yield put({
    type: ADD_FEEDS_TO_STORE,
    feeds
  })
  yield put({
    type: FETCH_ITEMS,
    includeSaved: false
  })
}

export function * unsubscribeFromFeeds (action: {feeds: FeedSkeleton[]}) {
  for (var i = 0; i < action.feeds.length; i++) {
    yield removeFeed(action.feeds[i])
  }
}

export function * unsubscribeFromFeed (action: {feed: FeedSkeleton}) {
  // no need to wait until this has completed...
  removeFeed(action.feed)
}

export function * fetchAllFeeds () {
  const config: ConfigState = yield select(getConfig)
  if (!config.isOnline) return []

  yield put({
    type: ADD_MESSAGE,
    message: {
      messageString: 'Getting feeds',
      hasEllipsis: true
    }
  })
  let oldFeeds: Feed[] = yield select(getFeeds)
  oldFeeds = oldFeeds || []
  let newFeeds: Feed[] = yield call(fetchFeeds)
  newFeeds = newFeeds || []
  let toRemove = oldFeeds.filter(of => !newFeeds.find(nf => nf.feedbinId === of.feedbinId || nf.url === of.url))
  if (toRemove) {
    oldFeeds = oldFeeds.filter(of => !toRemove.includes(of))
  }
  newFeeds = newFeeds.filter(f => !oldFeeds
      .find(feed => feed.url === f.url || feed.feedbinId === f.feedbinId || feed._id === f._id))
  const feeds = oldFeeds.concat(newFeeds)

  if (newFeeds.length) {
    yield put({
      type: ADD_FEEDS_TO_STORE,
      feeds: newFeeds
    })
  }

  if (toRemove.length) {
    yield put({
      type: REMOVE_FEEDS,
      feeds: toRemove
    })
    const items: Item[] = yield select(getUnreadItems)
    const dirtyFeedIds = toRemove.map(f => f._id)
    const dirtyItems = items.filter(i => dirtyFeedIds.includes(i.feed_id))
    yield put({
      type: REMOVE_ITEMS,
      items: dirtyItems
    })
  }

  yield put({
    type: REMOVE_MESSAGE,
    messageString: 'Getting feeds'
  })
}

export function * markFeedRead (action: { feed: Feed, olderThan?: number }) {
  try {
    const olderThan = action.olderThan || (Date.now() / 1000)
    // @ts-ignore
    const items = yield select(getUnreadItems)
    // if no feedId specified, then we mean ALL items
    const itemsToMarkRead = items.filter((item: Item) => (!action.feed._id ||
      item.feed_id === action.feed._id) &&
      item.created_at < olderThan).map((item: Item) => ({
        _id: item._id,
        feed_id: item.feed_id,
        title: item.title
      }))
    yield call(InteractionManager.runAfterInteractions)
    yield put({
      type: MARK_ITEMS_READ,
      items: itemsToMarkRead.map((i: Item) => ({
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
  // @ts-ignore
  const feeds = yield select(getFeeds)
  for (let feed of feeds) {
    let inflatedFeed: Feed
    // @ts-ignore
    yield delay((typeof __TEST__ === 'undefined') ? 500 : 10)
    if (feed.inflatedDate && Date.now() - feed.inflatedDate < 1000 * 60 * 60 * 24 * 7) {
      inflatedFeed = { ...feed }
    } else if (!feed.favicon) {
      // @ts-ignore
      let details = yield call(getFeedMeta, feed)
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
    inflatedFeed.color = inflatedFeed.color ? convertColorIfNecessary(inflatedFeed.color) : [0, 0, 0]
    yield call(InteractionManager.runAfterInteractions)
    yield put({
      type: UPDATE_FEED,
      feed: inflatedFeed
    })
    updateFeed(inflatedFeed)
  }
  if (Platform.OS !== 'web') {
    yield cacheFeedFavicons()
  }
}

export function convertColorIfNecessary (color: string | number[]) {
  if (color && typeof color === 'string') {
    if (color.indexOf('#') === 0 && color.length === 7) {
      color = hexToHsl(color.substring(1))
    } else if (color && color.indexOf('rgb') === 0) {
      let rgb = color.substring(4, color.length - 1).split(',')
        .map(l => l.trim())
      color = rgbToHsl(Number.parseInt(rgb[0], 10), Number.parseInt(rgb[1], 10), Number.parseInt(rgb[2], 10))
    }
  } else if (typeof color === 'object' && color.length === 3) {
    color = [ ...color ]
  } else {
    color = [0, 0, 0]
  }
  // if (color[1] > 90) {
  //   color[1] = Math.round(30 + (color[1] - 30) / 2)
  // }
  // if (color[2] > 70) {
  //   color[2] = Math.round(30 + (color[2] - 30) / 2)
  // }
  return color
}

function * cacheFeedFavicons () {
  // @ts-ignore
  const feeds: Feed[] = yield select(getFeeds)
  // @ts-ignore
  const feedsLocal: FeedLocal[] = yield select(getFeedsLocal)
  for (let feed of feeds) {
    const feedLocal = feedsLocal.find((fl: FeedLocal) => fl._id === feed._id)
    const shouldCacheIcon = feedLocal ?
      !feedLocal.hasCachedIcon &&
        (feedLocal.numCachingErrors || 0) < 10 &&
        (Date.now() - (feedLocal.lastCachingError || 0)) > (1000 * 60) :
      true
    if (feed.favicon && shouldCacheIcon) {
      try {
        // @ts-ignore
        const fileName = yield call(downloadFeedFavicon, feed)
        // @ts-ignore
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

function downloadFeedFavicon (feed: Feed) {
  const host = feed.rootUrl.split('?')[0]
  const path = feed.favicon?.path
  let url = feed.favicon?.url ||
    (path.startsWith('//') ?
      `https:${path}` :
      (host.endsWith('/')
        ? host + feed.favicon?.path.substring(1)
        : host + feed.favicon?.path))
  console.log(url)
  const regEx = /.*\.([a-zA-Z]*)/.exec(url)
  let extension = regEx && regEx.length > 1 ? regEx[1] : ''
  if (extension && ['png', 'jpg', 'jpeg'].indexOf(extension.toLowerCase()) === -1) {
    extension = 'png' // nnnggh
  }
  const fileName = `${FileSystem.documentDirectory}feed-icons/${feed._id}.${extension}`

  return FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}feed-icons`, { intermediates: true })
    .then(_ =>
      FileSystem.downloadAsync(url, fileName).then((result) => {
        return fileName
      })
    ).catch((err) => {
      console.log(`Loading feed favicon for ${feed._id} failed :(`)
      console.log(err)
      return false
    })
}
