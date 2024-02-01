// FILEPATH: /Users/adam/Documents/me/dev/rizzle/sagas/fetch-items.test.js
import { runSaga } from 'redux-saga';
import { cleanUpItems } from './fetch-items';

describe('cleanUpItems', () => {
  it('should correctly clean up items', async () => {
    const dispatchedActions = [];
    const fakeStore = {
      getState: () => ({ items: [] }),
      dispatch: action => dispatchedActions.push(action),
    };

    const items = [
      { _id: '1', created_at: '2022-01-01' },
      { _id: '2', created_at: 1641013200000 },
      { _id: '3', created_at: 1641013200 },
    ];

    await runSaga(fakeStore, cleanUpItems, items, 'saved').toPromise();

    expect(dispatchedActions).toEqual([
      { type: 'GET_CURRENT_ITEM' },
      { type: 'GET_ITEMS' },
    ]);

    const cleanedItems = dispatchedActions[2].payload;
    expect(cleanedItems).toHaveLength(3);

    cleanedItems.forEach(item => {
      expect(item).toHaveProperty('date_fetched');
      expect(item).toHaveProperty('original_created_at');
      expect(item).toHaveProperty('isSaved', true);
      expect(item).toHaveProperty('_id');
    });

    expect(cleanedItems[0].created_at).toEqual(Date.parse('2022-01-01'));
    expect(cleanedItems[1].created_at).toEqual(1641013200000);
    expect(cleanedItems[2].created_at).toEqual(1641013200000);
  });
});