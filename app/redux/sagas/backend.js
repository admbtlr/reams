import { delay } from 'redux-saga'
import { call, put, select } from 'redux-saga/effects'
import { InteractionManager } from 'react-native'

import { addSavedItemsFS, upsertFeedsFS } from '../firestore'
import { getConfig, getFeeds, getItems } from './selectors'

export function * setRizzleBackend (action) {
  const newBackend = action.backend
  const currentBackend = yield select(getConfig)
  if (newBackend !== 'rizzle' || currentBackend === newBackend) return

  // copy existing feeds over to rizzle
  const feeds = yield select(getFeeds)
  yield call(upsertFeedsFS, feeds)

  // copy existing saved items over to rizzle
  const savedItems = yield select(getItems, 'saved')
  yield call(addSavedItemsFS, savedItems)
}
