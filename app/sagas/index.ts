import { call, cancel, delay, fork, select, takeEvery } from 'redux-saga/effects'
import { REHYDRATE } from 'redux-persist'
import { 
  SET_BACKEND, 
  SET_EXTRA_BACKEND, 
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
  UPDATE_FEEDS,
  SET_FEEDS
} from '../store/feeds/types'
import {
  FETCH_ITEMS,
  ITEMS_SCREEN_BLUR,
  ITEMS_SCREEN_FOCUS
} from '../store/ui/types'
import { decorateItems } from './decorate-items'
import { fetchAllItems, fetchUnreadItems } from './fetch-items'
import { markLastItemRead, clearReadItems, filterItemsForRead } from './mark-read'
import { dedupeSaved, pruneItems, removeItems, removeAllItems } from './prune-items'
import { appActive, appInactive, currentItemChanged, screenActive, screenInactive } from './reading-timer'
import { saveExternalUrl, maybeUpsertSavedItem } from './external-items'
import { inflateItems } from './inflate-items'
import { markItemSaved, markItemUnsaved } from './save-item'
import { executeRemoteActions } from './remote-action-queue'
import { fetchAllFeeds, markFeedRead, inflateFeeds, subscribeToFeed, subscribeToFeeds, unsubscribeFromFeed } from './feeds'
import { initBackend, initOtherBackends } from './backend'
import { unsetBackend } from '../backends'
import { getConfig } from './selectors'
import { createCategory, deleteCategory, getCategories, updateCategory } from './categories'
import { ADD_FEED_TO_CATEGORY, CREATE_CATEGORY, DELETE_CATEGORY, REMOVE_FEED_FROM_CATEGORY, UPDATE_CATEGORY } from '../store/categories/types'
import { ADD_ANNOTATION, DELETE_ANNOTATION, EDIT_ANNOTATION } from '../store/annotations/types'
import { addAnnotation, deleteAnnotation, editAnnotation } from './annotations'
import { RootState } from 'store/reducers'
import { UserState } from 'store/user/user'

let downloadsFork

function * init (action: any) {
  if (action.key && action.key !== 'primary') return
  const user: UserState = yield select((state: RootState) => state.user)

  const readwiseToken = user.backends.find(b => b.name === 'readwise')?.accessToken
  if (readwiseToken) {
    yield initOtherBackends({
      backend: 'readwise',
      credentials: {
        token: readwiseToken
      }
    })
  }

  const isFeedbin = user.backends.find(b => b.name === 'feedbin')
  if (isFeedbin) {
    yield initBackend(action)
    yield dedupeSaved()
    yield call(inflateItems)
    downloadsFork = yield fork(startDownloads, 'feedbin')
  }
}

export function * backgroundFetch (callback: () => void) {
  yield call(fetchAllItems, false)
  yield call(clearReadItems)
  yield call(pruneItems)
  callback()
}

function * startDownloads (backend) {
  if (global.isStarting) {
    // let the app render and get started
    yield delay(5000)
  }
  yield call(fetchAllFeeds)
  yield call(fetchAllItems)
  yield call(clearReadItems)
  yield call(pruneItems)
  yield call(getCategories)
  yield call(decorateItems)
  yield call(executeRemoteActions)
  yield call(inflateFeeds)  
}

function * killBackend () {
  unsetBackend()
  if (!!downloadsFork) {
    yield cancel(downloadsFork)
  }
}

export function * initSagas () {
  yield takeEvery(REHYDRATE, init)
  yield takeEvery(SET_BACKEND, init)
  yield takeEvery(UNSET_BACKEND, removeAllItems)
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
  yield takeEvery(UNSAVE_ITEM, inflateItems)
  yield takeEvery(SET_DISPLAY_MODE, inflateItems)
  yield takeEvery(UPDATE_CURRENT_INDEX, inflateItems)
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

  yield takeEvery(ADD_ANNOTATION, addAnnotation)
  yield takeEvery(EDIT_ANNOTATION, editAnnotation)
  yield takeEvery(DELETE_ANNOTATION, deleteAnnotation)

  // reading timer
  yield takeEvery(UPDATE_CURRENT_INDEX, currentItemChanged)
  yield takeEvery(STATE_ACTIVE, appActive)
  yield takeEvery(STATE_INACTIVE, appInactive)
  yield takeEvery(ITEMS_SCREEN_FOCUS, screenActive)
  yield takeEvery(ITEMS_SCREEN_BLUR, screenInactive)
}
