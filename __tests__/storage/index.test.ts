// Mock the platform and storage modules
jest.mock('react-native', () => ({
  Platform: { OS: 'web' }
}))

jest.mock('../../storage/sqlite', () => ({
  initSQLite: jest.fn(),
  getItems: jest.fn(),
  getItemsSync: jest.fn(),
  getItem: jest.fn(),
  setItems: jest.fn(),
  updateItem: jest.fn(),
  updateItems: jest.fn(),
  deleteItems: jest.fn(),
  searchItems: jest.fn(),
  doDataMigration: jest.fn(),
  deleteAllItems: jest.fn()
}))

jest.mock('../../storage/idb-storage', () => ({
  getItems: jest.fn(),
  getItem: jest.fn(),
  setItems: jest.fn(),
  updateItem: jest.fn(),
  updateItems: jest.fn(),
  deleteItem: jest.fn(),
  clearItems: jest.fn(),
  doDataMigration: jest.fn()
}))

describe('Storage Facade', () => {
  it('should export all required functions', () => {
    const Storage = require('../../storage')

    // Check that all functions are exported
    expect(typeof Storage.initStorage).toBe('function')
    expect(typeof Storage.getItems).toBe('function')
    expect(typeof Storage.getItem).toBe('function')
    expect(typeof Storage.setItems).toBe('function')
    expect(typeof Storage.updateItem).toBe('function')
    expect(typeof Storage.updateItems).toBe('function')
    expect(typeof Storage.deleteItem).toBe('function')
    expect(typeof Storage.deleteItems).toBe('function')
    expect(typeof Storage.clearItems).toBe('function')
    expect(typeof Storage.searchItems).toBe('function')
    expect(typeof Storage.doDataMigration).toBe('function')

    // Check aliases
    expect(typeof Storage.inflateItem).toBe('function')
    expect(typeof Storage.setItem).toBe('function')
    expect(typeof Storage.deleteAllItems).toBe('function')

    // Check that storage modules are re-exported
    expect(Storage.SQLiteStorage).toBeDefined()
    expect(Storage.IDBStorage).toBeDefined()
  })

  it('should throw appropriate errors for web-only restrictions', () => {
    const Storage = require('../../storage')
    const mockItems = [{ _id: 'test1', feed_id: 'feed1', title: 'Test' }]

    // These should throw on web platform
    expect(() => {
      Storage.getItemsSync(mockItems)
    }).toThrow('Synchronous getItems not available on web platform')

    expect(() => {
      Storage.searchItems('test')
    }).toThrow('Search not implemented for web platform')
  })

  it('should handle platform detection at module level', () => {
    // The storage facade should load without errors regardless of platform
    expect(() => {
      require('../../storage')
    }).not.toThrow()
  })

  it('should provide backward compatibility aliases', () => {
    const Storage = require('../../storage')

    // inflateItem should be the same as getItem
    expect(Storage.inflateItem).toBe(Storage.getItem)

    // setItem should exist and be a function
    expect(typeof Storage.setItem).toBe('function')

    // deleteAllItems should exist and be a function
    expect(typeof Storage.deleteAllItems).toBe('function')
  })
})
