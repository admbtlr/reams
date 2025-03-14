import { call, cancel, delay, fork, put, select, takeEvery } from 'redux-saga/effects'
import { REHYDRATE } from 'redux-persist'
import { 
  START_DOWNLOADS,
  STATE_ACTIVE,
  STATE_INACTIVE, 
} from '../store/config/types'
import {
  SET_BACKEND, 
  type setBackendAction, 
  UNSET_BACKEND
} from '../store/user/types'
import {
  CLEAR_READ_ITEMS,
  ITEM_DECORATION_SUCCESS,
  ItemType,
  RECEIVED_REMOTE_READ_ITEMS,
  REMOVE_ITEMS,
  SAVE_EXTERNAL_URL,
  SAVE_ITEM,
  SET_TITLE_FONT_SIZE,
  UNSAVE_ITEM,
  UPDATE_CURRENT_INDEX 
} from '../store/items/types'
import {
  ADD_FEED,
  ADD_FEEDS,
  DEACTIVATE_NUDGE,
  type FeedLocal,
  MARK_FEED_READ,
  PAUSE_NUDGE,
  REMOVE_FEED,
  REMOVE_FEEDS,
  UPDATE_FEEDS,
} from '../store/feeds/types'
import {
  CLEAR_MESSAGES,
  FETCH_ITEMS,
  ITEMS_SCREEN_BLUR,
  ITEMS_SCREEN_FOCUS,
} from '../store/ui/types'
import { decorateItems } from './decorate-items'
import { fetchAllItems, fetchUnreadItems } from './fetch-items'
import { markLastItemReadIfDecorated, clearReadItems, filterItemsForRead } from './mark-read'
import { dedupeSaved, pruneItems, removeItems, removeAllItems } from './prune-items'
import { appActive, appInactive, currentItemChanged, screenActive, screenInactive } from './reading-timer'
import { saveExternalUrl, maybeUpsertSavedItem } from './external-items'
import { markItemSaved, markItemUnsaved } from './save-item'
import { executeRemoteActions } from './remote-action-queue'
import { fetchAllFeeds, markFeedRead, inflateFeeds, subscribeToFeed, subscribeToFeeds, unsubscribeFromFeed, unsubscribeFromFeeds } from './feeds'
import { primeAllBackends, primeBackend } from './backend'
import { unsetBackend } from '../backends'
import { getConfig, getFeeds, getFeedsLocal, getLastUpdated } from './selectors'
import { createCategory, deleteCategory, getCategories, updateCategory } from './categories'
import { ADD_FEED_TO_CATEGORY, CREATE_CATEGORY, DELETE_CATEGORY, REMOVE_FEED_FROM_CATEGORY, UPDATE_CATEGORY } from '../store/categories/types'
import { createAnnotation, deleteAnnotation, updateAnnotation } from './annotations'
import { setItemTitleFontSize } from './update-item'
import { Platform } from 'react-native'
import { MINIMUM_UPDATE_INTERVAL } from '@/components/AppStateListener'
import { deactivateNudge, pauseNudge } from './nudges'
import { TakeableChannel } from 'redux-saga'

let downloadsFork

function * init () {
  yield primeAllBackends()

  // see comment below about START_DOWNLOADS
  if (Platform.OS === 'web') {
    //downloadsFork = yield fork(startDownloads, true)
  }
}

function * startDownloads (shouldSleep = false) {
  if (shouldSleep) {
    // let the app render and get started
    yield delay(5000)
  }
  const lastUpdated: number = yield select(getLastUpdated, ItemType.unread)
  const feedsLocal: FeedLocal[] = yield select(getFeedsLocal)
  console.log('clearReadItems')
  yield call(clearReadItems)
  try {
    console.log(`Last updated: ${lastUpdated}, now: ${Date.now()}`)
    console.log(`MINIMUM_UPDATE_INTERVAL: ${MINIMUM_UPDATE_INTERVAL}`)
    if (Date.now() - lastUpdated > MINIMUM_UPDATE_INTERVAL ||
      feedsLocal.filter((fl) => fl.isNew).length > 0) {
      console.log('fetchAllFeeds')
      yield call(fetchAllFeeds)
      console.log('fetchAllItems')
      yield call(fetchAllItems, true)
    }
    console.log('pruneItems')
    yield call(pruneItems)
    yield call(decorateItems)
    yield call(executeRemoteActions)
  } catch (e) {
    console.log(e)
    yield put({ type: CLEAR_MESSAGES })
  }  
}

