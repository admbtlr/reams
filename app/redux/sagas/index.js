import { call, put, takeEvery, select } from 'redux-saga/effects'
import { getConfig, getUid } from './selectors'
import { REHYDRATE } from 'redux-persist'

import { setUid, setDb } from '../firestore/'

import { decorateItems } from './decorate-items'
import { fetchAllItems, fetchUnreadItems } from './fetch-items'
import { markLastItemRead, clearReadItems } from './mark-read'
import { appActive, appInactive, currentItemChanged, screenActive, screenInactive } from './reading-timer'
import { saveExternalUrl } from './external-items'
import { rehydrateSavedItemsFS } from './rehydrate-items'
import { inflateItems } from './inflate-items'
import { markItemSaved, markItemUnsaved } from './save-item'
import { executeRemoteActions } from './remote-action-queue'
import { subscribeToFeed, inflateFeeds, syncFeeds } from './feeds'
import { initialConfig } from './initial-config'
import { setRizzleBackend } from './backend'

// let rehydrated = false
// let checkedBuckets = false
// function * waitForBoth (action) {
//   console.log(action)
//   switch (action.type) {
//     case REHYDRATE:
//       rehydrated = true
//       break
//     case 'UI_FINISHED_CHECKING_BUCKETS':
//       checkedBuckets = true
//       break
//   }

//   if (rehydrated && checkedBuckets) {
//     yield fetchItems()
//     rehydrated = false
//     checkedBuckets = false
//   }
// }

function * init (getFirebase, action) {
  if (action.key !== 'primary') return

  const config = yield select(getConfig)
  if (config.backend === 'rizzle') {
    yield initialiseFirestore(getFirebase)
    yield syncFeeds()
  }
  yield call(initialConfig)
  yield call(clearRead)
  yield call(fetchAllItems)
  yield call(executeRemoteActions)
  yield call(inflateFeeds)
}

function * initIfRizzleBackend (getFirebase, action) {
  if (action.backend === 'rizzle') {
    yield initialiseFirestore(getFirebase, false)
    yield setRizzleBackend(action)
  }
}

function * initialiseFirestore (getFirebase, rehydrateSavedItems = true) {
  const uid = yield select(getUid)
  setDb(getFirebase().firestore())
  setUid(uid)
  if (rehydrateSavedItems) {
    yield call(rehydrateSavedItemsFS)
  }
}

function * clearRead () {
  yield put({
    type: 'ITEMS_CLEAR_READ'
  })
}

export function * updateCurrentIndex (getFirebase) {
  yield takeEvery(REHYDRATE, init, getFirebase)
  yield takeEvery('ITEMS_FETCH_ITEMS', fetchAllItems)
  yield takeEvery('ITEMS_UPDATE_CURRENT_INDEX', inflateItems)
  yield takeEvery('ITEMS_UPDATE_CURRENT_INDEX', markLastItemRead)
  yield takeEvery('SAVE_EXTERNAL_URL', saveExternalUrl)
  yield takeEvery('ITEM_SAVE_ITEM', markItemSaved)
  yield takeEvery('ITEM_UNSAVE_ITEM', markItemUnsaved)
  yield takeEvery('FEEDS_ADD_FEED', subscribeToFeed)
  yield takeEvery('FEEDS_ADD_FEED_SUCCESS', fetchUnreadItems)
  yield takeEvery('ITEMS_FETCH_DATA_SUCCESS', decorateItems)
  yield takeEvery('ITEMS_CLEAR_READ', clearReadItems)
  yield takeEvery('USER_SET_UID', clearReadItems)
  yield takeEvery('CONFIG_SET_BACKEND', initIfRizzleBackend, getFirebase)

  // reading timer
  yield takeEvery('ITEMS_UPDATE_CURRENT_INDEX', currentItemChanged)
  yield takeEvery('STATE_ACTIVE', appActive)
  yield takeEvery('STATE_INACTIVE', appInactive)
  yield takeEvery('NAVIGATION_ITEMS_SCREEN_FOCUS', screenActive)
  yield takeEvery('NAVIGATION_ITEMS_SCREEN_BLUR', screenInactive)
}
