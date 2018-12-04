let uid
let db

export function setUid (userId) {
  uid = userId
}

export function setDb (firebaseDb) {
  db = firebaseDb
}

export function getItemsFromFirestore (items) {
  let promises
  for (var i = 0; i < items.length; i++) {
    promises.push(getItemFromFirestore(items[i]._id))
  }
  return Promise.all(promises)
}

function getItemFromFirestore (_id) {
  return db.doc(`users/${uid}/items-unread/${_id}`).get()
    .then(ds => ds.data())
}

export function * addUnreadItemsToFirestore (items) {
  const itemsCollection = db.collection('users').doc(uid).collection('items-unread')
  for (var i = 0; i < items.length; i++) {
    itemsCollection.doc(items[i]._id).set(items[i])
  }
}

export function removeUnreadItem (item) {
  db.collection('items-unread').doc(item._id).delete()
}

export function addReadItem (item) {
  db.collection('items-read').doc(item._id).set(item)
}

export function getCollection (collectionName, fromCache) {
  const path = `users/${uid}/${collectionName}`
  let getOptions = {}
  if (fromCache) getOptions.source = 'cache'

  let firstCall
  if (fromCache) {
    firstCall = db.disableNetwork()
      .then(() => db.collection(path).get(getOptions))
  } else {
    firstCall = db.collection(path).get(getOptions)
  }

  return firstCall.then(qs => qs.docs)
    .catch(e => {
      console.log('FIRESTORE ERROR: ' + e)
    })
}
