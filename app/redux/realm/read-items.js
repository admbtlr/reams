const Realm = require('realm')

const readItemSchema = {
  name: 'ReadItem',
  properties: {
    id:  'string',
    feedId: 'string',
    title: 'string',
    datePublished: 'string'
  }
}

export function addReadItem (item) {
  Realm.open({schema: [readItemSchema]})
    .then(realm => {
      // Create Realm objects and write to local storage
      realm.write(() => {
        const readItem = realm.create('ReadItem', {
          id: item.id || item._id,
          feedId: item.feed_id,
          title: item.title,
          datePublished: item.date_published,
          url: item.url
        })
      })
    })
    .catch(error => {
      console.log(error);
    })
}