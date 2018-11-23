import { put } from 'redux-saga/effects'
import { decorateItem } from './decorate-items'
import { id } from '../../utils/merge-items.js'

export function * saveExternalUrl (action) {
  let item = {
    url: action.url,
    _id: id(),
    title: 'Loading...',
    content_html: '',
    is_external: true
  }
  yield put({
    type: 'ITEM_SAVE_EXTERNAL_ITEM',
    item
  })
  const decoration = yield decorateItem(item)
  yield put({
    type: 'ITEM_DECORATION_SUCCESS',
    ...decoration
  })
}

