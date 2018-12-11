import { delay } from 'redux-saga'
import { put, select } from 'redux-saga/effects'
import { markItemRead } from '../backends'
import { deleteReadItemsFromFirestore } from '../firestore'

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
  // let redux clear its read items first
  // yeah, yeah, I know
  yield delay (100)
  yield deleteReadItemsFromFirestore()

  // TODO: now remove the cached images for all the read items
  // removeCachedCoverImages(readItems)
}