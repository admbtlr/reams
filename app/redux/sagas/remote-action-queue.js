import { InteractionManager, NetInfo } from 'react-native'
import { delay } from 'redux-saga'
import { call, put, select, spawn } from 'redux-saga/effects'
import { markItemRead, markItemsRead } from '../backends'
import { updateItemFS, addReadItemFS, addReadItemsFS } from '../firestore/'
import { deleteItemsAS, updateItemAS } from '../async-storage/'
import { removeCachedCoverImages } from '../../utils/item-utils'
import { getConfig, getRemoteActions, getUnreadItems } from './selectors'

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
    const config = yield select(getConfig)
    if (config.isOnline) {
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
  yield call(InteractionManager.runAfterInteractions)
  // console.log('Executing action: ' + action.type)
  switch (action.type) {
    case 'ITEM_MARK_READ':
      try {
        yield call (markItemRead, action.item)
        updateItemAS({
          ...action.item,
          readAt: Date.now()
        })
        yield put({
          type: 'REMOTE_ACTIONS_ACTION_COMPLETED',
          action
        })
      } catch (error) {
        console.log(error)
      }
      break
    case 'ITEMS_MARK_READ':
      try {
        yield call(markItemsRead, action.items, action.feedId, action.olderThan)
        // no need to update in Async Storage, since they'll be cleared anyway
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
