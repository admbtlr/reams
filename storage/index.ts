import { Platform } from 'react-native'
import { Item, ItemInflated } from '../store/items/types'

// Import both storage implementations
import * as SQLiteStorage from './sqlite'
import * as IDBStorage from './idb-storage'

// Determine which storage to use based on platform
const isWeb = Platform.OS === 'web'

// Storage interface facade
export function initStorage() {
  if (!isWeb) {
    SQLiteStorage.initSQLite()
  }
}

export async function getItems(items: (Item | { _id: string })[]): Promise<ItemInflated[] | undefined> {
  if (isWeb) {
    // Convert Item objects to key format expected by IDB
    const keys = items.map(item => typeof item === 'object' && '_id' in item ? item._id : item)
    return IDBStorage.getItems(keys as string[])
  } else {
    return SQLiteStorage.getItems(items as Item[])
  }
}

export function getItemsSync(items: Item[]): ItemInflated[] {
  if (isWeb) {
    throw new Error('Synchronous getItems not available on web platform')
  }
  return SQLiteStorage.getItemsSync(items)
}

export async function getItem(item: Item): Promise<ItemInflated | undefined> {
  if (isWeb) {
    return IDBStorage.getItem(item)
  } else {
    return SQLiteStorage.getItem(item)
  }
}

export async function setItems(items: ItemInflated[]) {
  if (isWeb) {
    return IDBStorage.setItems(items)
  } else {
    return SQLiteStorage.setItems(items)
  }
}

export async function updateItem(item: ItemInflated | Record<string, any>) {
  if (isWeb) {
    return IDBStorage.updateItem(item as ItemInflated)
  } else {
    return SQLiteStorage.updateItem(item)
  }
}

export async function updateItems(items: ItemInflated[] | Item[]) {
  if (isWeb) {
    return IDBStorage.updateItems(items as ItemInflated[])
  } else {
    return SQLiteStorage.updateItems(items as Item[])
  }
}

export async function deleteItem(key: string) {
  if (isWeb) {
    return IDBStorage.deleteItem(key)
  } else {
    // SQLite expects an array of items
    const item = { _id: key } as Item
    return SQLiteStorage.deleteItems([item])
  }
}

export async function deleteItems(items: Item[]) {
  if (isWeb) {
    // IDB deleteItems expects individual calls
    for (const item of items) {
      await IDBStorage.deleteItem(item._id)
    }
  } else {
    return SQLiteStorage.deleteItems(items)
  }
}

export async function clearItems(keys?: string[]) {
  if (isWeb) {
    return IDBStorage.clearItems(keys || [])
  } else {
    return SQLiteStorage.deleteAllItems()
  }
}

// Platform-specific functions
export function searchItems(term: string): ItemInflated[] {
  if (isWeb) {
    throw new Error('Search not implemented for web platform')
  }
  return SQLiteStorage.searchItems(term)
}

export function doDataMigration(migration: number, params: {}[]) {
  if (isWeb) {
    return IDBStorage.doDataMigration(migration, params)
  } else {
    return SQLiteStorage.doDataMigration(migration, params)
  }
}

// Aliases for backward compatibility
export const inflateItem = getItem
export const setItem = async (item: ItemInflated) => setItems([item])
export const deleteAllItems = () => clearItems()

// Re-export platform-specific modules for direct access if needed
export { SQLiteStorage, IDBStorage }
