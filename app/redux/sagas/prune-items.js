import { InteractionManager } from 'react-native'
import { call, put, select } from 'redux-saga/effects'
import { deleteItemsAS } from '../async-storage'

import { getItems, getConfig, getSavedItems } from './selectors'

import log from '../../utils/log'
import { removeCachedCoverImages } from '../../utils/item-utils'

export function * pruneItems (action) {
  if (action.itemType !== 'unread') return
  const config = yield select(getConfig)
  const MAX_UNREAD = config.itemSort === 'rizzlewards' ?
    1000 :
    5000
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
  const savedItems = yield select(getSavedItems)
  const itemsToClear = toPrune
    .filter(item => savedItems.find(saved => item._id === saved._id) === undefined)
  try {
    yield call(deleteItemsAS, itemsToClear)
  } catch(err) {
    log('deleteItemsAS', err)
  }
  removeCachedCoverImages(itemsToClear)
}
