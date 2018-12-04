import { takeEvery } from 'redux-saga/effects'
import { REHYDRATE } from 'redux-persist'

import { decorateItems } from './decorate-items'
import { fetchItems2 } from './fetch-items'
import { markLastItemRead } from './mark-read'
import { saveExternalUrl } from './external-items'
import { rehydrateItems } from './rehydrate-items'
import { inflateItems } from './inflate-items'
import { executeRemoteActions } from './remote-action-queue'
import { subscribeToFeed, seedFeeds } from './add-feed'
import { initialConfig } from './initial-config'

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

let getFirebaseFn



function * init (action, getFirebase) {
  if (action.key !== 'primary') return
  yield initialConfig()
  rehydrateItems(getFirebaseFn)
  yield fetchItems2(getFirebaseFn)
  yield executeRemoteActions(getFirebaseFn)
}

export function * updateCurrentIndex (getFirebase) {
  getFirebaseFn = getFirebase
  yield takeEvery(REHYDRATE, init)
  yield takeEvery('ITEMS_FETCH_ITEMS', fetchItems2)
  yield takeEvery('ITEMS_UPDATE_CURRENT_INDEX', inflateItems, getFirebase)
  yield takeEvery('ITEMS_UPDATE_CURRENT_INDEX', markLastItemRead)
  yield takeEvery('SAVE_EXTERNAL_URL', saveExternalUrl, getFirebase)
  yield takeEvery('FEEDS_ADD_FEED', subscribeToFeed)
  yield takeEvery('FEEDS_ADD_FEED_SUCCESS', fetchItems2)
  yield takeEvery('ITEMS_FETCH_DATA_SUCCESS', decorateItems)
}
