import { NetInfo } from 'react-native'
import { delay } from 'redux-saga'
import { call, put, select, spawn } from 'redux-saga/effects'
import { markItemRead, markFeedRead } from '../backends'
// import { addStaleItem } from '../realm/stale-items'
import { getRemoteActions } from './selectors'
import { checkOnline } from './check-online'

const INITIAL_INTERVAL = 500
let interval = INITIAL_INTERVAL
let getFirebase

export function * executeRemoteActions (getFirebaseFn) {
  getFirebase = getFirebaseFn
  yield spawn(function * () {
    while (true) {
      yield call(delay, interval)
      yield executeOldestAction()
    }
  })
}

function * executeOldestAction () {
  const actions = yield select(getRemoteActions)
  if (actions.length > 0) {
    const isOnline = yield checkOnline()
    if (isOnline) {
      interval = INITIAL_INTERVAL
      yield executeAction(actions[0])
    } else {
      interval = interval * 2
      interval = interval > 60000 ? 60000 : interval
      // console.log(`Offline, setting remote action queue interval to ${interval}`)
    }
  }
}

function * executeAction (action) {
  console.log('Executing action: ' + action.type)
  switch (action.type) {
    case 'ITEM_MARK_READ':
      // console.log('Marking item read...')
      try {
        yield markItemRead(action.item)

        const db = getFirebase().firestore()
        let ref = db.collection('items-read').doc(action.item._id)
        ref.set(action.item)
        db.collection('items-unread').doc(action.item._id).delete()

        // console.log('Marking item read... done')
        yield put({
          type: 'REMOTE_ACTIONS_ACTION_COMPLETED',
          action
        })
      } catch (error) {
        console.log(error)
      }
      break
    case 'FEED_MARK_READ':
      // console.log('Marking feed read...')
      try {
        yield markFeedRead(action.id)
        // console.log('Marking feed read... done')
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
