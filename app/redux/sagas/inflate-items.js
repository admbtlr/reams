import { put, select } from 'redux-saga/effects'

import { deflateItem, isInflated } from '../../utils/item-utils'
import { getUnreadItems, getUid } from './selectors'

export function * inflateItems (getFirebase, action) {
  const db = getFirebase().firestore()
  // there's an issue with the index getting setting to undefined at init
  // no idea why
  const index = action.index || 0
  const items = yield select(getUnreadItems)
  let inflatedItems = items.filter(isInflated)
  let activeItems = [
    items[index]
  ]
  if (index > 0) activeItems.push(items[index - 1])
  if (index < items.length - 1) activeItems.push(items[index + 1])

  const itemsToDeflate = inflatedItems.filter(item => activeItems.indexOf(item) === -1)
  let itemsToInflate = activeItems.filter(item => inflatedItems.indexOf(item) === -1)

  try {
    itemsToInflate = yield getItemsFromFirestore(itemsToInflate)
    yield put({
      type: 'ITEMS_FLATE',
      itemsToInflate,
      itemsToDeflate
    })
  } catch (err) {
    console.log('Error inflating items: ' + err)
  }

  function * getItemsFromFirestore (items) {
    let firestoreItems = []
    let item
    for (var i = 0; i < items.length; i++) {
      item = yield getItemFromFirestore(items[i]._id)
      firestoreItems.push(item)
    }
    return firestoreItems
  }

  function * getItemFromFirestore (_id) {
    const uid = yield select(getUid)
    const documentRef = yield db.doc(`users/${uid}/items-unread/${_id}`)
    const documentSnapshot = yield documentRef.get()
    return documentSnapshot.data()
  }
}
