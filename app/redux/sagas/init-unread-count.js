import { call, put } from 'redux-saga/effects'
import { getUid } from './selectors'
import { getUnreadCountFS, listenToUnreadCountFS } from '../firestore'
import { deflateItem } from '../../utils/item-utils'

export function * initUnreadCount (getFirebase, uid) {
  debugger
  listenToUnreadCountFS(unreadCountListener, error => {
    console.log('Error getting unread count')
  })
  const unreadCount = yield call(getUnreadCountFS)
  yield unreadCountListener(unreadCount)
}

function * unreadCountListener (unreadCount) {
  debugger
  yield put({
    type: 'ITEMS_META_SET_UNREAD_COUNT',
    unreadCount
  })
}