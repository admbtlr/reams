import { put, select } from 'redux-saga/effects'
import { getUid } from './selectors'

export function rehydrateItems (getFirebase) {
  const db = getFirebase().firestore()
  window.db = db
  const getOptions = {
    source: 'cache'
  }
  getCollectionFromFirestore()

  // const uid = yield select(getUid)
  // // try {
  //   const items = yield getCollectionFromFirestore('items-unread')
  //   yield put({
  //     type: 'ITEMS_REHYDRATE_UNREAD',
  //     items
  //   })
    // let collection = yield db.collection(`users/${uid}/items-unread`)
    // console.log(collection)
    // let querySnapshot = yield collection.get(getOptions)
    // querySnapshot.docs.forEach(doc => {
    //   items.push(doc.data())
    // })
    // yield put({
    //   type: 'ITEMS_REHYDRATE_UNREAD',
    //   items
    // })
    // let querySnapshot = yield db.collection('users')
    //   .doc(uid)
    //   .collection('items-unread')
    //   .get()
    // console.log(querySnapshot)
    // querySnapshot.docs.forEach(doc => {
    //   items.push(doc.data())
    // })
    // console.log('Promise done')
    // console.log(items)

  // } catch (err) {
  //   console.log('Error rehydrating unread items: ' + err)
  // }

  // let savedItems = []
  // try {
  //   const savedItems = yield db.collection(`users/${uid}/items-saved`)
  //     .get(getOptions)
  //     .then(querySnapshot => {
  //       querySnapshot.docs.forEach(doc => {

  //         savedItems.push(doc.data())
  //       })
  //     })
  //   yield put({
  //     type: 'ITEMS_REHYDRATE_SAVED',
  //     items: savedItems
  //   })
  // } catch (err) {
  //   console.log('Error rehydrating saved items: ' + err)
  // }
  function getCollectionFromFirestore (collectionName) {
    let items = []
    // const uid = yield select(getUid)
    const uid = 'SSh8TApFBHOl3UaEaGSpmFUaHr92'
    const path = `users/${uid}/${collectionName}`
    console.log(path)
    db.collection(path).get()
      .then(qs => qs.docs)
      .then(items => {
        items.forEach(item => {
          console.log(item)
        })
      })
    // const collectionRef = db.collection(path)
    // const querySnapshot = yield collectionRef.get()
    // const documentSnapshots = querySnapshot.docs()
    // const collectionRef = db.collection(path)
    // const querySnapshot = yield collectionRef.get()
    // const documentSnapshots = querySnapshot.docs()
    // for (var i = 0; i < documentSnapshots.length; i++) {
    //   items.push(documentSnapshots[i])
    // }
    return items
  }

}

