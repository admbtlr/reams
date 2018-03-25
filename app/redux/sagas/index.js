// import { delay } from 'redux-saga'
import { takeEvery } from 'redux-saga/effects'
// import { fetchUnreadItems, markItemRead, loadMercuryStuff } from '../backends'
// import { mergeItems, id } from './merge-items.js'
import { REHYDRATE } from 'redux-persist'
// const RNFS = require('react-native-fs')

// import { getItems, getCurrentItem, getFeeds, getDisplay } from './selectors'

import { decorateItems } from './decorate-items'
import { fetchItems, fetchItems2 } from './fetch-items'
import { markLastItemRead } from './mark-read'
import { saveExternalUrl } from './external-items'
import { executeRemoteActions } from './remote-action-queue'
import { addFeedUrl } from './add-feed'

function unsubscribeFromFeed () {}

export function * updateCurrentIndex () {
  yield takeEvery('ITEMS_FETCH_ITEMS', fetchItems2)
  yield takeEvery('ITEMS_UPDATE_CURRENT_INDEX', markLastItemRead)
  yield takeEvery('SAVE_EXTERNAL_URL', saveExternalUrl)
  yield takeEvery('FEEDS_ADD_FEED', addFeedUrl)
  yield takeEvery(REHYDRATE, fetchItems2)
  yield takeEvery(REHYDRATE, executeRemoteActions)
  yield takeEvery('ITEMS_FETCH_DATA_SUCCESS', decorateItems)
}
