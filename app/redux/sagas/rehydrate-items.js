import { call, put } from 'redux-saga/effects'
import { getCollection } from '../firestore'

export function * rehydrateSavedItemsFS (getFirebase, uid) {
  const readItems = yield call(getCollection, 'items-read', 'created_at', false, true)
  yield put({
    type: 'ITEMS_REHYDRATE_READ',
    items: readItems
  })

  // const savedItems = yield getCollection('items-saved', 'created_at', false)
  // yield put({
  //   type: 'ITEMS_REHYDRATE_SAVED',
  //   items: savedItems
  // })
}

