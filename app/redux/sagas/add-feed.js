import { delay } from 'redux-saga'
import { put, select } from 'redux-saga/effects'
import { addFeed } from '../backends'
import { id } from '../../utils/'

export function * subscribeToFeed (action) {
  let {feed} = action
  yield addFeed(feed.url)
  console.log(`Added feed: ${feed.title}`)
  feed._id = id()
  yield put ({
    type: 'FEEDS_ADD_FEED_SUCCESS',
    feed
  })
}
