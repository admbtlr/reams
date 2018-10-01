const Realm = require('realm')

const staleItemSchema = {
  name: 'StaleItem',
  properties: {
    id:  'string',
    feedId: 'string',
    title: 'string',
    datePublished: 'string'
  }
}

export function addStaleItems (items) {
  Realm.open({schema: [staleItemSchema]})
    .then(realm => {
      // Create Realm objects and write to local storage
      realm.write(() => {
        items.forEach(item => writeItemToRealm(item, realm))
        // const staleItem = writeItemToRealm(item, realm)
      })
      realm.close()
    })
    .catch(error => {
      console.log(error);
    })
}


export function addStaleItem (item) {
  addStaleItems([item])
  // Realm.open({schema: [staleItemSchema]})
  //   .then(realm => {
  //     // Create Realm objects and write to local storage
  //     realm.write(() => {
  //       const staleItem = writeItemToRealm(item, realm)
  //     })
  //     realm.close()
  //   })
  //   .catch(error => {
  //     console.log(error);
  //   })
}

function writeItemToRealm (item, realm) {
  return realm.create('StaleItem', {
    id: item.id || item._id,
    feedId: item.feed_id,
    title: item.title,
    datePublished: item.date_published,
    itemUrl: item.url
  })
}

export function getStaleItems () {
  return Realm.open({schema: [staleItemSchema]})
    .then(realm => {
      return realm.objects('StaleItem')
    })
    .catch(error => {
      console.log(error);
    })
}

export function filterItemsForStale (items) {
  return getStaleItems().then(stales => {
    for (let stale of stales) {
      items = items.filter(item => {
        return item.id !== stale.id &&
          item._id !== stale.id &&
          !(item.title === stale.title && item.feed_id !== stale.feedId)
      })
    }
    return items
  })
}
