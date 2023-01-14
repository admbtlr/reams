import { delay, put, select } from 'redux-saga/effects'
import { 
  ITEM_DECORATION_FAILURE,
  ITEM_DECORATION_SUCCESS,
  SAVE_EXTERNAL_ITEM,
  SAVE_EXTERNAL_ITEM_SUCCESS
} from '../store/items/types'
import { 
  SHOW_MODAL
} from '../store/ui/types'
import { decorateItem } from './decorate-items'
import { id } from '../utils'
import { saveExternalItem } from '../backends'
import { getConfig, getDisplay, getItems, getItem, getSavedItems } from './selectors'
import { createItemStyles } from '../utils/createItemStyles'
import { ADD_ITEM_TO_CATEGORY } from '../store/categories/types'

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
    title: action.title ?? 'Loading...',
    content_html: '',
    is_external: true
  }
  item.styles = createItemStyles(item)
  yield put({
    type: SAVE_EXTERNAL_ITEM,
    item,
    savedAt: Date.now()
  })
  yield put({
    type: ADD_ITEM_TO_CATEGORY,
    itemId: item._id,
    categoryId: 'inbox'
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

      const backendItem = saveExternalItem(item)

      // now we need to set the id of the local saved item to the id of the backend saved item
      yield put({
        type: SAVE_EXTERNAL_ITEM_SUCCESS,
        item: backendItem
      })
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

