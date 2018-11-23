import { put, select } from 'redux-saga/effects'

export function * rehydrateItems (getFirebase) {
  const db = getFirebase().firestore()
  const getOptions = {
    source: 'cache'
  }

  try {
    let items = []
    yield db.collection('items-unread').get(getOptions)
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          items.push(doc.data())
        })
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
    const savedItems = yield db.collection('items-saved').get(getOptions)
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