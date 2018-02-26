import { delay } from 'redux-saga'
import { call, put, takeEvery, select, spawn } from 'redux-saga/effects'
import { fetchUnreadItems, markItemRead, loadMercuryStuff } from '../backends'
import { mergeItems, id } from './merge-items.js'
import { REHYDRATE } from 'redux-persist'
const RNFS = require('react-native-fs')

import { getItems, getCurrentItem, getFeeds, getDisplay } from './selectors'

import { decorateItems } from './decorate-items'
import { fetchItems } from './fetch-items'
import { markLastItemRead } from './mark-read'
import { saveExternalUrl } from './external-items'

function unsubscribeFromFeed () {}

export function * updateCurrentIndex () {
  yield takeEvery('ITEMS_FETCH_ITEMS', fetchItems)
  yield takeEvery('ITEMS_UPDATE_CURRENT_INDEX', markLastItemRead)
  yield takeEvery('SAVE_EXTERNAL_URL', saveExternalUrl)
  yield takeEvery(REHYDRATE, fetchItems)
  yield takeEvery('ITEMS_FETCH_DATA_SUCCESS', decorateItems)
}
