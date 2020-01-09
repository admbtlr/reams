import { InteractionManager } from 'react-native'
import { delay } from 'redux-saga'
import { call, put, select } from 'redux-saga/effects'
import { markItemRead } from '../backends'
import { getReadItemsFS } from '../firestore'
import { deleteItemsAS } from '../async-storage'

import { getItems, getCurrentItem, getFeeds, getDisplay, getSavedItems, getUnreadItems } from './selectors'

import log from '../../utils/log'
import { removeCachedCoverImages } from '../../utils/item-utils'

export function * markLastItemRead (action) {
  yield delay(2000)
  yield call(InteractionManager.runAfterInteractions)
  const display = yield select(getDisplay)
  if (display !== 'unread' || typeof(action.lastIndex) === 'undefined') {
    return
  }
  const lastIndex = action.lastIndex
  const unreadItems = yield select(getItems)
  const item = unreadItems[lastIndex]
  yield call(InteractionManager.runAfterInteractions)
  yield put ({
    type: 'ITEM_MARK_READ',
    item
  })
}

export function * markItemsRead (action) {
  yield delay(500)
  yield call(InteractionManager.runAfterInteractions)
  const display = yield select(getDisplay)
  if (display !== 'unread' || typeof(action.lastIndex) === 'undefined') {
    return
  }
  const readItems = action.items
  const items = yield select(getItems)
  const currentItem = unreadItems[lastIndex]
  yield call(InteractionManager.runAfterInteractions)
  yield put({
    type: 'ITEMS_MARK_READ_SUCCESS'
  })
}

export function * clearReadItems () {
  // yield call(InteractionManager.runAfterInteractions)
  const items = yield select(getUnreadItems)
  const savedItems = yield select(getSavedItems)
  const displayMode = yield select(getDisplay)
  const readItems = items.filter(item => !!item.readAt)
  const currentItem = yield select(getCurrentItem, displayMode)
  let itemsToClear = readItems
    .filter(item => savedItems.find(saved => item._id === saved._id) === undefined)
    .filter(item => item._id !== currentItem._id)
  if (currentItem) {
    itemsToClear = itemsToClear.filter(item => item._id !== currentItem._id)
  }

  yield call(InteractionManager.runAfterInteractions)
  try {
    yield deleteItemsAS(itemsToClear)
  } catch(err) {
    log('deleteItemsAS', err)
  }

  yield call(InteractionManager.runAfterInteractions)
  yield put({
    type: 'ITEMS_CLEAR_READ_SUCCESS'
  })
  removeCachedCoverImages(itemsToClear)
}

// called when the Firestore read items cache has been initialised
export function * filterItemsForFirestoreRead () {
  const items = yield select(getUnreadItems)
  const readItemsObj = getReadItemsFS()
  const itemsToMarkRead = items.filter(item => readItemsObj[item._id] !== undefined)
  yield put({
    type: 'ITEMS_MARK_READ',
    items: itemsToMarkRead.map(i => ({
      _id: i._id,
      id: i.id,
      feed_id: i.feed_id
    }))
  })
}
