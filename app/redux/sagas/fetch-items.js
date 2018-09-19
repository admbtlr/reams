import { put, select } from 'redux-saga/effects'
import { fetchUnreadItems, fetchUnreadIds, getItemsByIds } from '../backends'
import { mergeItems, id } from '../../utils/merge-items.js'
import { checkOnline } from './check-online'
const RNFS = require('react-native-fs')

import { getItems, getCurrentItem, getFeeds } from './selectors'

export function * fetchItems2 () {
  const isOnline = yield checkOnline()
  if (!isOnline) return

  yield put({
    type: 'ITEMS_IS_LOADING',
    isLoading: true
  })

  const oldItems = yield select(getItems, 'items')
  const currentItem = yield select(getCurrentItem)
  const feeds = yield select(getFeeds)
  const { newItems, readItems } = yield fetchUnreadItems(oldItems, currentItem, feeds)

  yield put({
    type: 'ITEMS_FETCH_DATA_SUCCESS',
    items: newItems
  })
  yield put({
    type: 'FEEDS_SET_LAST_UPDATED',
    lastUpdated: Date.now()
  })
  yield put({
    type: 'ITEMS_IS_LOADING',
    isLoading: false
  })
  // now remove the cached images for all the read items
  removeCachedCoverImages(readItems)
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
  if (!items) return
  for (let item of items) {
    if (item.imagePath) {
      RNFS.unlink(item.imagePath)
        .catch((error) => {
          console.log(error)
        })
    }
  }
}

