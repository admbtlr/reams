import { delay } from 'redux-saga'
import { put, select } from 'redux-saga/effects'
import { addFeed } from '../backends'
import { id } from '../../utils/'
import feeds from '../../utils/seedfeeds.js'
const { desaturated } = require('../../utils/colors.json')

import { getFeeds, isFirstTime } from './selectors'

function * prepareAndAddFeed (feed) {
  const feeds = yield select(getFeeds)
  if (feeds.find(f => f.url === feed.url)) return
  yield addFeed(feed.url)
  console.log(`Added feed: ${feed.title}`)
  feed._id = id()
  feed.color = getFeedColor(feeds)
  return feed
}

export function * subscribeToFeed (action) {
  let {feed} = action
  const addedFeed = prepareAndAddFeed(feed)
  if (!addedFeed) return
  yield put ({
    type: 'FEEDS_ADD_FEED_SUCCESS',
    addedFeed
  })
}

export function * subscribeToFeeds (action) {
  let {feeds} = action
  let addedFeeds = []
  for (var i = 0; i < feeds.length; i++) {
    let f = yield prepareAndAddFeed(feeds[i])
    if (f) addedFeeds.push(f)
  }
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

function getFeedColor (feeds) {
  const colorNames = Object.keys(desaturated)
  const taken = feeds.length < 12 ?
    feeds.map(feed => feed.color) :
    undefined
  let randomIndex = Math.floor(Math.random() * colorNames.length)
  while (taken && taken.indexOf(colorNames[randomIndex]) !== -1) {
    randomIndex = Math.floor(Math.random() * colorNames.length)
  }
  return colorNames[randomIndex]
}