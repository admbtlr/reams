import { ItemType } from '../store/items/types'
import { call, put, select } from 'redux-saga/effects'
import { saveItem, unsaveItem } from '../backends/'
import { inflateItems } from './inflate-items'
import { getDisplay, getSavedItems } from './selectors'

export function * markItemSaved (action) {
  const savedItems = yield select(getSavedItems)
  const item = {
    ...action.item,
    savedAt: action.savedAt
  }
  yield saveItem(item)
  yield put({
    type: 'SAVE_ITEM_SUCCESS',
    item: item
  })
}

export function * markItemUnsaved (action) {
  yield unsaveItem(action.item)
  // TODO remove cached cover image and inflated data in AS
  yield put({
    type: 'UNSAVE_ITEM_SUCCESS',
    item: action.item
  })
  // const displayMode = select(getDisplay)
  // if (displayMode === ItemType.saved) {
  //   const index = yield select(getIndex)
  //   yield call(inflateItems, { displayMode, index })
  // }
}


