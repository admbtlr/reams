import { put, select } from 'redux-saga/effects'
import { getUid } from './selectors'
import { getCollection } from '../firestore'

export function * rehydrateItems (getFirebase, uid) {
  const unreadItems = yield getCollection('items-unread', true)
  yield put({
    type: 'ITEMS_REHYDRATE_UNREAD',
    items: unreadItems
  })

  const savedItems = yield getCollection('items-saved', true)
  yield put({
    type: 'ITEMS_REHYDRATE_SAVED',
    items: savedItems
  })
}

