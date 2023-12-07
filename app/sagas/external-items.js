import { call, delay, put, select } from 'redux-saga/effects'
import { 
  ITEM_DECORATION_FAILURE,
  ITEM_DECORATION_SUCCESS,
  SAVE_EXTERNAL_ITEM,
  SAVE_EXTERNAL_ITEM_SUCCESS
} from '../store/items/types'
import { decorateItem } from './decorate-items'
import { id } from '../utils'
import { saveExternalItem } from '../backends'
import { getConfig, getDisplay, getItems, getItem, getSavedItems } from './selectors'
import { createItemStyles } from '../utils/createItemStyles'
import { ADD_ITEM_TO_CATEGORY } from '../store/categories/types'
import { setItems } from '../storage/sqlite'

export function * saveExternalUrl (action) {
  const savedItems = yield select(getSavedItems)
  let item = {
    url: action.url,
    _id: id(action.url),
    title: action.title ?? 'Loading...',
    content_html: '',
    isExternal: true,
    isSaved: true,
    created_at: Date.now()
  }
  item.styles = createItemStyles(item)
  try {
    yield call(setItems, [item])
  } catch (err) {
    console.log(err)
  }
  yield put({
    type: SAVE_EXTERNAL_ITEM,
    item,
    savedAt: item.created_at
  })
  yield put({
    type: ADD_ITEM_TO_CATEGORY,
    itemId: item._id,
    categoryId: 'inbox'
  })
  try {
    const decoration = yield decorateItem(item)
    const backendItem = yield call(saveExternalItem, decoration.item)

    // now we need to set the id of the local saved item to the id of the backend saved item
    yield put({
      type: SAVE_EXTERNAL_ITEM_SUCCESS,
      item: backendItem
    })
  } catch (err) {
    console.log(err)
  }
}

export function * maybeUpsertSavedItem (action) {
  if (!action.isSaved) return
  const backend = yield select(getConfig)
  if (backend !== 'rizzle') return
  const item = yield select(getItem, action.item._id, 'saved')
  saveExternalItem(item)
}

