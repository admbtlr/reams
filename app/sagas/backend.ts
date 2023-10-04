import { call, put, select, spawn, take } from 'redux-saga/effects'

import { SET_BACKEND } from '../store/user/types'
import { Annotation, EDIT_ANNOTATION } from '../store/annotations/types'
import {
  getAnnotations,
  getUser
} from './selectors'
import { setBackend } from '../backends'
import { init as initFeedbin } from '../backends/feedbin'
import { createHighlights, init as initReadwise } from '../backends/readwise'
import { Backend, UserState } from 'store/user/user'
import { dedupeSaved } from './prune-items'
import { inflateItems } from './inflate-items'

export function * initBackend (action: any) {
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
      backendConfig = { username: feedbin?.username, password: feedbin?.password }
    }
    yield call(setBackend, backend, backendConfig)
  }
}

export function * primeAllBackends () {
  const backends: Backend[] = yield select((state: any) => state.user.backends)
  for (let backend of backends) {
    yield call(primeBackend, backend.name)
  }
  if (!backends.find((b: any) => b.name === 'feedbin')) {
    yield call(setBackend, 'reams', {})
  }
}

export function * primeBackend(backend: string | any) {
  switch (typeof backend === 'string' ? backend : backend.backend) {
    case 'feedbin':
      yield primeFeedbin()
      return
    case 'readwise':
      yield primeReadwise()
      return
    default:
      return
  }
}

function * primeFeedbin () {
  console.log('primeFeedbin')
  const backends: Backend[] = yield select((state: any) => state.user.backends)
  const credentials = backends.find((b: any) => b.name === 'feedbin')
  // yield call(initFeedbin, credentials)
  console.log('calling setBackend', credentials)
  yield call(setBackend, 'feedbin', credentials)
  yield dedupeSaved()
  yield call(inflateItems)
}

function * primeReadwise () {
  const credentials: Backend = yield select((state: any) => state.user.backends.find((b: any) => b.name === 'readwise'))
  if (credentials.accessToken === undefined) return
  initReadwise(credentials.accessToken)
  const annotations: Annotation[] = yield select(getAnnotations)
  const annotationsToUpload = annotations.filter(a => a.remote_id === undefined)
  if (annotationsToUpload.length > 0) {
    const response: { modified_highlights: string }[] = yield call(createHighlights, annotationsToUpload)
    let i = 0
    for (let highlight of response) {
      // now add the remote id to each annotation
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


export function * initOtherBackends ({ backend, credentials }: { backend: string, credentials: { token: string} }) {
  if (backend === 'readwise') {
    initReadwise(credentials?.token)
    if (credentials?.token) {
      const annotations: Annotation[] = yield select(getAnnotations)
      const annotationsToUpload = annotations.filter(a => a.remote_id === undefined)
      if (annotationsToUpload.length > 0) {
        const response: any[] = yield call(createHighlights, annotationsToUpload)
        let i = 0
        for (let highlight of response) {
          // now add the remote id to each annotation
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
