import { put, select } from 'redux-saga/effects'
import { fetchUnreadItems, fetchUnreadIds, getItemsByIds } from '../backends'
import { mergeItems, id } from './merge-items.js'
const RNFS = require('react-native-fs')

import { getItems, getCurrentItem } from './selectors'

export function * fetchItems2 () {
  yield put({
    type: 'ITEMS_IS_LOADING',
    isLoading: true
  })
  const oldItems = yield select(getItems, 'items')
  const newIds = yield fetchUnreadIds()
  let newItems = newIds.map((item) => {
    return oldItems.find((oldItem) => oldItem.id === item.id) || item
  })
  const readItems = oldItems.filter((oldItem) => newItems.find((newItem) => newItem.id === oldItem.id) === undefined)
  const idsToExpand = newItems.filter(item => !!!item._id)
  if (idsToExpand.length > 0) {
    const expandedItems = yield getItemsByIds(idsToExpand)
    newItems = mergeExpanded(newItems, expandedItems)
  }
  const currentItem = yield select(getCurrentItem)
  if (!newItems.find((item) => item._id === currentItem._id)) {
    newItems.push(currentItem)
  }
  newItems.sort((a, b) => a.date_published - b.date_published)

  if (__DEV__) {
    newItems = newItems.slice(0, 100)
  }

  yield put({
    type: 'ITEMS_FETCH_DATA_SUCCESS',
    items: newItems
  })
  yield put({
    type: 'ITEMS_IS_LOADING',
    isLoading: false
  })
  // now remove the cached images for all the read items
  removeCachedCoverImages(readItems)
}

function mergeExpanded (mixedItems, expandedItems) {
  return mixedItems.map((item) => {
    return item._id ? item : expandedItems.find((expanded) => expanded.id === item.id)
  })
}

export function * fetchItems () {
  const oldItems = yield select(getItems, 'items')
  const currentItem = yield select(getCurrentItem)
  let latestDate = 0
  if (oldItems.length > 0) {
    latestDate = [ ...oldItems ].sort((a, b) => b.created_at - a.created_at)[0].created_at
  }
  try {
    yield put({
      type: 'ITEMS_IS_LOADING',
      isLoading: true
    })
    const newItems = yield fetchUnreadItems(latestDate)
    yield put({
      type: 'ITEMS_IS_LOADING',
      isLoading: true,
      numItems: newItems.length
    })
    if (__DEV__) {
      newItems = newItems.slice(0, 100)
    }
    console.log(`Fetched ${newItems.length} items`)
    console.log(newItems)
    const { read, unread } = mergeItems(oldItems, newItems, currentItem)
    console.log(`And now I have ${unread.length} unread items`)
    console.log(unread)
    yield put({
      type: 'ITEMS_FETCH_DATA_SUCCESS',
      items: unread
    })
    yield put({
      type: 'ITEMS_IS_LOADING',
      isLoading: false
    })
    // now remove the cached images for all the read items
    removeCachedCoverImages(read)
  } catch (error) {
    yield put({
      type: 'ITEMS_HAS_ERRORED',
      hasErrored: true,
      error
    })
  }
}

function removeCachedCoverImages (items) {
  for (let item of items) {
    if (item.imagePath) {
      RNFS.unlink(item.imagePath)
        .catch((error) => {
          console.log(error)
        })
    }
  }
}

