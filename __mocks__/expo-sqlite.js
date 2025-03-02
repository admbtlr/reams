const mockDatabase = {
  exec: jest.fn(() => Promise.resolve()),
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
  closeAsync: jest.fn(() => Promise.resolve())
};

export const openDatabase = jest.fn(name => mockDatabase);
export const getAllAsync = jest.fn(() => Promise.resolve([]));
export const getAsync = jest.fn(() => Promise.resolve({}));
