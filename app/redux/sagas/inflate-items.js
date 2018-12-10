import { put, select } from 'redux-saga/effects'

import { isInflated, deflateItem } from '../../utils/item-utils'
import { getUnreadItems } from './selectors'

import { getItemsFromFirestore } from '../firestore/'

export function * inflateItems (action) {
  // there's an issue with the index getting setting to undefined at init
  // no idea why
  const index = action.index || 0
  const items = yield select(getUnreadItems)
  let inflatedItems = items.filter(isInflated)
  let activeItems = [
    items[index]
  ]
  if (index > 0) activeItems.push(items[index - 1])
  if (index < items.length - 1) activeItems.push(items[index + 1])

  const itemsToDeflate = inflatedItems
    .filter(item => !!!activeItems.find(ai => ai._id === item._id))
    .map(deflateItem)
  let itemsToInflate = activeItems.filter(item => !!!inflatedItems.find(ai => ai._id === item._id))

  try {
    itemsToInflate = yield getItemsFromFirestore(itemsToInflate)
    yield put({
      type: 'ITEMS_FLATE',
      itemsToInflate,
      itemsToDeflate
    })
  } catch (err) {
    console.log('Error inflating items: ' + err)
  }
}
