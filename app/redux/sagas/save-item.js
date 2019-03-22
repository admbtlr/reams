import { put } from 'redux-saga/effects'
import { saveItem, unsaveItem } from '../backends/'

export function * markItemSaved (action) {
  yield saveItem(action.item)
  yield put({
    type: 'ITEMS_SAVE_ITEM_SUCCESS',
    item: action.item
  })
}

export function * markItemUnsaved (action) {
  yield unsaveItem(action.item)
  yield put({
    type: 'ITEMS_UNSAVE_ITEM_SUCCESS',
    item: action.item
  })
}


