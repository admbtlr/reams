import { call, cancel, delay, fork, select, takeEvery } from 'redux-saga/effects'
import { REHYDRATE } from 'redux-persist'
import { 
  SET_BACKEND, 
  STATE_ACTIVE,
  STATE_INACTIVE,
  UNSET_BACKEND 
} from '../store/config/types'
import {
  CLEAR_READ_ITEMS,
  ITEM_DECORATION_SUCCESS,
  RECEIVED_REMOTE_READ_ITEMS,
  REMOVE_ITEMS,
  SAVE_EXTERNAL_URL,
  SAVE_ITEM,
  SET_DISPLAY_MODE,
  UNSAVE_ITEM,
  UPDATE_CURRENT_INDEX 
} from '../store/items/types'
import {
  ADD_FEED,
  ADD_FEED_SUCCESS,
  ADD_FEEDS,
  ADD_FEEDS_SUCCESS,
  MARK_FEED_READ,
  REMOVE_FEED,
  UPDATE_FEEDS
} from '../store/feeds/types'
import {
  FETCH_ITEMS,
  ITEMS_SCREEN_BLUR,
  ITEMS_SCREEN_FOCUS
} from '../store/ui/types'
import { decorateItems } from './decorate-items'
import { fetchAllItems, fetchUnreadItems } from './fetch-items'
import { markLastItemRead, clearReadItems, filterItemsForFirestoreRead } from './mark-read'
import { pruneItems, removeItems, removeAllItems } from './prune-items'
import { appActive, appInactive, currentItemChanged, screenActive, screenInactive } from './reading-timer'
import { saveExternalUrl, maybeUpsertSavedItem } from './external-items'
import { inflateItems } from './inflate-items'
import { markItemSaved, markItemUnsaved } from './save-item'
import { executeRemoteActions } from './remote-action-queue'
import { fetchAllFeeds, markFeedRead, inflateFeeds, subscribeToFeed, subscribeToFeeds, unsubscribeFromFeed } from './feeds'
import { initBackend } from './backend'
import { unsetBackend } from '../backends'
import { getConfig } from './selectors'

let downloadsFork

function * init (getFirebase, action) {
  if (action.key && action.key !== 'primary') return
  const config = yield select(getConfig)
  if (!config.backend || config.backend === '') return

  yield initBackend(getFirebase, action)
  yield call(inflateItems)
  downloadsFork = yield fork(startDownloads, config.backend)
}

function * startDownloads (backend) {
  // let the app render and get started
  delay(3000)
  yield call(fetchAllFeeds)
  yield call(fetchAllItems)
  yield call(decorateItems)
  yield call(clearReadItems)
  yield call(pruneItems)
  yield call(executeRemoteActions)
  yield call(inflateFeeds)
}

function * killBackend () {
  unsetBackend()
  if (downloadsFork) {
    yield cancel(downloadsFork)
  }
}

export function * initSagas (getFirebase) {
  yield takeEvery(REHYDRATE, init, getFirebase)
  yield takeEvery(SET_BACKEND, init, getFirebase)
  yield takeEvery(UNSET_BACKEND, removeAllItems)
  yield takeEvery(UNSET_BACKEND, killBackend)
  yield takeEvery(ADD_FEED, subscribeToFeed)
  yield takeEvery(ADD_FEEDS, subscribeToFeeds)
  yield takeEvery(MARK_FEED_READ, markFeedRead)
  yield takeEvery(ADD_FEED_SUCCESS, fetchUnreadItems)
  yield takeEvery(ADD_FEEDS_SUCCESS, inflateFeeds)
  yield takeEvery(ADD_FEEDS_SUCCESS, fetchUnreadItems)
  yield takeEvery(UPDATE_FEEDS, fetchUnreadItems)
  yield takeEvery(REMOVE_FEED, unsubscribeFromFeed)
  yield takeEvery(SAVE_ITEM, markItemSaved)
  yield takeEvery(UNSAVE_ITEM, markItemUnsaved)
  yield takeEvery(ITEM_DECORATION_SUCCESS, maybeUpsertSavedItem)
  yield takeEvery(UNSAVE_ITEM, inflateItems)
  yield takeEvery(SET_DISPLAY_MODE, inflateItems)
  yield takeEvery(UPDATE_CURRENT_INDEX, inflateItems)
  yield takeEvery(FETCH_ITEMS, clearReadItems)
  yield takeEvery(FETCH_ITEMS, fetchAllItems)
  yield takeEvery(CLEAR_READ_ITEMS, clearReadItems)
  yield takeEvery(RECEIVED_REMOTE_READ_ITEMS, filterItemsForFirestoreRead)
  yield takeEvery(UPDATE_CURRENT_INDEX, markLastItemRead)
  yield takeEvery(REMOVE_ITEMS, removeItems)
  yield takeEvery(SAVE_EXTERNAL_URL, saveExternalUrl)

  // reading timer
  yield takeEvery(UPDATE_CURRENT_INDEX, currentItemChanged)
  yield takeEvery(STATE_ACTIVE, appActive)
  yield takeEvery(STATE_INACTIVE, appInactive)
  yield takeEvery(ITEMS_SCREEN_FOCUS, screenActive)
  yield takeEvery(ITEMS_SCREEN_BLUR, screenInactive)
}
