import { call, put, select } from 'redux-saga/effects'

import { isInflated, deflateItem } from '../../utils/item-utils'
import { getUnreadCount } from './selectors'

import { getUnreadItemsFS } from '../firestore/'

export function * inflateItems (action) {
  debugger

  const index = action.index || 0
  const buffer = 3
  const numUnreadItems = yield select(getUnreadCount)

  let startAt = index - buffer < 0 ?
    0 :
    index - buffer
  let endAt = index + buffer >= numUnreadItems ?
    numUnreadItems - 1 :
    index + buffer

  const inflatedItems = yield call(getUnreadItemsFS, startAt, endAt)
  yield put({
    type: 'ITEMS_GET_ITEMS_BUFFERED',
    inflatedItems,
    index,
    buffer
  })

  // there's an issue with the index getting setting to undefined at init
  // no idea why
  // const index = action.index || 0
  // const items = yield select(getUnreadItems)
  // let inflatedItems = items.filter(isInflated)
  // let activeItems = [
  //   items[index]
  // ]

  // // inflate up to 3 items either side of the current
  // const buffer = 3
  // let counter = 1
  // for (var i = -buffer; i < buffer; i++) {
  //   if (index + i > 0 && index + i < items.length) {
  //     activeItems.push(items[index + i])
  //   }
  // }

  // const itemsToDeflate = inflatedItems
  //   .filter(item => !!!activeItems.find(ai => ai._id === item._id))
  //   .map(deflateItem)
  // let itemsToInflate = activeItems.filter(item => !!!inflatedItems.find(ai => ai._id === item._id))

  // try {
  //   itemsToInflate = yield getItemsFromFirestore(itemsToInflate)
  //   yield put({
  //     type: 'ITEMS_FLATE',
  //     itemsToInflate,
  //     itemsToDeflate
  //   })
  // } catch (err) {
  //   console.log('Error inflating items: ' + err)
  // }
}
