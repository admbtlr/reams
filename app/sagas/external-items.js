import { delay, put, select } from 'redux-saga/effects'
import { 
  ITEM_DECORATION_FAILURE,
  ITEM_DECORATION_SUCCESS,
  SAVE_EXTERNAL_ITEM
} from '../store/items/types'
import { 
  SHOW_MODAL
} from '../store/ui/types'
import { decorateItem } from './decorate-items'
import { id } from '../utils'
import { saveExternalItem } from '../backends'
import { getConfig, getItems, getItem, getSavedItems } from './selectors'

export function * saveExternalUrl (action) {
  const savedItems = yield select(getSavedItems)
  if (savedItems.find(si => si.url === action.url)) {
    yield delay(1000)
    yield put ({
      type: SHOW_MODAL,
      modalProps: {
        isError: true,
        modalText: [
          {
            text: 'Error Saving Story',
            style: ['title']
          },
          {
            text: 'You’ve already saved this story. Saving it again is liable to make everything explode, so let’s just not do it, OK?',
            style: ['text']
          }
        ],
        modalHideCancel: true,
        modalShow: true,
        modalOnOk: () => {}
      }
    })
    return
  }
  let item = {
    url: action.url,
    _id: id(action.url),
    title: 'Loading...',
    content_html: '',
    is_external: true
  }
  yield put({
    type: SAVE_EXTERNAL_ITEM,
    item,
    savedAt: Date.now()
  })
  try {
    const decoration = yield decorateItem(item)
    if (decoration.mercuryStuff.error) {
      yield call(InteractionManager.runAfterInteractions)
      yield put({
        type: ITEM_DECORATION_FAILURE,
        ...decoration,
        isSaved: true
      })
    } else {
      const displayMode = yield select(getDisplay)
      yield put({
        type: ITEM_DECORATION_SUCCESS,
        ...decoration,
        isSaved: true,
        displayMode
      })

      // got to go back and find it cos of dodgy reducer side effects
      const items = yield select(getItems, 'saved')
      item = items.find(i => i._id === item._id)

      saveExternalItem(item)
    }
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

