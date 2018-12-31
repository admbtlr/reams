// thinking about it, only saved items and read items need to go in firestore
// everything else is pretty much deterministic

import { log } from '../../utils/log'
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
    .catch(err => {
      log('getItemsFS', err)
    })
}

function getItemFromFirestore (_id) {
  return db.doc(`users/${uid}/items-unread/${_id}`).get()
    .then(ds => {
      const data = ds.data()
      return data
    })
    .catch(err => {
      log('getItemsFromFirestore', err)
    })
}

export async function incrementUnreadCountFS (increment) {
  const unreadDoc = await getUserDb().get()
  const numUnread = unreadDoc.get('number_unread')
  unreadDoc.ref.update({
    'number_unread': numUnread + increment
  })
}

export function updateItemFS (item) {
  const docRef = getUserDb().collection('items-unread').doc(item._id)
  return docRef.update(item)
    .then(item => item)
    .catch(err => {
      log('updateItemFS', err)
    })
}

export function addUnreadItemsToFirestore (items) {
  const itemsCollection = getUserDb().collection('items-unread')
  for (var i = 0; i < items.length; i++) {
    itemsCollection.doc(items[i]._id).set(items[i])
      .then(items => {
        console.log('Added unread items')
      })
      .catch(err => {
        log('addUnreadItemsToFirestore', err)
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
}

export function removeUnreadItem (item) {
  return getUserDb().collection('items-unread').doc(item._id).delete()
    .then(item => {
      console.log('Removed unread item')
      return item
    })
    .catch(err => {
      log('removeUnreadItem', err)
    })
}

export function addReadItemFS (item) {
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
    .catch(err => {
      log('addReadItemFS', err)
    })
}

// TODO: why doesn't my compound index work here?
// I should be able to use two where()'s, but I get the error
// Firestore: Operation was rejected because the system is not in a state required for the operation`s execution. (firestore/failed-precondition).
// According to https://stackoverflow.com/questions/47029227/how-to-create-subcollection-indexes-at-cloud-firestore
// I need to create a compound index, which I did, but it doesn't seem to work
export function markFeedReadFS (feedId, olderThan) {
  const writeBatch = db.batch()
  return getUserDb().collection('items-unread')
    .where('feed_id', '==', feedId)
    // .where('created_at', '<', olderThan)
    .get()
    .then(qs => {
      qs.forEach(docSnapshot => {
        const doc = docSnapshot.data()
        if (doc.created_at < olderThan) {
          writeBatch.delete(docSnapshot.ref)
          addReadItemFS(doc)
        }
      })
      writeBatch.commit()
    })
    .catch(err => {
      log('markFeedReadFS', err)
    })

}

export function addSavedItemToFirestore (item) {
  return getUserDb().collection('items-saved').doc(item._id)
    .set(item)
    .then(item => {
      console.log('Added saved item')
      return item
    })
    .catch(err => {
      log('addSavedItemToFirestore', err)
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
    .catch(err => {
      log('addFeedToFirestore', err)
    })
}

export function upsertFeedsFS (feeds) {
  const collectionRef = getUserDb().collection('feeds')
  feeds.forEach(feed => {
    // upsertFeed will never resolve if offline, so no need to await it
    upsertFeed(feed, collectionRef)
  })
}

export function getCollection (collectionName, orderBy = 'created_at', fromCache, deflate) {
  const path = `users/${uid}/${collectionName}`
  let getOptions = {}
  let data
  if (fromCache) getOptions.source = 'cache'

  const PAGE_SIZE = 1000

  // let firstCall
  // if (fromCache) {
  //   firstCall = db.disableNetwork()
  //     .then(() => db.collection(path).orderBy(orderBy).limit(PAGE_SIZE).get())
  // } else {
  //   firstCall = db.collection(path).orderBy(orderBy).limit(PAGE_SIZE).get()
  // }

  let now = Date.now()
  const getPage = (startAfter) => startAfter ?
    db.collection(path).orderBy(orderBy).limit(PAGE_SIZE).startAfter(startAfter).get() :
    db.collection(path).orderBy(orderBy).limit(PAGE_SIZE).get()

  return getPage()
    .then(qs => {
      if (qs.docs.length < PAGE_SIZE) {
        // get another page

      }
      console.log('getCollection firstCall took ' + (Date.now() - now) + 'ms')
      now = Date.now()
      let items = []
      qs.docs.forEach(ds => {
        data = ds.data()
        if (deflate) {
          data = deflateItem(data)
        }
        items.push(data)
      })
      console.log('Deflating items took ' + (Date.now() - now) + 'ms')
      return items
    })
    .catch(err => {
      log('getCollection', err)
    })
}
