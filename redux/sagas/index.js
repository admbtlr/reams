import { put, takeEvery, select } from 'redux-saga/effects'
import { markItemRead, loadMercuryStuff } from '../backends'
import 'whatwg-fetch'

// const getUnreadItems = (state) => state.items.items

const getItems = (state) => {
  const type = state.items.display === 'unread' ? 'items' : state.items.display
  return state.items[type]
}

const getDisplay = (state) => state.items.display

// const feedWranglerAccessToken = '07de039941196f956e9e86e202574419'

function * markLastItemRead (action) {
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
}

/*
  Starts fetchUser on each dispatched `USER_FETCH_REQUESTED` action.
  Allows concurrent fetches of user.
*/
export function * updateCurrentIndex () {
  yield takeEvery('ITEMS_UPDATE_CURRENT_INDEX', markLastItemRead)
  yield takeEvery('ITEMS_UPDATE_CURRENT_INDEX', loadMercuryForSurroundingItems)
}
