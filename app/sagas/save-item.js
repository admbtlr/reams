import { ItemType } from '../store/items/types'
import { call, put, select } from 'redux-saga/effects'
import { saveItem, unsaveItem } from '../backends/'
import { inflateItems } from './inflate-items'
import { getDisplay, getSavedItems } from './selectors'
import { SHOW_MODAL } from '../store/ui/types'

export function * markItemSaved (action) {
  const savedItems = yield select(getSavedItems)
  // if (savedItems.find(si => si.url === action.item.url)) {
  //   yield put ({
  //     type: SHOW_MODAL,
  //     modalProps: {
  //       isError: true,
  //       modalText: [
  //         {
  //           text: 'Error Saving Story',
  //           style: ['title']
  //         },
  //         {
  //           text: 'You’ve already saved this story. Saving it again is liable to make everything explode, so let’s just not do it.',
  //           style: ['text']
  //         }
  //       ],
  //       modalHideCancel: true,
  //       modalShow: true,
  //       modalOnOk: () => {}
  //     }
  //   })
  //   return
  // }
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
  if (displayMode === ItemType.saved) {
    const index = yield select(getIndex)
    yield call(inflateItems, { displayMode, index })
  }
}


