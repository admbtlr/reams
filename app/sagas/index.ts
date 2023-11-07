import { call, cancel, delay, fork, put, select, takeEvery } from 'redux-saga/effects'
import { REHYDRATE } from 'redux-persist'
import { 
  STATE_ACTIVE,
  STATE_INACTIVE, 
} from '../store/config/types'
import {
  SET_BACKEND, 
  SET_EXTRA_BACKEND, 
  UNSET_BACKEND
} from '../store/user/types'
import {
  CLEAR_READ_ITEMS,
  ITEM_DECORATION_SUCCESS,
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
  ADD_FEED_SUCCESS,
  ADD_FEEDS,
  ADD_FEEDS_SUCCESS,
  MARK_FEED_READ,
  REMOVE_FEED,
  UPDATE_FEEDS,
  SET_FEEDS
} from '../store/feeds/types'
import {
  CLEAR_MESSAGES,
  FETCH_ITEMS,
  ITEMS_SCREEN_BLUR,
  ITEMS_SCREEN_FOCUS,
} from '../store/ui/types'
import { decorateItems } from './decorate-items'
import { fetchAllItems, fetchUnreadItems } from './fetch-items'
import { markLastItemRead, clearReadItems, filterItemsForRead } from './mark-read'
import { dedupeSaved, pruneItems, removeItems, removeAllItems } from './prune-items'
import { appActive, appInactive, currentItemChanged, screenActive, screenInactive } from './reading-timer'
import { saveExternalUrl, maybeUpsertSavedItem } from './external-items'
import { markItemSaved, markItemUnsaved } from './save-item'
import { executeRemoteActions } from './remote-action-queue'
import { fetchAllFeeds, markFeedRead, inflateFeeds, subscribeToFeed, subscribeToFeeds, unsubscribeFromFeed } from './feeds'
import { primeAllBackends, primeBackend } from './backend'
import { unsetBackend } from '../backends'
import { getConfig } from './selectors'
import { createCategory, deleteCategory, getCategories, updateCategory } from './categories'
import { ADD_FEED_TO_CATEGORY, CREATE_CATEGORY, DELETE_CATEGORY, REMOVE_FEED_FROM_CATEGORY, UPDATE_CATEGORY } from '../store/categories/types'
import { createAnnotation, deleteAnnotation, updateAnnotation } from './annotations'
import { RootState } from 'store/reducers'
import { UserState } from 'store/user/user'
import { setItemTitleFontSize } from './item-title-font'

let downloadsFork: any

function * init (action: any) {
  yield primeAllBackends()
  downloadsFork = yield fork(startDownloads)
}

function * startDownloads () {
  if (global.isStarting) {
    // let the app render and get started
    yield delay(5000)
  }
  try {
    yield call(fetchAllFeeds)
    yield call(fetchAllItems)
    yield call(clearReadItems)
    yield call(pruneItems)
    yield call(getCategories)
    yield call(decorateItems)
    yield call(executeRemoteActions)
    yield call(inflateFeeds)    
  } catch (e: any) {
    console.log(e)
    yield put({ type: CLEAR_MESSAGES })
  }
}

function * killBackend ({ backend }: { backend: string }) {
  unsetBackend(backend)
  yield put({ type: CLEAR_MESSAGES })
  if (!!downloadsFork) {
    yield cancel(downloadsFork)
  }
}

function * initBackend (action: any) {
  yield primeBackend(action)
  if (action.backend === 'feedbin' || action.backend === 'reams') {
    yield startDownloads()
  }
}

export function * initSagas () {
  yield takeEvery(REHYDRATE, init)
  yield takeEvery(SET_BACKEND, initBackend)
  yield takeEvery(UNSET_BACKEND, killBackend)
  yield takeEvery(ADD_FEED, subscribeToFeed)
  yield takeEvery(ADD_FEEDS, subscribeToFeeds)
  yield takeEvery(MARK_FEED_READ, markFeedRead)
  yield takeEvery(ADD_FEED_SUCCESS, inflateFeeds)
  yield takeEvery(ADD_FEED_SUCCESS, fetchUnreadItems)
  yield takeEvery(ADD_FEEDS_SUCCESS, inflateFeeds)
  yield takeEvery(ADD_FEEDS_SUCCESS, fetchUnreadItems)
  yield takeEvery(UPDATE_FEEDS, fetchUnreadItems)
  yield takeEvery(SET_FEEDS, fetchUnreadItems)
  yield takeEvery(REMOVE_FEED, unsubscribeFromFeed)
  yield takeEvery(SAVE_ITEM, markItemSaved)
  yield takeEvery(UNSAVE_ITEM, markItemUnsaved)
  yield takeEvery(ITEM_DECORATION_SUCCESS, maybeUpsertSavedItem)
  yield takeEvery(SET_TITLE_FONT_SIZE, setItemTitleFontSize)
  yield takeEvery(FETCH_ITEMS, fetchAllItems)
  yield takeEvery(FETCH_ITEMS, clearReadItems)
  yield takeEvery(CLEAR_READ_ITEMS, clearReadItems)
  yield takeEvery(RECEIVED_REMOTE_READ_ITEMS, filterItemsForRead)
  yield takeEvery(UPDATE_CURRENT_INDEX, markLastItemRead)
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
}
