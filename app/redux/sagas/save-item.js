import { call, put } from 'redux-saga/effects'
import { saveItem, unsaveItem } from '../backends/'
import { inflateItems } from './inflate-items'

export function * markItemSaved (action) {
  yield saveItem(action.item)
  yield put({
    type: 'ITEMS_SAVE_ITEM_SUCCESS',
    item: action.item
  })
}

export function * markItemUnsaved (action) {
  yield unsaveItem(action.item)
  // TODO remove cached cover image and inflated data in AS
  yield put({
    type: 'ITEMS_UNSAVE_ITEM_SUCCESS',
    item: action.item
  })
  yield call(inflateItems)
}


