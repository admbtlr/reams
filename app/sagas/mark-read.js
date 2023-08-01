import { InteractionManager } from 'react-native'
import { call, delay, put, select } from 'redux-saga/effects'
import { 
  CLEAR_READ_ITEMS_SUCCESS,
  MARK_ITEM_READ,
  MARK_ITEMS_READ
} from '../store/items/types'
import { getReadItemsFS } from '../storage/firestore'

import { getItems, getCurrentItem, getFeeds, getDisplay, getSavedItems, getUnreadItems } from './selectors'

import log from '../utils/log'
import { removeCachedCoverImages } from '../utils/item-utils'
import { deleteItems } from '../storage/sqlite'

export function * markLastItemRead (action) {
  yield call(InteractionManager.runAfterInteractions)
  if (typeof(action.lastIndex) === 'undefined') {
    return
  }
  const lastIndex = action.lastIndex
  const unreadItems = yield select(getItems)
  const item = unreadItems[lastIndex]
  yield call(InteractionManager.runAfterInteractions)
  yield put ({
    type: MARK_ITEM_READ,
    item: {
      _id: item._id,
      feed_id: item.feed_id,
      title: item.title,
      id: item.id
    }
  })
}

export function * markItemsRead (action) {
  yield delay(500)
  yield call(InteractionManager.runAfterInteractions)
  const display = yield select(getDisplay)
  if (display !== 'unread' || typeof(action.lastIndex) === 'undefined') {
    return
  }
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
    .filter(item => currentItem && (item._id !== currentItem._id))
  if (currentItem) {
    itemsToClear = itemsToClear.filter(item => item._id !== currentItem._id)
  }

  yield call(InteractionManager.runAfterInteractions)
  try {
    yield deleteItems(itemsToClear)
  } catch(err) {
    log('deleteItems', err)
  }

  yield call(InteractionManager.runAfterInteractions)
  yield put({
    type: CLEAR_READ_ITEMS_SUCCESS
  })
  removeCachedCoverImages(itemsToClear)
}

// called when the Firestore read items cache has been initialised
export function * filterItemsForRead () {
  const items = yield select(getUnreadItems)
  const readItemsObj = getReadItemsFS()
  const itemsToMarkRead = items.filter(item => readItemsObj[item._id] !== undefined)
  yield put({
    type: MARK_ITEMS_READ,
    items: itemsToMarkRead.map(i => ({
      _id: i._id,
      id: i.id,
      feed_id: i.feed_id
    }))
  })
}
