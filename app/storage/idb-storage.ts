import log from '../utils/log'
import { openDB } from 'idb'

import { Item } from '../store/items/types'
// export async function getItemAS (key) {

// }

async function openStore () {
  const store = await openDB('items', 1, {
    upgrade(db) {
      db.createObjectStore('items')
    }
  })
  return store
}

export async function getItems (keys: (string | {_id: string})[]) {
  if (typeof keys[0] === 'object') {
    keys = keys.map(item => item._id)
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

export async function setItem (item) {

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
    await updateItem(item)
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
    await deleteItem(item)
  }
}

export async function clearItems (keys) {
  const db = await openStore()
  await db.clear('items')
}