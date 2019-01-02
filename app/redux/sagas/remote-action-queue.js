import { NetInfo } from 'react-native'
import { delay } from 'redux-saga'
import { call, put, select, spawn } from 'redux-saga/effects'
import { markItemRead, markFeedRead } from '../backends'
import { markFeedReadFS, updateItemFS, addReadItemFS, addReadItemsFS } from '../firestore/'
import { deleteItemsAS, updateItemAS } from '../async-storage/'
// import { addStaleItem } from '../realm/stale-items'
import { getRemoteActions, getUnreadItems } from './selectors'
import { checkOnline } from './check-online'

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

        // mark item read in Firestore
        // NB this will mean that Firebase's readAt value is different to the Redux store
        // does this matter? who knows...?
        updateItemAS({
          ...action.item,
          readAt: Date.now()
        })
        addReadItemFS(action.item)

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
        const olderThan = action.olderThan || (Date.now() / 1000)

        // first, the backend
        // markFeedRead is a backend function that needs to take the backend's feed id
        yield call(markFeedRead, action.originalId, olderThan)

        // now rizzle
        const items = yield select(getUnreadItems)
        const itemsToMarkRead = items.filter(item => item.feed_id === action.id &&
          item.created_at < olderThan)
        yield call(addReadItemsFS, itemsToMarkRead)
        yield call(deleteItemsAS, itemsToMarkRead)
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
