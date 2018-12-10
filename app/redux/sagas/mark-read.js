import { delay } from 'redux-saga'
import { put, select } from 'redux-saga/effects'
import { markItemRead } from '../backends'
import { removeItems } from '../firestore'

import { getItems, getCurrentItem, getFeeds, getDisplay } from './selectors'

export function * markLastItemRead (action) {
  yield delay (100)
  const display = yield select(getDisplay)
  if (display !== 'unread' || !action.lastIndex) {
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

export function * clearReadItems () {
  // TODO figure out a query on readAt to remove read items
  // yield removeItems()
}