import { InteractionManager } from 'react-native'
import { call, put, select } from 'redux-saga/effects'
import { deleteItemsAS } from '../async-storage'

import { getItems, getConfig, getSavedItems, getUnreadItems } from './selectors'

import log from '../../utils/log'
import { removeCachedCoverImages } from '../../utils/item-utils'

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
    type: 'ITEMS_PRUNE_UNREAD',
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
  yield * doRemoveItems(itemsToClear)
}

export function * removeAllItems () {
  yield call(InteractionManager.runAfterInteractions)
  const savedItems = yield select(getSavedItems)
  const unreadItems = yield select(getUnreadItems)
  const itemsToClear = savedItems.concat(unreadItems)
  yield * doRemoveItems(itemsToClear)
}

function * doRemoveItems (items) {
  try {
    yield call(deleteItemsAS, items)
  } catch(err) {
    log('deleteItemsAS', err)
  }
  removeCachedCoverImages(items)
}