let uid
let db

export function setUid (userId) {
  uid = userId
}

export function setDb (firebaseDb) {
  db = firebaseDb
}

function getUserDb () {
  return db.collection('users').doc(uid)
}

export function getItemsFromFirestore (items) {
  let promises = []
  for (var i = 0; i < items.length; i++) {
    promises.push(getItemFromFirestore(items[i]._id))
  }
  return Promise.all(promises)
    .then(items => items)
}

function getItemFromFirestore (_id) {
  return db.doc(`users/${uid}/items-unread/${_id}`).get()
    .then(ds => {
      const data = ds.data()
      return data
    })
    .catch(err => {
      console.log(err)
    })
}

export function updateItemInFirestore (item) {
  const docRef = getUserDb().collection('items-unread').doc(item._id)
  return docRef.update(item)
    .then(item => item)
    .catch(e => {
      console.log(e)
    })
}

export function addUnreadItemsToFirestore (items) {
  const itemsCollection = getUserDb().collection('items-unread')
  for (var i = 0; i < items.length; i++) {
    itemsCollection.doc(items[i]._id).set(items[i])
      .then(items => {
        console.log('Added unread items')
      })
      .catch(e => {
        console.log(e)
      })
  }
}

export function removeUnreadItem (item) {
  return getUserDb().collection('items-unread').doc(item._id).delete()
    .then(item => {
      console.log('Removed unread item')
      return item
    })
    .catch(e => {
      console.log(e)
    })
}

export function addReadItem (item) {
  return getUserDb().collection('items-read').doc(item._id)
    .set({
      _id: item._id,
      feed_id: item.feed_id,
      title: item.title
    })
    .then(item => {
      console.log('Added read item')
      return item
    })
    .catch(e => {
      console.log(e)
    })
}

export function addSavedItemToFirestore (item) {
  return getUserDb().collection('items-saved').doc(item._id)
    .set(item)
    .then(item => {
      console.log('Added saved item')
      return item
    })
    .catch(e => {
      console.log(e)
    })
}

export function getCollection (collectionName, orderBy = 'created_at', fromCache) {
  const path = `users/${uid}/${collectionName}`
  let getOptions = {}
  if (fromCache) getOptions.source = 'cache'

  let firstCall
  if (fromCache) {
    firstCall = db.disableNetwork()
      .then(() => db.collection(path).orderBy(orderBy).get(getOptions))
  } else {
    firstCall = db.collection(path).orderBy(orderBy).get(getOptions)
  }

  return firstCall
    .then(qs => {
      let items = []
      qs.forEach(ds => {
        items.push(ds.data())
      })
      return items
    })
    .catch(e => {
      console.log('FIRESTORE ERROR: ' + e)
    })
}
