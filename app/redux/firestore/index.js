// thinking about it, only saved items and read items need to go in firestore
// everything else is pretty much deterministic

import log from '../../utils/log'
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
  if (!uid || uid === '') throw "No user id!"
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
      id: item.id,
      feed_id: item.feed_id,
      title: item.title,
      read_at: Date.now()
    })
    .then(item => {
      console.log('Added read item')
      return item
    })
    .catch(err => {
      log('addReadItemFS', err)
    })
}

export function addReadItemsFS (items) {
  const writeBatch = db.batch()
  items.forEach(item => {
    try {
      const docRef = getUserDb().collection('items-read').doc(item._id)
      writeBatch.set(docRef, {
        _id: item._id,
        feed_id: item.feed_id,
        title: item.title
      })
    } catch(err) {
      log('addReadItemsFS', err)
    }
  })
  return writeBatch.commit()
    .catch(err => {
      log('addReadItemsFS', err)
    })
}

export async function getReadItemsFS () {
  return getCollection('items-read', 'read_at', 'desc', false, false)
}

// TODO: delete me
// // TODO: why doesn't my compound index work here?
// // I should be able to use two where()'s, but I get the error
// // Firestore: Operation was rejected because the system is not in a state required for the operation`s execution. (firestore/failed-precondition).
// // According to https://stackoverflow.com/questions/47029227/how-to-create-subcollection-indexes-at-cloud-firestore
// // I need to create a compound index, which I did, but it doesn't seem to work
// export function markFeedReadFS (feedId, olderThan) {
//   const writeBatch = db.batch()
//   return getUserDb().collection('items-unread')
//     .where('feed_id', '==', feedId)
//     // .where('created_at', '<', olderThan)
//     .get()
//     .then(qs => {
//       qs.forEach(docSnapshot => {
//         const doc = docSnapshot.data()
//         if (doc.created_at < olderThan) {
//           writeBatch.delete(docSnapshot.ref)
//           addReadItemFS(doc)
//         }
//       })
//       writeBatch.commit()
//     })
//     .catch(err => {
//       log('markFeedReadFS', err)
//     })

// }

export function addSavedItemFS (item) {
  return getUserDb().collection('items-saved').doc(item._id)
    .set(item)
    .then(item => {
      console.log('Added saved item')
      return item
    })
    .catch(err => {
      log('addSavedItemFS', err)
    })
}

export function removeSavedItemFS (item) {
  return getUserDb().collection('items-saved').doc(item._id)
    .delete(item)
    .then(_ => {
      console.log('Removed saved item')
    })
    .catch(err => {
      log('removeSavedItemFS', err)
    })
}

export function addSavedItemsFS (items) {
  const collectionRef = getUserDb().collection('items-saved')
  for (item of items) {
    collectionRef.doc(item._id)
      .set(item)
      .catch(err => {
        log('addSavedItemsFS', err)
      })
  }
}

export async function getSavedItemsFS (items) {
  return getCollection('items-saved', 'savedAt')
}

export function addFeedToFirestore (feed) {
  const collectionRef = getUserDb().collection('feeds')
  return upsertFeed(feed, collectionRef)
}

async function upsertFeed (feed, collectionRef) {
  let existingFeed
  let results = await collectionRef.where('_id', '==', feed._id).get()
  if (results.docs.length > 0) {
    existingFeed = results.docs[0].data()
  }
  if (!existingFeed) {
    results = await collectionRef.where('id', '==', feed.id).get()
    if (results.docs.length > 0) {
      existingFeed = results.docs[0].data()
    }
  }
  return collectionRef.doc(existingFeed ? existingFeed._id : feed._id)
    .set(feed, { merge: true })
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

export async function getFeedsFS () {
  return getCollection('feeds', 'title', 'asc', false, false)
}

export async function getCollection (collectionName, orderBy = 'created_at', direction = 'desc', fromCache, deflate) {
  let getOptions = {}
  let data
  if (fromCache) getOptions.source = 'cache'

  const PAGE_SIZE = 1000
  // orderBy = typeof orderBy === 'array' ? orderBy : [orderBy]

  // let firstCall
  // if (fromCache) {
  //   firstCall = db.disableNetwork()
  //     .then(() => db.collection(path).orderBy(orderBy).limit(PAGE_SIZE).get())
  // } else {
  //   firstCall = db.collection(path).orderBy(orderBy).limit(PAGE_SIZE).get()
  // }

  let now = Date.now()

  let getPage
  try {
    getPage = (startAfter) => startAfter ?
      getUserDb()
        .collection(collectionName)
        .orderBy(orderBy)
        .limit(PAGE_SIZE)
        .startAfter(startAfter)
        .get() :
      getUserDb()
        .collection(collectionName)
        .orderBy(orderBy)
        .limit(PAGE_SIZE)
        .get()
  } catch (err) {
    log('getCollection', err)
  }

  return getPage()
    .then(qs => {
      if (qs.docs.length < PAGE_SIZE) {
        // get another page

      }
      now = Date.now()
      let items = []
      qs.docs.forEach(ds => {
        data = ds.data()
        if (deflate) {
          data = deflateItem(data)
        }
        items.push(data)
      })
      return items
    })
    .catch(err => {
      log('getCollection', err)
    })
}
