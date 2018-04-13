import { NetInfo } from 'react-native'
import { delay } from 'redux-saga'
import { call, put, select, spawn } from 'redux-saga/effects'
import { markItemRead, markFeedRead } from '../backends'
import { addReadItem } from '../realm/read-items'
import { getRemoteActions } from './selectors'

const INITIAL_INTERVAL = 500
let interval = INITIAL_INTERVAL

export function * executeRemoteActions () {
  yield spawn(function * () {
    while (true) {
      yield call(delay, interval)
      yield executeOldestAction()
    }
  })
}

function * executeOldestAction () {
  const isOnline = yield checkOnline()
  if (isOnline) {
    interval = INITIAL_INTERVAL
    actions = yield select(getRemoteActions)
    if (actions.length > 0) {
      console.log(`${actions.length} remote actions to do`)
      yield executeAction(actions[0])
    }
  } else {
    interval = interval * 2
    interval = interval > 60000 ? 60000 : interval
    console.log(`Offline, setting remote action queue interval to ${interval}`)
  }
}

function * executeAction (action) {
  switch (action.type) {
    case 'ITEM_MARK_READ':
      console.log('Marking item read...')
      try {
        yield markItemRead(action.item)
        yield addReadItem(action.item)
        console.log('Marking item read... done')
        yield put({
          type: 'REMOTE_ACTIONS_ACTION_COMPLETED',
          action
        })
      } catch (error) {
        console.log(error)
      }
      break
    case 'FEED_MARK_READ':
      console.log('Marking feed read...')
      try {
        yield markFeedRead(action.id)
        console.log('Marking feed read... done')
        yield put({
          type: 'REMOTE_ACTIONS_ACTION_COMPLETED',
          action
        })
      } catch (error) {
        console.log(error)
      }
      break
  }
}

function checkOnline () {
  return fetch('https://www.google.com').then(response => {
    return response.status === 200
  }).catch(error => {
    return false
  })
  // return NetInfo.getConnectionInfo()
  //   .then((connectionInfo) => {
  //     return connectionInfo.type !== 'none'
  //   })
  //   .catch(error => {
  //     console.log(error)
  //   })
}
