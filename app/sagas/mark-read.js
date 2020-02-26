import { InteractionManager } from 'react-native'
import { call, delay, put, select } from 'redux-saga/effects'
import { 
  CLEAR_READ_IETMS_SUCCESS,
  MARK_ITEM_READ,
  MARK_ITEMS_READ
} from '../store/items/types'
import { getReadItemsFS } from '../storage/firestore'
import { deleteItemsAS } from '../storage/async-storage'

import { getItems, getCurrentItem, getFeeds, getDisplay, getSavedItems, getUnreadItems } from './selectors'

import log from '../utils/log'
import { removeCachedCoverImages } from '../utils/item-utils'

export function * markLastItemRead (action) {
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
    type: MARK_ITEM_READ,
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
    type: CLEAR_READ_IETMS_SUCCESS
  })
  removeCachedCoverImages(itemsToClear)
}

// called when the Firestore read items cache has been initialised
export function * filterItemsForFirestoreRead () {
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
