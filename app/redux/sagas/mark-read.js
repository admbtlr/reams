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
  try {
    yield markItemRead(item)
    yield put({
      type: 'ITEM_MARK_READ_SUCCESS',
      item,
      index: lastIndex
    })
  } catch (error) {
    console.log('Mark Item Read Error!')
    yield put({
      type: 'ITEMS_HAS_ERRORED',
      hasErrored: true
    })
  }
}

