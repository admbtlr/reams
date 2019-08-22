import { delay } from 'redux-saga'
import { call, put, select } from 'redux-saga/effects'
import { InteractionManager } from 'react-native'
import { addFeed, getFeedDetails } from '../backends'
import { id, getFeedColor, getImageDimensions } from '../../utils/'
import feeds from '../../utils/seedfeeds.js'
import { addFeedToFirestore, getFeedsFS, upsertFeedsFS } from '../firestore/'
const { desaturated } = require('../../utils/colors.json')
const RNFS = require('react-native-fs')

import { getFeeds, getIndex, getItems, getUnreadItems, isFirstTime } from './selectors'
import log from '../../utils/log'

function * prepareAndAddFeed (feed) {
  const feeds = yield select(getFeeds)
  if (feeds.find(f => (f.url && f.url === feed.url) ||
    (f._id && f._id === feed._id))) return
  yield addFeed(feed.url)
  console.log(`Added feed: ${feed.title}`)
  feed._id = feed._id || id()
  feed.color = getFeedColor(feeds)
  return feed
}

export function * subscribeToFeed (action) {
  let {feed} = action
  const addedFeed = yield prepareAndAddFeed(feed)
  if (!addedFeed) return

  // no need to wait until this has completed...
  addFeedToFirestore(addedFeed)

  yield put ({
    type: 'FEEDS_ADD_FEED_SUCCESS',
    addedFeed
  })
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

export function * syncFeeds () {
  const feeds = yield select(getFeeds)
  const dbFeeds = yield getFeedsFS()
  dbFeeds.forEach(dbFeed => {
    if (!feeds.find(feed => feed._id === dbFeed._id ||
      feed.url === dbFeed.url)) {
      feeds.push(dbFeed)
    }
  })
  yield put ({
    type: 'FEEDS_UPDATE_FEEDS',
    feeds
  })
}

export function * inflateFeeds () {
  const feeds = yield select(getFeeds)
  for (let feed of feeds) {
    yield call(delay, (typeof __TEST__ === 'undefined') ? 500 : 10)
    if (feed.isInflated) continue
    const details = yield call(getFeedDetails, feed)
    const inflatedFeed = {
      ...feed,
      ...details,
      isInflated: true
    }
    yield call(InteractionManager.runAfterInteractions)
    yield put({
      type: 'FEEDS_UPDATE_FEED',
      feed: inflatedFeed
    })
    if (inflatedFeed.favicon) {
      try {
        const fileName = yield call(cacheFeedFavicon, inflatedFeed)
        const dimensions = yield call(getImageDimensions, fileName)
        yield call(InteractionManager.runAfterInteractions)
        yield put({
          type: 'FEED_SET_CACHED_FEED_ICON',
          cachedIconPath: fileName,
          dimensions,
          id: inflatedFeed._id
        })
      } catch (error) {
        log(`Error downloading icon for ${inflatedFeed.url}: ${error.message}`)
      }
    }
  }
}

function cacheFeedFavicon (feed) {
  const host = feed.link.split('?')[0]
  const path = feed.favicon.path
  const url = path.startsWith('//') ?
    `https:${path}` :
    (host.endsWith('/')
      ? host + feed.favicon.path.substring(1)
      : host + feed.favicon.path)
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

export async function * subscribeToFeeds (action) {
  let {feeds} = action
  let addedFeeds = []
  for (var i = 0; i < feeds.length; i++) {
    let f = yield prepareAndAddFeed(feeds[i])
    if (f) addedFeeds.push(f)
  }

  upsertFeedsFS(addedFeeds)

  yield put({
    type: 'FEEDS_ADD_FEEDS_SUCCESS',
    addedFeeds
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