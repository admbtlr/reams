import { InteractionManager } from 'react-native'
import { eventChannel, END } from 'redux-saga'
import { call, put, select, spawn, take } from 'redux-saga/effects'

import { 
  RECEIVED_REMOTE_READ_ITEMS,
  UNSAVE_ITEMS 
} from '../store/items/types'
import { SET_BACKEND } from '../store/config/types'
import { 
  SET_FEEDS,
  UPDATE_FEEDS
} from '../store/feeds/types'
import {
  addSavedItemsFS,
  upsertFeedsFS,
  listenToFeeds,
  listenToReadItems,
  listenToSavedItems,
  setUserDetails
} from '../storage/firestore'
import {
  getConfig,
  getFeeds,
  getItems,
  getUid,
  getUser
} from './selectors'
import { setBackend } from '../backends'
import { receiveItems } from './fetch-items'
import { cacheCoverImage } from './decorate-items'

export function * initBackend (action) {
  const config = yield select(getConfig)
  const user = yield select(getUser)

  let backend = config.backend
  let backendConfig = ({
    ...config,
    ...user
  })

  // are we setting a new backend, rather than just rehydrating?
  const isNew = action.type === SET_BACKEND

  if (isNew) {
    backend = action.backend
    backendConfig = action
  }

  if (backend === 'rizzle') {
    const uid = yield select(getUid)
    backendConfig = uid && uid.length > 0 ? {
        getFirebase,
        uid
      } : {}
    setBackend(backend, backendConfig)

    if (isNew) {
      // set the user details
      const user = yield select(getUser)
      yield call(setUserDetails, user)
    }

    yield spawn(savedItemsListener)
    yield spawn(feedsListener)
    yield spawn(readItemsListener)
  } else {
    if (backend === 'feedbin') {
      const { username, password } = yield select(getUser)
      backendConfig = { username, password }
    }
    setBackend(backend, backendConfig)
  }
}

function * savedItemsListener () {
  const savedItemsChan = yield call(createChannel, listenToSavedItems)
  while (true) {
    let items = yield take(savedItemsChan)
    yield receiveSavedItems(items)

  }
}

function * readItemsListener () {
  const readItemsChan = yield call(createChannel, listenToReadItems)
  while (true) {
    let items = yield take(readItemsChan)
    yield receiveReadItems(items)
  }
}

function * feedsListener () {
  const feedsChan = yield call(createChannel, listenToFeeds)
  while (true) {
    let feeds = yield take(feedsChan)
    yield receiveFeeds(feeds)
  }
}

function createChannel (fn) {
  return eventChannel(emitter => {
    fn(emitter)
    return () => {
      console.log('Channel closed')
    }
  })
}

function * receiveSavedItems (items) {
  const savedItems = yield select(getItems, 'saved')
  const newSaved = items.added.filter(item => savedItems.find(si => si.url === item.url) === undefined)
  yield receiveItems(newSaved, 'saved')
  newSaved.forEach(item => {
    if (item.banner_image) {
      cacheCoverImage (item, item.banner_image)
    }
  })
  const removedSaved = items.removed
  if (removedSaved.length) {
    yield put({
      type: UNSAVE_ITEMS,
      items: removedSaved
    })
  }
}

function * receiveFeeds (dbFeeds) {
  let feeds = yield select(getFeeds)
  // is this necessary?
  feeds = feeds.map(f => f)
  let newFeeds = []
  dbFeeds.forEach(dbFeed => {
    if (!feeds.find(feed => feed._id === dbFeed._id ||
      feed.url === dbFeed.url)) {
      feeds.push(dbFeed)
      newFeeds.push(dbFeed)
    }
  })
  if (newFeeds.length > 0) {
    yield put ({
      type: SET_FEEDS,
      feeds
    })
  }
}

function * receiveReadItems (readItems) {
  yield put ({
    type: RECEIVED_REMOTE_READ_ITEMS,
    date: Date.now()
  })
}
