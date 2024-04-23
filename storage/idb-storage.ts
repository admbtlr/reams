import log from '../utils/log'
import { openDB } from 'idb'

import { Item, ItemInflated } from '../store/items/types'
// export async function getItemAS (key) {

// }

async function openStore () {
  try {
    const store = await openDB('items', 1, {
      upgrade(db) {
        db.createObjectStore('items')
      }
    })  
    return store
  } catch (err) {
    log('openStore', err)
    throw err
  }
}

export async function getItems (keys: (string | {_id: string})[]): Promise<ItemInflated[] | undefined> {
  if (typeof keys[0] === 'object') {
    keys = keys.map(item => typeof item === 'object' ? item._id : item)
  }
  try {
    const db = await openStore()
    const keyVals = await Promise.all(keys.map(key => db.get('items', key)))
    const mapped = keyVals.map(keyVal => JSON.parse(keyVal))
    return mapped
  } catch (err) {
    log('getItemsIDB', err)
  }
}

export async function getItem (item: Item): Promise<ItemInflated | undefined> {
  let items
  try {
    items = await getItems([item])
  } catch (err) {
    log('getItemIDB', err)
  }
  return items === undefined ? items : items[0]
}
    
export async function setItem (item: Item) {

}

export async function updateItem (item: Item) {
  try {
    const db = await openStore()
    await db.put('items', JSON.stringify(item), item._id)
  } catch (err) {
    log('updateItem' + err)
  }
}

export async function updateItems (items: Item[]) {
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

export async function setItems (items: Item[]) {
  try {
    const db = await openStore()
    for (var item of items) {
      await db.add('items', JSON.stringify(item), item._id)
    }
  } catch (err) {
    log('setItems' + err)
  }
}

export async function deleteItem (key: string) {
  try {
    const db = await openStore()
    await db.delete('items', key)
  } catch (err) {
    log('deleteItem' + err)
  }
}

export async function deleteItems (items: Item[]) {
  for (var item in items) {
    try {
      await deleteItem(item)
    } catch (err) {
      log('deleteItems' + err)
    }
  }
}

export async function clearItems (keys: string[]) {
  try {
    const db = await openStore()
    await db.clear('items')
  } catch (err) {
    log('clearItems' + err)
  }
}