function * killBackend ({ backend }: { backend: string }) {
  unsetBackend(backend)
  yield put({ type: CLEAR_MESSAGES })
  if (downloadsFork) {
    yield cancel(downloadsFork)
  }
}

function * initBackend (action: setBackendAction) {
  yield primeBackend(action)
  if (action.backend === 'feedbin' || action.backend === 'reams') {
    yield startDownloads()
  }
}

export function * initSagas () {
  let rehydrated = false
  let authenticated = false

  yield takeEvery(REHYDRATE, init)
  yield takeEvery(SET_BACKEND, initBackend)
  yield takeEvery(UNSET_BACKEND, killBackend)
  
  // called by the AuthProvider
  // on non-web, the AuthProvider is behind the PersistGate, so it will be called after rehydration
  // on web, it's all up for grabs - I should investigate why I can't use PersistGate on web
  yield takeEvery(START_DOWNLOADS, startDownloads)

  yield takeEvery(ADD_FEED, subscribeToFeed)
  yield takeEvery(ADD_FEEDS, subscribeToFeeds)
  yield takeEvery(MARK_FEED_READ, markFeedRead)
  yield takeEvery(UPDATE_FEEDS, fetchUnreadItems)
  yield takeEvery(REMOVE_FEED, unsubscribeFromFeed)
  yield takeEvery(REMOVE_FEEDS, unsubscribeFromFeeds)

  yield takeEvery(SAVE_ITEM, markItemSaved)
  yield takeEvery(UNSAVE_ITEM, markItemUnsaved)
  yield takeEvery(ITEM_DECORATION_SUCCESS, maybeUpsertSavedItem)
  yield takeEvery(SET_TITLE_FONT_SIZE, setItemTitleFontSize)
  yield takeEvery(FETCH_ITEMS, fetchAllItems, true)
  yield takeEvery(FETCH_ITEMS, clearReadItems)
  yield takeEvery(CLEAR_READ_ITEMS, clearReadItems)
  yield takeEvery(RECEIVED_REMOTE_READ_ITEMS, filterItemsForRead)
  yield takeEvery(UPDATE_CURRENT_INDEX, markLastItemReadIfDecorated)
  yield takeEvery(REMOVE_ITEMS, removeItems)
  yield takeEvery(SAVE_EXTERNAL_URL, saveExternalUrl)
  
  yield takeEvery(DELETE_CATEGORY, deleteCategory)
  yield takeEvery(UPDATE_CATEGORY, updateCategory)
  yield takeEvery(ADD_FEED_TO_CATEGORY, updateCategory)
  yield takeEvery(REMOVE_FEED_FROM_CATEGORY, updateCategory)

  yield takeEvery('annotations/createAnnotation', createAnnotation)
  yield takeEvery('annotations/updateAnnotiation', updateAnnotation)
  yield takeEvery('annotations/deleteAnnotiation', deleteAnnotation)

  // reading timer
  yield takeEvery(UPDATE_CURRENT_INDEX, currentItemChanged)
  yield takeEvery(STATE_ACTIVE, appActive)
  yield takeEvery(STATE_INACTIVE, appInactive)
  yield takeEvery(ITEMS_SCREEN_FOCUS, screenActive)
  yield takeEvery(ITEMS_SCREEN_BLUR, screenInactive)

  // nudges
  yield takeEvery(PAUSE_NUDGE, pauseNudge)
  yield takeEvery(DEACTIVATE_NUDGE, deactivateNudge)
}
