import { call, delay } from 'redux-saga'
import { put, select } from 'redux-saga/effects'
import { addFeed, getFeedDetails } from '../backends'
import { id, getFeedColor } from '../../utils/'
import feeds from '../../utils/seedfeeds.js'
import { upsertFeedsFS, addFeedToFirestore } from '../firestore/'
const { desaturated } = require('../../utils/colors.json')

import { getFeeds, isFirstTime } from './selectors'

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

export function * inflateFeed () {
  const feeds = yield select(getFeeds)
  for (let i=0; i<feeds.length; i++) {
    if (!feeds[i].description) {
      const details = yield getFeedDetails(feeds[i])
    }
  }
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
