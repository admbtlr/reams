import { delay } from 'redux-saga'
import { put, select } from 'redux-saga/effects'
import { markItemRead } from '../backends'

import { getItems, getCurrentItem, getFeeds, getDisplay } from './selectors'

export function * markLastItemRead (action) {
  yield delay (100)
  const display = yield select(getDisplay)
  if (display !== 'unread') {
    return
  }
  const lastIndex = action.lastIndex
  const unreadItems = yield select(getItems)
  const item = unreadItems[lastIndex]
  yield put ({
    type: 'ITEM_MARK_READ',
    item
  })
}

// export function * itemMarkRead (item) {
//   try {
//     yield markItemRead(item)
//   } catch (error) {
//     console.log('Mark Item Read Error!')
//     yield put({
//       type: 'ITEMS_HAS_ERRORED',
//       hasErrored: true
//     })
//   }
// }

// export function * feedMarkRead (feed) {
//   try {
//     yield put({
//       type: 'FEED_MARK_READ',
//       feed
//     })
//     yield markFeedRead(feed)
//   } catch (error) {
//     console.log('Mark Feed Read Error!')
//   }
// }