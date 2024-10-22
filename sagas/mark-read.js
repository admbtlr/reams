import { InteractionManager, Platform } from 'react-native'
import { call, delay, put, select } from 'redux-saga/effects'
import { 
  MARK_ITEM_READ,
  MARK_ITEMS_READ,
  REMOVE_ITEMS
} from '../store/items/types'
import { getReadItemsFS } from '../storage/firestore'

import { getItems, getCurrentItem, getFeeds, getDisplay, getSavedItems, getUnreadItems, getIndex } from './selectors'

import log from '../utils/log'
import { removeCachedCoverImages } from '../utils/item-utils'
import { deleteItems as deleteItemsSQLite } from '../storage/sqlite'
import { deleteItems as deleteItemsIDB } from '../storage/idb-storage'

export function * markLastItemReadIfUndecorated (action) {
  yield call(InteractionManager.runAfterInteractions)
  if (typeof(action.lastIndex) === 'undefined') {
    return
  }
  const lastIndex = action.lastIndex
  const unreadItems = yield select(getItems)
  const item = unreadItems[lastIndex]
  if (!item.isDecorated) return
  yield call(InteractionManager.runAfterInteractions)
  yield put ({
    type: MARK_ITEM_READ,
    item: {
      _id: item._id,
      feed_id: item.feed_id,
      title: item.title,
      id: item.id,
      url: item.url
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
    // .filter(item => savedItems.find(saved => item._id === saved._id) === undefined)
    .filter(item => currentItem && (item._id !== currentItem._id))

  // need to redo this logic in the right order
  // 0. remove the current item from the list to remove (done above)
  // 1. remove from store
  // 2. remove from sqlite
  // 3. remove from filesystem

  yield call(InteractionManager.runAfterInteractions)
  yield put({
    type: REMOVE_ITEMS,
    items: itemsToClear
  })
  // everything below here is done by a saga that listens for REMOVE_ITEMS
  // implemetation in sagas/prune-items.js
  // yield call(InteractionManager.runAfterInteractions)
  // itemsToClear = itemsToClear.filter(item => savedItems.find(saved => item._id === saved._id) === undefined)
  // try {
  //   if (Platform.OS === 'web') {
  //     yield call(deleteItemsIDB, itemsToClear)
  //   } else {
  //     yield call(deleteItemsSQLite, itemsToClear)
  //   }
  // } catch(err) {
  //   log('deleteItems', err)
  // }
  // try {
  //   yield call(removeCachedCoverImages, itemsToClear)
  // } catch(err) {
  //   log('removeCachedCoverImages', err)
  // }
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
