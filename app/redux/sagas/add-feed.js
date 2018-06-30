import { delay } from 'redux-saga'
import { put, select } from 'redux-saga/effects'
import { addFeed } from '../backends'
import { id } from '../../utils/'
const { desaturated } = require('../../utils/colors.json')

import { getFeeds } from './selectors'

export function * subscribeToFeed (action) {
  let {feed} = action
  const feeds = yield select(getFeeds)
  if (feeds.find(f => f.url === feed.url)) return
  yield addFeed(feed.url)
  console.log(`Added feed: ${feed.title}`)
  feed._id = id()
  const colorNames = Object.keys(desaturated)
  feed.color = colorNames[Math.floor(Math.random() * colorNames.length)]
  yield put ({
    type: 'FEEDS_ADD_FEED_SUCCESS',
    feed
  })
}
