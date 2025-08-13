# Storage Facade

This module provides a unified interface for storage operations that automatically chooses between SQLite (for native platforms) and IndexedDB (for web) based on `Platform.OS`.

## Overview

Previously, the codebase required manual platform detection and separate imports for storage operations:

```javascript
// Old approach - manual platform detection
import { Platform } from 'react-native'
import { getItems as getItemsSQLite } from '../storage/sqlite'
import { getItems as getItemsIDB } from '../storage/idb-storage'

// Manual platform check required everywhere
const items = Platform.OS === 'web' 
  ? yield call(getItemsIDB, [item])
  : yield call(getItemsSQLite, [item])
```

Now you can simply:

```javascript
// New approach - automatic platform detection
import { getItems } from '../storage'

// Platform detection handled automatically
const items = yield call(getItems, [item])
```

## Usage

### Initialization

```javascript
import { initStorage } from '../storage'

// Initializes SQLite on native platforms, no-op on web
initStorage()
```

### Basic Operations

```javascript
import { 
  getItems, 
  getItem, 
  setItems, 
  updateItem, 
  deleteItems 
} from '../storage'

// All operations work across platforms
const items = await getItems([item1, item2])
const singleItem = await getItem(item)
await setItems(inflatedItems)
await updateItem(modifiedItem)
await deleteItems([item1, item2])
```

### Platform-Specific Operations

Some operations are only available on specific platforms:

```javascript
import { getItemsSync, searchItems } from '../storage'

// Only available on native platforms
try {
  const items = getItemsSync([item1, item2]) // Throws on web
  const results = searchItems('query term')  // Throws on web
} catch (error) {
  // Handle web platform gracefully
}
```

## API Reference

### Core Functions

- `initStorage()` - Initialize storage (SQLite on native, no-op on web)
- `getItems(items: Item[]): Promise<ItemInflated[]>` - Get multiple items
- `getItem(item: Item): Promise<ItemInflated>` - Get single item
- `setItems(items: ItemInflated[])` - Store multiple items
- `updateItem(item: ItemInflated)` - Update single item
- `updateItems(items: ItemInflated[])` - Update multiple items
- `deleteItems(items: Item[])` - Delete multiple items
- `deleteItem(key: string)` - Delete single item by key
- `clearItems(keys?: string[])` - Clear all items or specific items

### Platform-Specific Functions

- `getItemsSync(items: Item[]): ItemInflated[]` - Synchronous get (native only)
- `searchItems(term: string): ItemInflated[]` - Search items (native only)
- `doDataMigration(migration: number, params: {}[])` - Run data migrations

### Backward Compatibility Aliases

- `inflateItem` - Alias for `getItem`
- `setItem` - Single item version of `setItems`
- `deleteAllItems` - Alias for `clearItems()`

### Direct Access

If you need direct access to platform-specific storage:

```javascript
import { SQLiteStorage, IDBStorage } from '../storage'

// Direct access to platform implementations
SQLiteStorage.searchItems('query')
IDBStorage.clearItems(['key1', 'key2'])
```

## Platform Differences

| Operation | Web (IndexedDB) | Native (SQLite) |
|-----------|----------------|-----------------|
| getItems | Async | Async |
| getItemsSync | ❌ Throws error | ✅ Available |
| searchItems | ❌ Throws error | ✅ Available |
| updateItem | Single item | Single item |
| deleteItems | Loops deleteItem | Batch operation |

## Migration Guide

To migrate existing code:

1. Replace platform-specific imports:
   ```javascript
   // Before
   import { getItems as getItemsSQLite } from '../storage/sqlite'
   import { getItems as getItemsIDB } from '../storage/idb-storage'
   
   // After
   import { getItems } from '../storage'
   ```

2. Remove manual platform checks:
   ```javascript
   // Before
   const items = Platform.OS === 'web' 
     ? yield call(getItemsIDB, [item])
     : yield call(getItemsSQLite, [item])
   
   // After
   const items = yield call(getItems, [item])
   ```

3. Handle platform-specific operations gracefully:
   ```javascript
   // For operations only available on native
   if (Platform.OS !== 'web') {
     const results = searchItems(query)
   }
   ```

## Implementation Details

The facade uses `Platform.OS` to determine the runtime platform and automatically routes calls to the appropriate storage implementation:

- **Web (`Platform.OS === 'web'`)**: Uses IndexedDB via `idb-storage.ts`
- **Native (`Platform.OS !== 'web'`)**: Uses SQLite via `sqlite.ts`

Platform detection happens at module load time for optimal performance.