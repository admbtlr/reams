import { put, select } from 'redux-saga/effects'
import { decorateItem } from './decorate-items'
import { id } from '../../utils'
import { upsertSavedItemFS } from '../firestore/'
import { getItems, getItem } from './selectors'

export function * saveExternalUrl (action) {
  let item = {
    url: action.url,
    _id: id(action.url),
    title: 'Loading...',
    content_html: '',
    is_external: true
  }
  yield put({
    type: 'ITEM_SAVE_EXTERNAL_ITEM',
    item,
    savedAt: Date.now()
  })
  try {
    const decoration = yield decorateItem(item)
    yield put({
      type: 'ITEM_DECORATION_SUCCESS',
      ...decoration,
      isSaved: true
    })

    // got to go back and find it cos of dodgy reducer side effects
    const items = yield select(getItems, 'saved')
    item = items.find(i => i._id === item._id)

    upsertSavedItemFS(item)
  } catch (err) {
    console.log(err)
  }
}

export function * maybeUpsertSavedItem (action) {
  if (!action.isSaved) return
  const item = yield select(getItem, action.item._id, 'saved')
  upsertSavedItemFS(item)
}

