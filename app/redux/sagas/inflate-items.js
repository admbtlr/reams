import { put, select } from 'redux-saga/effects'

import { isInflated, deflateItem } from '../../utils/item-utils'
import { getUnreadItems } from './selectors'

import { getItemsFS } from '../firestore/'

export function * inflateItems (action) {
  // there's an issue with the index getting setting to undefined at init
  // no idea why
  const index = action.index || 0
  const items = yield select(getUnreadItems)
  let inflatedItems = items.filter(isInflated)
  let activeItems = [
    items[index]
  ]

  // inflate up to 3 items either side of the current
  const buffer = 3
  let counter = 1
  for (var i = -buffer; i < buffer; i++) {
    if (index + i > 0 && index + i < items.length) {
      activeItems.push(items[index + i])
    }
  }

  const itemsToDeflate = inflatedItems
    .filter(item => !!!activeItems.find(ai => ai._id === item._id))
    .map(deflateItem)
  let itemsToInflate = activeItems.filter(item => !!!inflatedItems.find(ai => ai._id === item._id))

  try {
    itemsToInflate = yield getItemsFS(itemsToInflate)
    yield put({
      type: 'ITEMS_FLATE',
      itemsToInflate,
      itemsToDeflate
    })
  } catch (err) {
    console.log('Error inflating items: ' + err)
  }
}
