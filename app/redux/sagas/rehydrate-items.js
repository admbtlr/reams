import { put, select } from 'redux-saga/effects'
import { getUid } from './selectors'

export function * rehydrateItems (getFirebase) {
  const db = getFirebase().firestore()
  const getOptions = {
    source: 'cache'
  }
  const uid = yield select(getUid)
  try {
    let items = []
    let collection = db.collection(`users/${uid}/items-unread`)
    let querySnapshot = yield collection.get(getOptions)
    querySnapshot.docs.forEach(doc => {
      items.push(doc.data())
    })
    yield put({
      type: 'ITEMS_REHYDRATE_UNREAD',
      items
    })
  } catch (err) {
    console.log('Error rehydrating unread items: ' + err)
  }

  let savedItems = []
  try {
    const savedItems = yield db.collection(`users/${uid}/items-saved`)
      .get(getOptions)
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          savedItems.push(doc.data())
        })
      })
    yield put({
      type: 'ITEMS_REHYDRATE_SAVED',
      items: savedItems
    })
  } catch (err) {
    console.log('Error rehydrating saved items: ' + err)
  }
}