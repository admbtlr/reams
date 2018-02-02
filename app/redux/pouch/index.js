let db

export function init () {
  db = new PouchDB('rizzle')

  db.createIndex({
    index: {
      fields: ['type']
    }
  }).then(() => db.find({
    selector: {
      type: 'item'
    }
  })).then((items) => {
    console.log(items)
  })
}

export function addItems (items) {
  return db.bulkDocs(items.map((item) => {
    return {
      ...item,
      type: 'item'
    }
  }))
}