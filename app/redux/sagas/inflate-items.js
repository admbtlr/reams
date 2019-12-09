import { InteractionManager } from 'react-native'
import { call, put, select } from 'redux-saga/effects'

import { isInflated, deflateItem, inflateStyles } from '../../utils/item-utils'
import log from '../../utils/log'
import { getDisplay, getIndex, getItems } from './selectors'

import { getItemsAS } from '../async-storage/'

export function * inflateItems (action) {
  // there's an issue with the index getting setting to undefined at init
  // no idea why
  let displayMode = action && action.displayMode
  if (!displayMode) {
    displayMode = yield select(getDisplay)
  }
  let index = action && action.index
  if (!index) {
    index = yield select(getIndex, displayMode)
  }
  const feedFilter = action && action.feedFilter
  let items = yield select(getItems, displayMode)
  if (feedFilter) items = items.filter(i => i.feed_id === feedFilter)
  if (items.length === 0) return

  let inflatedItems = items.filter(isInflated)
  let activeItems = [
    items[index]
  ]

  // inflate up to 3 items either side of the current
  const buffer = 3
  let counter = 1
  for (var i = -buffer; i < buffer; i++) {
    if (index + i >= 0 && index + i < items.length) {
      activeItems.push(items[index + i])
    }
  }

  try {
    // const itemsToDeflate = inflatedItems
    //   // why do I sometimes get an undefined error here? something's wrong...
    //   .filter(item => item !== undefined && !!!activeItems.find(ai => ai._id === item._id))
    //   .map(deflateItem)

    let itemsToDeflate = []
    items.filter(isInflated).forEach(i => {
      if (!activeItems.find(ai => ai._id === i._id)) {
        itemsToDeflate.push(deflateItem(i))
      }
    })

    let itemsToInflate = []
    activeItems.forEach(i => {
      if (items.filter(isInflated).indexOf(i) === -1) {
        itemsToInflate.push(i)
      }
    })
    // let itemsToInflate = activeItems.filter(item => !!!inflatedItems.find(ai => ai._id === item._id))



    let inflatedItems = yield call(getItemsAS, itemsToInflate)

    // sometimes one of these is null, for reasons that I don't understand
    // so let's try returning the uninflated item and see if that helps
    inflatedItems = inflatedItems.map((inflatedItem, index) => inflatedItem === null ?
      itemsToInflate[index] :
      inflatedItem)

    // some of the item fields are mutable, i.e. they could have changed while the item was deflated
    // (right now actually just the feed color)
    inflatedItems = inflatedItems.map((inflatedItem, index) => ({
      ...inflatedItem,
      feed_color: itemsToInflate[index].feed_color || inflatedItem.feed_color
    }))

    // inflatedItems = inflatedItems.map(inflateStyles)
    yield put({
      type: 'ITEMS_FLATE',
      itemsToInflate: inflatedItems,
      itemsToDeflate
    })
  } catch (err) {
    log('inflateItems', err)
  }
}
