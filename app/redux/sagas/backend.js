import { InteractionManager } from 'react-native'
import { eventChannel, END } from 'redux-saga'
import { call, put, select, spawn, take } from 'redux-saga/effects'

import { syncFeeds } from './feeds'
import { getItemsAS } from '../async-storage'
import { addSavedItemsFS, upsertFeedsFS, listenToFeeds, listenToReadItems, listenToSavedItems } from '../firestore'
import { getConfig, getFeeds, getItems, getUid, getUser } from './selectors'
import { setBackend } from '../backends'
import { receiveItems } from './fetch-items'
import { clearReadItems } from './mark-read'

export function * initBackend (getFirebase, action) {
  const config = yield select(getConfig)
  const user = yield select(getUser)

  let backend = config.backend
  let backendConfig = ({
    ...config,
    ...user
  })

  // are we setting a new backend, rather than just rehydrating?
  const isNew = action.type === 'CONFIG_SET_BACKEND'

  if (isNew) {
    backend = action.backend
    backendConfig = action
  }

  if (backend === 'rizzle') {
    const uid = yield select(getUid)
    backendConfig = {
      getFirebase,
      uid
    }
  }

  setBackend(backend, backendConfig)

  if (backend === 'rizzle') {
    if (isNew) {
      // copy existing feeds over to rizzle
      const feeds = yield select(getFeeds)
      yield call(upsertFeedsFS, feeds)

      // copy existing saved items over to rizzle
      let savedItems = yield select(getItems, 'saved')
      savedItems = savedItems.map(item => item.savedAt ?
        item :
        {
          ...item,
          savedAt: item.savedAt || item.created_at || Date.now()
        })
      savedItems = yield call(getItemsAS, savedItems)
      yield call(addSavedItemsFS, savedItems)
    }

    yield spawn(savedItemsListener)
    yield spawn(feedsListener)
    // yield spawn(readItemsListener)
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
  const removedSaved = items.removed
  yield put({
    type: 'ITEMS_UNSAVE_ITEMS',
    items: removedSaved
  })
}

function * receiveFeeds (dbFeeds) {
  const feeds = yield select(getFeeds)
  dbFeeds.forEach(dbFeed => {
    if (!feeds.find(feed => feed._id === dbFeed._id ||
      feed.url === dbFeed.url)) {
      feeds.push(dbFeed)
    }
  })
  yield put ({
    type: 'FEEDS_UPDATE_FEEDS',
    feeds
  })
}

function * receiveReadItems (items) {
  debugger
  yield put ({
    type: 'ITEMS_MARK_READ',
    items,
    clearItems: true
  })
  yield clearReadItems()
}
