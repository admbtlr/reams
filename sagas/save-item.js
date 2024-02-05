import { ItemType } from '../store/items/types'
import { call, put, select } from 'redux-saga/effects'
import { saveItem, unsaveItem } from '../backends/'
import { getDisplay, getSavedItems } from './selectors'
import { removeCachedCoverImages } from '../utils/item-utils'

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
  yield call (removeCachedCoverImages, [action.item])
  // TODO remove data from IDB/SQLite
  yield put({
    type: 'UNSAVE_ITEM_SUCCESS',
    item: action.item
  })
}


