import { delay } from 'redux-saga'
import { call, put, select } from 'redux-saga/effects'
import { InteractionManager } from 'react-native'
import { addFeed, getFeedDetails } from '../backends'
import { id, getFeedColor } from '../../utils/'
import feeds from '../../utils/seedfeeds.js'
import { addFeedToFirestore, getFeedsFS, upsertFeedsFS } from '../firestore/'
const { desaturated } = require('../../utils/colors.json')
const RNFS = require('react-native-fs')

import { getFeeds, getIndex, getItems, isFirstTime } from './selectors'

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
  let feedId = action.id
  const index = select(getIndex)
  const items = select(getItems)
  const olderThan = action.olderThan || Date.now()
  currentItem = items[index]
  // if no feedId specified, then we mean ALL items
  const isInFeed = (item) => feedId ? item.feed_id === feedId : true
  items = [ ...state.items ].filter((item) => {
    return isInFeed(item) ?
      (item.created_at > olderThan) :
      true
  })

  yield put ({
    type: 'ITEMS_MARK_READ',
    items
  })
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
    if (feed.inflated) continue
    const details = yield call(getFeedDetails, feed)
    const inflatedFeed = {
      ...feed,
      ...details,
      inflated: true
    }
    yield call(InteractionManager.runAfterInteractions)
    yield put({
      type: 'FEEDS_UPDATE_FEED',
      feed: inflatedFeed
    })
    if (inflatedFeed.favicon) {
      const fileName = yield call(cacheFeedFavicon, inflatedFeed)
      yield call(InteractionManager.runAfterInteractions)
      yield put({
        type: 'FEED_CACHED_FAVICON',
        cachedFaviconPath: fileName
      })
    }
  }
}

function cacheFeedFavicon (feed) {
  const url = feed.favicon.url
    || (feed.url.endsWith('/')
      ? feed.url + feed.favicon.path.substring(1)
      : feed.url + feed.favicon.path)
  // making a big assumption that this is a png...
  const fileName = `${RNFS.DocumentDirectoryPath}/feed-icons/${feed._id}.png`
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
