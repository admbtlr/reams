import { InteractionManager, Platform } from 'react-native'
import { call, delay, put, select, spawn } from 'redux-saga/effects'
import { REMOTE_ACTION_COMPLETED, REMOTE_ACTION_ERRORED } from '../store/config/types'
import { 
  MARK_ITEM_READ,
  MARK_ITEMS_READ 
} from '../store/items/types'
import { 
  CREATE_CATEGORY_REMOTE, 
  DELETE_CATEGORY_REMOTE, 
  UPDATE_CATEGORY, 
  UPDATE_CATEGORY_REMOTE 
} from '../store/categories/types'
import { createCategory, deleteCategory, markItemRead, markItemsRead, updateCategory } from '../backends'
import { getConfig, getRemoteActions, getUnreadItems } from './selectors'
import { updateItem as updateItemSQLite } from '../storage/sqlite'
import { updateItem as updateItemIDB } from '../storage/idb-storage'

const INITIAL_INTERVAL = 2000
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
  try {
    switch (action.type) {
      case MARK_ITEM_READ:
        try {
          if (action.item) {
            yield call(InteractionManager.runAfterInteractions)
            yield call (markItemRead, action.item)
            yield call(InteractionManager.runAfterInteractions)
            const readItem = {
              ...action.item,
              readAt: Date.now()
            }
            if (Platform.OS === 'web') {
              yield call(updateItemIDB, readItem)
            } else {
              yield call(updateItemSQLite, readItem)
            }
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
        yield execute(markItemsRead, action)
        break
      case CREATE_CATEGORY_REMOTE:
        yield execute(createCategory, action.category)
        break  
      case DELETE_CATEGORY_REMOTE:
        yield execute(deleteCategory, action.category)
        break  
      case UPDATE_CATEGORY_REMOTE:
        const newCat = yield execute(updateCategory, action)
        console.log('newCat', newCat)
        if (newCat.id !== action.category.id) {
          yield put({ type: UPDATE_CATEGORY, category: { ...action.category, id: newCat.id }, fromRemote: true })
        }    
      }  
  } catch (error) {
    console.log(error)
    yield put({
      type: REMOTE_ACTION_ERRORED,
      action
    })
  }
}

function * execute (type, action) {
  const params = type === markItemsRead ? [action.items, action.feedId, action.olderThan] : 
    [action.category] 
  try {
    yield call(InteractionManager.runAfterInteractions)
    const ret = yield call(type, ...params)
    yield call(InteractionManager.runAfterInteractions)
    yield put({
      type: REMOTE_ACTION_COMPLETED,
      action
    })
    return ret
  } catch (error) {
    console.log(error)
    throw error
  }
}
