import { delay } from 'redux-saga'
import { put, select } from 'redux-saga/effects'

import { getConfig } from './selectors'
import { setBackend } from '../backends/'

export function * initialConfig (action) {
  const config = yield select(getConfig)
  setBackend(config.backend)
}
