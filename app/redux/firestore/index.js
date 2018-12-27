import { deflateItem } from '../../utils/item-utils'

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

export function getItemsFS (items) {
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

export async function incrementUnreadCountFS (increment) {
  const unreadDoc = await getUserDb().get()
  const numUnread = unreadDoc.get('number_unread')
  unreadDoc.ref.update({
    'number_unread': numUnread + increment
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

export async function deleteReadItemsFromFirestore () {
  const readItemsSnapshot = await getUserDb()
    .collection('items-unread')
    .where('readAt', '>', 0)
    .get()
  const readItems = readItemsSnapshot.docs
  const numRead = readItems.length
  readItems.forEach(doc => {
    doc.ref.delete()
  })
  incrementUnreadCountFS(0 - numRead)
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

export function addReadItemToFirestore (item) {
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

export function addFeedToFirestore (feed) {
  const collectionRef = getUserDb().collection('feeds')
  return upsertFeed(feed, collectionRef)
}

function upsertFeed (feed, collectionRef) {
  return collectionRef.doc(feed._id)
    .set(feed)
    .then(feed => {
      console.log('Upserted feed')
      return feed
    })
    .catch(e => {
      console.log('Error upserting feed: ' + e)
    })
}

export async function upsertFeedsFS (feeds) {
  const collectionRef = getUserDb().collection('feeds')
  for (feed of feeds) {
    await upsertFeed(feed, collectionRef)
  }
}

export function getCollection (collectionName, orderBy = 'created_at', fromCache, deflate) {
  const path = `users/${uid}/${collectionName}`
  let getOptions = {}
  let data
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
        data = ds.data()
        if (deflate) {
          data = deflateItem(data)
        }
        items.push(data)
      })
      return items
    })
    .catch(e => {
      console.log('FIRESTORE ERROR: ' + e)
    })
}
