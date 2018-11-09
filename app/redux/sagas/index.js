// import { delay } from 'redux-saga'
import { takeEvery } from 'redux-saga/effects'
// import { fetchUnreadItems, markItemRead, loadMercuryStuff } from '../backends'
// import { mergeItems, id } from './merge-items.js'
import { REHYDRATE } from 'redux-persist'
// const RNFS = require('react-native-fs')

// import { getItems, getCurrentItem, getFeeds, getDisplay } from './selectors'

import { decorateItems } from './decorate-items'
import { fetchItems2 } from './fetch-items'
import { markLastItemRead } from './mark-read'
import { saveExternalUrl } from './external-items'
import { executeRemoteActions } from './remote-action-queue'
import { subscribeToFeed, seedFeeds } from './add-feed'

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
//     yield fetchItems2()
//     rehydrated = false
//     checkedBuckets = false
//   }
// }

export function * updateCurrentIndex () {
  yield takeEvery('ITEMS_FETCH_ITEMS', fetchItems2)
  yield takeEvery('ITEMS_UPDATE_CURRENT_INDEX', markLastItemRead)
  yield takeEvery('SAVE_EXTERNAL_URL', saveExternalUrl)
  yield takeEvery('FEEDS_ADD_FEED', subscribeToFeed)
  // yield takeEvery(REHYDRATE, seedFeeds)
  yield takeEvery(REHYDRATE, fetchItems2)
  yield takeEvery(REHYDRATE, executeRemoteActions)
  yield takeEvery('FEEDS_ADD_FEED_SUCCESS', fetchItems2)
  yield takeEvery('ITEMS_FETCH_DATA_SUCCESS', decorateItems)
}
