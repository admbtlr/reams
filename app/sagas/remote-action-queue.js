import { InteractionManager } from 'react-native'
import { call, delay, put, select, spawn } from 'redux-saga/effects'
import { REMOTE_ACTION_COMPLETED } from '../store/config/types'
import { 
  MARK_ITEM_READ,
  MARK_ITEMS_READ 
} from '../store/items/types'
import { markItemRead, markItemsRead } from '../backends'
import { deleteItemsAS, updateItemAS } from '../storage/async-storage'
import { removeCachedCoverImages } from '../utils/item-utils'
import { getConfig, getRemoteActions, getUnreadItems } from './selectors'

const INITIAL_INTERVAL = 20000
let interval = INITIAL_INTERVAL

export function * executeRemoteActions () {
  yield spawn(function * () {
    while (true) {
      yield delay(interval)
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
    case MARK_ITEM_READ:
      try {
        if (action.item) {
          yield call(InteractionManager.runAfterInteractions)
          yield call (markItemRead, action.item)
          yield call(InteractionManager.runAfterInteractions)
          updateItemAS({
            ...action.item,
            readAt: Date.now()
          })
        }
        yield call(InteractionManager.runAfterInteractions)
        yield put({
          type: REMOTE_ACTION_COMPLETED,
          action
        })
      } catch (error) {
        console.log(error)
      }
      break
    case MARK_ITEMS_READ:
      try {
        yield call(InteractionManager.runAfterInteractions)
        yield call(markItemsRead, action.items, action.feedId, action.olderThan)
        // no need to update in Async Storage, since they'll be cleared anyway
        yield call(InteractionManager.runAfterInteractions)
        yield put({
          type: REMOTE_ACTION_COMPLETED,
          action
        })
      } catch (error) {
        console.log(error)
      }
      break
  }
}
