import { call, put, select, takeEvery } from 'redux-saga/effects'
import { REHYDRATE } from 'redux-persist'

import { decorateItems } from './decorate-items'
import { fetchAllItems, fetchUnreadItems } from './fetch-items'
import { markLastItemRead, clearReadItems, filterItemsForFirestoreRead } from './mark-read'
import { pruneItems } from './prune-items'
import { appActive, appInactive, currentItemChanged, screenActive, screenInactive } from './reading-timer'
import { saveExternalUrl } from './external-items'
import { inflateItems } from './inflate-items'
import { markItemSaved, markItemUnsaved } from './save-item'
import { executeRemoteActions } from './remote-action-queue'
import { markFeedRead, inflateFeeds, subscribeToFeed } from './feeds'
import { initBackend } from './backend'
import { getConfig } from './selectors'

function * init (getFirebase, action) {
  if (action.key && action.key !== 'primary') return
  const config = yield select(getConfig)
  if (!config.backend || config.backend === '') return

  yield initBackend(getFirebase, action)
  yield call(fetchAllItems)
  yield call(decorateItems)
  yield call(clearReadItems)
  yield call(pruneItems)
  yield call(executeRemoteActions)
  yield call(inflateFeeds)
}

export function * initSagas (getFirebase) {
  yield takeEvery(REHYDRATE, init, getFirebase)
  yield takeEvery('CONFIG_SET_BACKEND', init, getFirebase)
  yield takeEvery('FEEDS_ADD_FEED', subscribeToFeed)
  yield takeEvery('FEED_MARK_READ', markFeedRead)
  yield takeEvery('FEEDS_ADD_FEED_SUCCESS', fetchUnreadItems)
  yield takeEvery('FEEDS_UPDATE_FEEDS', fetchUnreadItems)
  yield takeEvery('ITEM_SAVE_ITEM', markItemSaved)
  yield takeEvery('ITEM_UNSAVE_ITEM', markItemUnsaved)
  yield takeEvery('ITEM_UNSAVE_ITEM', inflateItems)
  yield takeEvery('ITEMS_FETCH_ITEMS', clearReadItems)
  yield takeEvery('ITEMS_FETCH_ITEMS', fetchAllItems)
  yield takeEvery('ITEMS_CLEAR_READ', clearReadItems)
  yield takeEvery('ITEMS_RECEIVED_REMOTE_READ', filterItemsForFirestoreRead)
  yield takeEvery('ITEMS_UPDATE_CURRENT_INDEX', inflateItems)
  yield takeEvery('ITEMS_UPDATE_CURRENT_INDEX', markLastItemRead)
  yield takeEvery('SAVE_EXTERNAL_URL', saveExternalUrl)
  yield takeEvery('USER_SET_UID', clearReadItems)

  // reading timer
  yield takeEvery('ITEMS_UPDATE_CURRENT_INDEX', currentItemChanged)
  yield takeEvery('STATE_ACTIVE', appActive)
  yield takeEvery('STATE_INACTIVE', appInactive)
  yield takeEvery('NAVIGATION_ITEMS_SCREEN_FOCUS', screenActive)
  yield takeEvery('NAVIGATION_ITEMS_SCREEN_BLUR', screenInactive)
}
