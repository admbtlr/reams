import { delay } from 'redux-saga'
import { put, select } from 'redux-saga/effects'
import { addFeed } from '../backends'

import { getItems, getCurrentItem, getFeeds, getDisplay } from './selectors'

export function * addFeedUrl (action) {
  yield addFeed(action.url)
  console.log(`Added feed: ${action.url}`)
  yield put ({
    type: 'FEEDS_FEED_ADDED',
    url: action.url
  })
}
