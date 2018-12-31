import { put, select } from 'redux-saga/effects'
import { getUid } from './selectors'
import { getCollection } from '../firestore'
import { deflateItem } from '../../utils/item-utils'

export function * rehydrateItems (getFirebase, uid) {
  const readItems = yield getCollection('items-read', 'created_at', false, true)
  yield put({
    type: 'ITEMS_REHYDRATE_READ',
    items: readItems
  })

  const savedItems = yield getCollection('items-saved', 'created_at', false)
  yield put({
    type: 'ITEMS_REHYDRATE_SAVED',
    items: savedItems
  })
}

