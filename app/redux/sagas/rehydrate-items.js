import { put, select } from 'redux-saga/effects'
import { getUid } from './selectors'
import { getCollection } from '../firestore'
import { deflateItem } from '../../utils/item-utils'

export function * rehydrateItems (getFirebase, uid) {
  const unreadItems = yield getCollection('items-unread', 'created_at', true, true)
  yield put({
    type: 'ITEMS_REHYDRATE_UNREAD',
    items: unreadItems
  })

  const savedItems = yield getCollection('items-saved', 'created_at', true)
  yield put({
    type: 'ITEMS_REHYDRATE_SAVED',
    items: savedItems
  })
}

