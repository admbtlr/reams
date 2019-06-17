import { InteractionManager } from 'react-native'
import { delay } from 'redux-saga'
import { call, put, select } from 'redux-saga/effects'
import { markItemRead } from '../backends'
import { deleteItemsAS } from '../async-storage'

import { getItems, getCurrentItem, getFeeds, getDisplay, getSavedItems, getUnreadItems } from './selectors'

import log from '../../utils/log'
import { removeCachedCoverImages } from '../../utils/item-utils'

export function * markLastItemRead (action) {
  yield delay(500)
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
  const itemsToClear = readItems
    .filter(item => savedItems.find(saved => item._id === saved._id) === undefined)

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
  // now reset the index to 0
  // (this will also inflate the relevant items)
  yield call(InteractionManager.runAfterInteractions)
  yield put({
    type: 'ITEMS_UPDATE_CURRENT_INDEX',
    index: 0,
    displayMode
  })

  removeCachedCoverImages(itemsToClear)
}