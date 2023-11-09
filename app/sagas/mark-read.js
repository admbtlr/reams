import { InteractionManager, Platform } from 'react-native'
import { call, delay, put, select } from 'redux-saga/effects'
import { 
  CLEAR_READ_ITEMS_SUCCESS,
  ItemType,
  MARK_ITEM_READ,
  MARK_ITEMS_READ
} from '../store/items/types'
import { getReadItemsFS } from '../storage/firestore'

import { getItems, getCurrentItem, getFeeds, getDisplay, getSavedItems, getUnreadItems, getIndex } from './selectors'

import log from '../utils/log'
import { removeCachedCoverImages } from '../utils/item-utils'
import { deleteItems as deleteItemsSQLite } from '../storage/sqlite'
import { deleteItems as deleteItemsIDB } from '../storage/idb-storage'

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
  const index = yield select(getIndex, displayMode)
  let itemsToClear = readItems
    .filter(item => savedItems.find(saved => item._id === saved._id) === undefined)
    .filter(item => currentItem && (item._id !== currentItem._id))
  // this is an unfortunate parallel of the logic in the items reducer (maintainCarouselItems)
  const carouselled = items
    .slice(index - 1 < 0 ? 0 : index - 1, index + 1 > items.length ? items.length : index + 1)
  itemsToClear = itemsToClear.filter(item => carouselled.find(i => i._id === item._id) === undefined)

  yield call(InteractionManager.runAfterInteractions)
  try {
    if (Platform.OS === 'web') {
      yield call(deleteItemsIDB, itemsToClear)
    } else {
      yield call(deleteItemsSQLite, itemsToClear)
    }
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
