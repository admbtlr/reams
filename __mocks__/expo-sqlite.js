const mockDatabase = {
  exec: jest.fn(() => Promise.resolve()),
  execSync: jest.fn(() => {}),
  transaction: jest.fn(callback => {
    const mockTransaction = {
      executeSql: jest.fn((query, params, successCallback) => {
        if (successCallback) {
          successCallback(mockTransaction, {
            rows: {
              length: 0,
              _array: [],
              item: jest.fn(idx => null)
            },
            insertId: 1,
            rowsAffected: 1
          });
        }
        return Promise.resolve();
      })
    };
    callback(mockTransaction);
    return Promise.resolve();
  }),
  // Sync API (expo-sqlite 15+/16)
  getAllSync: jest.fn(() => []),
  getFirstSync: jest.fn(() => null),
  runSync: jest.fn(() => ({ changes: 1, lastInsertRowId: 1 })),
  prepareSync: jest.fn(() => ({
    executeSync: jest.fn(() => ({ getAllSync: jest.fn(() => []), getFirstSync: jest.fn(() => null) })),
    finalizeSync: jest.fn(),
  })),
  closeAsync: jest.fn(() => Promise.resolve()),
  closeSync: jest.fn(() => {}),
  deleteAsync: jest.fn(() => Promise.resolve()),
};

export const openDatabase = jest.fn(name => mockDatabase);
export const openDatabaseSync = jest.fn(name => mockDatabase);
export const getAllAsync = jest.fn(() => Promise.resolve([]));
export const getAsync = jest.fn(() => Promise.resolve({}));
export const deleteDatabaseAsync = jest.fn(() => Promise.resolve());
