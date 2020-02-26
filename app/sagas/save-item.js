import { call, put, select } from 'redux-saga/effects'
import { saveItem, unsaveItem } from '../backends/'
import { inflateItems } from './inflate-items'
import { getDisplay } from './selectors'

export function * markItemSaved (action) {
  const item = {
    ...action.item,
    savedAt: action.savedAt
  }
  yield saveItem(item)
  yield put({
    type: 'ITEMS_SAVE_ITEM_SUCCESS',
    item: item
  })
}

export function * markItemUnsaved (action) {
  yield unsaveItem(action.item)
  // TODO remove cached cover image and inflated data in AS
  yield put({
    type: 'ITEMS_UNSAVE_ITEM_SUCCESS',
    item: action.item
  })
  const displayMode = select(getDisplay)
  if (displayMode === 'saved') {
    const index = select(getIndex)
    yield call(inflateItems, { displayMode, index })
  }
}


