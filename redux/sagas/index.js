import { delay } from 'redux-saga'
import { put, takeEvery, select } from 'redux-saga/effects'
import { fetchUnreadItems, markItemRead, loadMercuryStuff } from '../backends'
import 'whatwg-fetch'
import {REHYDRATE} from 'redux-persist/constants'

// const getUnreadItems = (state) => state.items.items

const getItems = (state, type) => {
  type = type || state.items.display === 'unread' ? 'items' : state.items.display
  return state.items[type]
}

const getDisplay = (state) => state.items.display

// const feedWranglerAccessToken = '07de039941196f956e9e86e202574419'

function * markLastItemRead (action) {
  yield delay (100)
  const display = yield select(getDisplay)
  if (display !== 'unread') {
    return
  }
  const lastIndex = action.lastIndex
  const unreadItems = yield select(getItems)
  const item = unreadItems[lastIndex]
  try {
    yield markItemRead(item)
    yield put({
      type: 'ITEM_MARK_READ_SUCCESS',
      item,
      index: lastIndex
    })
  } catch (error) {
    console.log('Mark Item Read Error!')
    yield put({
      type: 'ITEMS_HAS_ERRORED',
      hasErrored: true
    })
  }
}

// function markRead (item) {
//   let url = 'https://feedwrangler.net/api/v2/feed_items/update?'
//   url += 'access_token=' + feedWranglerAccessToken
//   url += '&feed_item_id=' + item.feed_item_id
//   url += '&read=true'
//   return fetch(url)
//     .then((response) => {
//       if (!response.ok) {
//         throw Error(response.statusText)
//       }
//       return response
//     })
//     .then((response) => response.json())
// }

function * loadMercuryForSurroundingItems (action) {
  yield delay (100)
  const items = yield select(getItems)
  const index = action.index
  const buffer = 2
  const from = index - buffer >= 0 ? index - buffer : 0
  const to = index + buffer < items.length ? index + buffer : items.length

  for (let i = from; i < to; i++) {
    yield loadMercuryIfNecessary(items[i])
  }
}

function * loadMercuryIfNecessary (item) {
  if (!item.hasLoadedMercuryStuff) {
    yield loadMercuryForItem(item)
  }
}

function * loadMercuryForItem (item) {
  try {
    const mercuryStuff = yield loadMercuryStuff(item)
    yield put({
      type: 'ITEM_LOAD_MERCURY_STUFF_SUCCESS',
      item,
      mercuryStuff
    })
  } catch (error) {
    yield put({
      type: 'ITEMS_HAS_ERRORED',
      hasErrored: true
    })
  }
}

function * saveExternalURL (action) {
  let item = {
    url: action.url,
    _id: Math.random().toString(36).substring(7),
    title: 'Loading...',
    content_html: 'Loading...',
    is_external: true
  }
  yield put({
    type: 'ITEM_SAVE_EXTERNAL_ITEM',
    item
  })
  yield loadMercuryForItem(item)
}

function * fetchItems () {
  const items = yield select(getItems, 'items')
  let latestDate = 0
  if (items.length > 0) {
    latestDate = [ ...items ].sort((a, b) => b.created_at - a.created_at)[0].created_at
  }
  try {
    const items = yield fetchUnreadItems(latestDate)
    yield put({
      type: 'ITEMS_FETCH_DATA_SUCCESS',
      items
    })
  } catch (error) {
    yield put({
      type: 'ITEMS_HAS_ERRORED',
      hasErrored: true
    })
  }
}

function * addMercuryStuff (action) {}

/*
  Starts fetchUser on each dispatched `USER_FETCH_REQUESTED` action.
  Allows concurrent fetches of user.
*/
export function * updateCurrentIndex () {
  yield takeEvery('ITEMS_UPDATE_CURRENT_INDEX', markLastItemRead)
  yield takeEvery('ITEMS_UPDATE_CURRENT_INDEX', loadMercuryForSurroundingItems)
  yield takeEvery('SAVE_EXTERNAL_URL', saveExternalURL)
  yield takeEvery('ITEMS_FETCH_ITEMS', fetchItems)
  yield takeEvery(REHYDRATE, fetchItems)
  yield takeEvery('ITEMS_FETCH_DATA_SUCCESS', addMercuryStuff)
}
