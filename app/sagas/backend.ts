import { call, put, select, spawn, take } from 'redux-saga/effects'

import { SET_BACKEND } from '../store/config/types'
import { Annotation, EDIT_ANNOTATION } from '../store/annotations/types'
import {
  getAnnotations,
  getUser
} from './selectors'
import { setBackend } from '../backends'
import { createHighlights, init as initReadwise } from '../backends/readwise'
import { UserState } from 'store/user/user'

export function * initBackend (action) {
  // const config = yield select(getConfig)
  const user: UserState = yield select(getUser)

  let backend = user.backends?.find(b => b.name === 'feedbin') ? 'feedbin' : 'basic'
  let backendConfig = {}

  // are we setting a new backend, rather than just rehydrating?
  const isNew = action.type === SET_BACKEND

  if (isNew) {
    backend = action.backend
    backendConfig = action
  }

  if (backend === 'rizzle') {
    // const uid = yield select(getUid)
    // backendConfig = uid && uid.length > 0 ? {
    //     getFirebase,
    //     uid
    //   } : {}
    //   yield call(setBackend, backend, backendConfig)

    // if (isNew) {
    //   // set the user details
    //   const user = yield select(getUser)
    //   yield call(setUserDetails, user)
    // }

    // yield spawn(savedItemsListener)
    // yield spawn(feedsListener)
    // yield spawn(readItemsListener)
  } else {
    if (backend === 'feedbin') {
      const user: UserState = yield select(getUser)
      const feedbin = user.backends.find(b => b.name === 'feedbin')
      backendConfig = { username: feedbin?.username }
    }
    yield call(setBackend, backend, backendConfig)
  }
}

export function * initOtherBackends ({ backend, credentials }: { backend: string, credentials: { token: string} }) {
  if (backend === 'readwise') {
    initReadwise(credentials?.token)
    if (credentials?.token) {
      const annotations: Annotation[] = yield select(getAnnotations)
      const annotationsToUpload = annotations.filter(a => a.remote_id === undefined)
      if (annotationsToUpload.length > 0) {
        const response = yield call(createHighlights, annotationsToUpload)
        let i = 0
        for (let highlight of response) {
          yield put({ 
            type: EDIT_ANNOTATION, 
            annotation: { 
              ...annotationsToUpload[i++], 
              remote_id: highlight.modified_highlights[0] 
            },
            skipRemote: true
          })
        }
      }
    }
  }
}
