import { InteractionManager, Platform } from 'react-native'
import { call, put, select } from 'redux-saga/effects'
import { PRUNE_UNREAD, SET_SAVED_ITEMS } from '../store/items/types'

import { getItems, getConfig, getSavedItems, getUnreadItems } from './selectors'

import log from '../utils/log'
import { removeCachedCoverImages } from '../utils/item-utils'
import { deleteItems as deleteItemsSQLite } from '../storage/sqlite'
import { deleteItems as deleteItemsIDB } from '../storage/idb-storage'

const MAX_UNREAD = 1000

export function * pruneItems (action) {
  const type = (action && action.itemType) || 'unread'
  if (type !== 'unread') return
  const config = yield select(getConfig)
  const unreadItems = yield select(getItems)
  const toPrune = unreadItems.slice(MAX_UNREAD)
  if (toPrune.length === 0) return

  yield call(InteractionManager.runAfterInteractions)
  yield put({
    type: PRUNE_UNREAD,
    maxItems: MAX_UNREAD,
    itemSort: config.itemSort,
    prunedItems: toPrune.map(item => ({
      _id: item._id,
      feed_id: item.feed_id,
      title: item.title
    }))
  })
  yield call(InteractionManager.runAfterInteractions)
  removeItems({ items: toPrune })
}

export function * removeItems (action) {
  const items = action.items
  yield call(InteractionManager.runAfterInteractions)
  const savedItems = yield select(getSavedItems)
  const itemsToClear = items
    .filter(item => savedItems.find(saved => item._id === saved._id) === undefined)
  yield doRemoveItems(itemsToClear)
}

export function * removeAllItems () {
  yield call(InteractionManager.runAfterInteractions)
  yield doRemoveItems()
}

function * doRemoveItems (items) {
  console.log('Inside doRemoveItems')
  try {
    if (Platform.OS === 'web') {
      yield call(deleteItemsIDB, items)
    } else {
      yield call(deleteItemsSQLite, items)
    }
  console.log('doRemoveItems completed')
  } catch(err) {
    log('deleteItems', err)
  }
  if (items) {
    removeCachedCoverImages(items)
  }
}

// trying to remediate a bug with duplidated saved items
export function * dedupeSaved () {
  const savedItems = yield select(getSavedItems)
  let deduped = []
  savedItems.forEach((e) => {
    if (deduped.filter(di => di._id === e._id).length === 0) {
      deduped.push(e)
    }
  })
  if (deduped.length !== savedItems.length) {
    yield put({
      type: SET_SAVED_ITEMS,
      items: deduped
    })
  }
}