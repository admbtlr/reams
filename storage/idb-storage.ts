import log from '../utils/log'
import { DBSchema, openDB } from 'idb'

import { Item, ItemInflated } from '../store/items/types'
// export async function getItemAS (key) {

// }

interface Row {
  id: string | number | undefined;
  _id: string;
  content_html: string | undefined;
  author: string | undefined;
  content_mercury: string | undefined;
  decoration_failures: number | undefined;
  excerpt: string | undefined;
  readAt: number | undefined;
  scrollRatio: string | undefined;
  styles: string;
}

interface ItemsDB extends DBSchema {
  items: {
    value: Row;
    key: string;
  }
}

function rowToItem(row: Row) {
  let styles
  try {
    styles = JSON.parse(row.styles)
  } catch (e) {
    console.error(e)
  }
  return {
    id: row.id,
    _id: row._id,
    content_html: row.content_html,
    author: row.author,
    content_mercury: row.content_mercury,
    decoration_failures: row.decoration_failures,
    excerpt: row.excerpt,
    readAt: row.readAt,
    scrollRatio: row.scrollRatio && JSON.parse(row.scrollRatio),
    styles
  }
}

function itemToRow(item: ItemInflated) {
  const row = {
    id: item.id,
    _id: item._id,
    content_html: item.content_html,
    author: item.author,
    content_mercury: item.content_mercury,
    decoration_failures: item.decoration_failures,
    excerpt: item.excerpt,
    readAt: item.readAt,
    scrollRatio: JSON.stringify(item.scrollRatio),
    styles: JSON.stringify(item.styles)
  }
  Object.keys(row).forEach((key: string) => {
    if (row[key] === undefined) {
      delete row[key]
    }
  })
  return row
}

async function openStore() {
  try {
    const store = await openDB<ItemsDB>('items', 1, {
      upgrade(db) {
        db.createObjectStore('items', {
          keyPath: '_id'
        })
      },
      blocked() {
        console.log('blocked')
      },
      blocking() {
        console.log('blocking')
      },
      terminated() {
        console.log('terminated')
      }
    })
    return store
  } catch (err) {
    log('openStore', err)
    throw err
  }
}

export function doDataMigration(migration: number, params: {}[]) {
  // to do
}

export async function getItems(keys: (string | { _id: string })[]): Promise<ItemInflated[] | undefined> {
  if (typeof keys[0] === 'object') {
    keys = keys.map(item => typeof item === 'object' ? item._id : item)
  }
  try {
    const db = await openStore()
    const rows = await Promise.all(keys.map(key => db.get('items', key as string)))
    const items = rows.map((row) => row !== undefined ? rowToItem(row) : undefined)
    return items.filter(item => item !== undefined) as ItemInflated[]
  } catch (err) {
    log('getItemsIDB', err)
  }
}

export async function getItem(item: Item): Promise<ItemInflated | undefined> {
  let items
  try {
    items = await getItems([item])
  } catch (err) {
    log('getItemIDB', err)
  }
  return items === undefined ? items : items[0]
}

export async function setItem(item: Item) {

}

export async function updateItem(item: ItemInflated) {
  try {
    const db = await openStore()
    const records = await getItems([item])
    if (records === undefined) {
      throw new Error('Item not forund in database')
    }
    const record = records[0]
    const keys = Object.keys(record)
    keys.forEach((key: string) => {
      if (record[key] !== item[key] && item[key] !== undefined) {
        record[key] = item[key]
      }
    })
    await db.put('items', itemToRow(record))
  } catch (err) {
    log('updateItem' + err)
  }
}

export async function updateItems(items: ItemInflated[]) {
  for (var item of items) {
    try {
      await updateItem(item)
    } catch (err) {
      log('updateItems' + err)
      return false
    }
  }
  return true
}

export async function setItems(items: ItemInflated[]) {
  try {
    const db = await openStore()
    for (var item of items) {
      console.log('Inserting item ' + item.title + ' using key ' + item._id)
      await db.put('items', itemToRow(item))
    }
  } catch (err) {
    log('setItems' + err)
  }
}

export async function deleteItem(key: string) {
  try {
    const db = await openStore()
    await db.delete('items', key)
  } catch (err) {
    log('deleteItem' + err)
  }
}

export async function deleteItems(items: Item[]) {
  for (var item in items) {
    try {
      await deleteItem(item)
    } catch (err) {
      log('deleteItems' + err)
    }
  }
}

export async function clearItems(keys: string[]) {
  try {
    const db = await openStore()
    await db.clear('items')
  } catch (err) {
    log('clearItems' + err)
  }
}
