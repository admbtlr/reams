import { InteractionManager } from 'react-native'
import { call, put, select } from 'redux-saga/effects'
import { deleteItemsAS } from '../async-storage'

import { getItems, getConfig } from './selectors'

import log from '../../utils/log'
import { removeCachedCoverImages } from '../../utils/item-utils'

export function * pruneItems (action) {
  if (action.itemType !== 'unread') return
  const config = yield select(getConfig)
  const MAX_UNREAD = config.itemSort === 'rizzlewards' ?
    1000 :
    5000
  yield put({
    type: 'ITEMS_PRUNE_UNREAD_ITEMS',
    maxItems: MAX_UNREAD,
    itemSort: config.itemSort
  })
  const unreadItems = yield select(getItems)
  const toPrune = unreadItems.slice(MAX_UNREAD)
  if (toPrune.length === 0) return

  yield call(InteractionManager.runAfterInteractions)
  try {
    yield call(deleteItemsAS, toPrune)
  } catch(err) {
    log('deleteItemsAS', err)
  }
  removeCachedCoverImages(toPrune)
}
