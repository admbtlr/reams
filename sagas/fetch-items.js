import { call, cancelled, delay, fork, put, select, take } from 'redux-saga/effects'
import { eventChannel, END } from 'redux-saga'
import { InteractionManager, Platform } from 'react-native'

import {
  ITEMS_BATCH_FETCHED,
  MARK_ITEMS_READ,
  SET_LAST_UPDATED,
  ItemType
} from '../store/items/types'
import {
  UPDATE_FEEDS
} from '../store/feeds/types'
import {
  ADD_MESSAGE,
  REMOVE_MESSAGE
} from '../store/ui/types'
import {
  fetchItems as fetchItemsBackends,
  getReadItems as getReadItemsBackends
} from '../backends'
import { getFeedColor, id } from '../utils'
import { nullValuesToEmptyStrings,
  fixRelativePaths,
  addStylesIfNecessary,
  sanitizeContent,
  deflateItem
} from '../utils/item-utils'
import log from '../utils/log'
import {
  getConfig,
  getCurrentItem,
  getFeeds,
  getFeedsLocal,
  getIndex,
  getItems,
  getLastUpdated,
  getUser,
} from './selectors'
import NetInfo from '@react-native-community/netinfo'
import { setItems as setItemsSQLite} from '../storage/sqlite'
import { setItems as setItemsIDB} from '../storage/idb-storage'


let feeds

export function * fetchAllItems (param = true) {

  const isConnectionOK = function* () {
    const netInfo = yield call(NetInfo.fetch)
    // console.log(netInfo)
    return netInfo.isInternetReachable
  }

  const connected = yield isConnectionOK()
  if (!connected) return

  yield put({
    type: ADD_MESSAGE,
    message: {
      messageString: 'Loading articles',
      hasEllipsis: true
    }
  })
  yield fetchItems(ItemType.unread)
  let includeSaved = typeof param === 'object'? !!param.includeSaved : param
  if (includeSaved) {
    yield fetchItems(ItemType.saved)
  }
  yield put({
    type: REMOVE_MESSAGE,
    messageString: 'Loading articles'
  })
}

export function * fetchUnreadItems (action) {
  if (action.skipFetchItems) return
  yield fetchAllItems(false)
}

export function * fetchItems (type = ItemType.unread) {
  let feedsWithIsNew

  if (type === ItemType.unread) {
    feedsWithIsNew = yield select(getFeeds)
    if (!feedsWithIsNew || feedsWithIsNew.length === 0) {
      return
    }
    feedsWithIsNew = feedsWithIsNew.filter(f => !f.isMuted)
    const feedsLocal = yield select(getFeedsLocal)
    feedsWithIsNew = feedsWithIsNew.map(f => {
      const feedLocal = feedsLocal.find(fl => fl._id === f._id)
      return feedLocal && feedLocal.isNew ? {
        ...f,
        isNew: true
      } : f
    })
  }

  const oldItems = yield select(getItems, type)
  const lastUpdated = yield select(getLastUpdated, type)

  if (lastUpdated === -1) {
    return
  }

  if (type === ItemType.unread) {
    const readItems = yield call(getReadItemsBackends, oldItems)
    if (readItems?.length > 0) {
      yield put({
        type: MARK_ITEMS_READ,
        items: readItems
      })  
    }
  }
  
  const itemsChannel = yield call(fetchItemsChannel, type, lastUpdated, oldItems, feedsWithIsNew)

  let isFirstBatch = true
  let didError = false
  try {
    let i = 0
    while (true) {
      let items = yield take(itemsChannel)
      if (items.length > 0) {
        yield fork(receiveAndProcessItems, items, type, isFirstBatch, i)
        isFirstBatch = false
        i++
      }
    }
  } catch (err) {
    didError = true
    log('fetchItems', err)
  } finally {
    // if isFirstBatch is still true, we didn't get any items
    // so don't set the last updated date
    if (!(didError || isFirstBatch)) {
      yield put({
        type: SET_LAST_UPDATED,
        itemType: type,
        lastUpdated: Date.now()
      })
      const updatedFeeds = feedsWithIsNew.filter(f => f.isNew).map(f => ({...f, isNew: false}))
      if (updatedFeeds.length > 0) {
        yield put({
          type: UPDATE_FEEDS,
          feeds: updatedFeeds,
          skipFetchItems: true
        })
      }
    }
    itemsChannel.close()
  }
}

function fetchItemsChannel (type, lastUpdated, oldItems, feeds) {
  const logger = log
  return eventChannel(emitter => {
    fetchItemsBackends(emitter, type, lastUpdated, oldItems, feeds)
      .then(() => {
        emitter(END)
      })
      .catch(err => {
        logger('fetchItemsChannel', err)
      })
    return () => {
      console.log('Channel closed')
    }
  })
}

function * receiveAndProcessItems (items, type, isFirstBatch, i) {
  const index = yield select(getIndex, type)
  yield call(InteractionManager.runAfterInteractions)
  yield receiveItems(items, type)
}

export function * receiveItems (items, type) {
  console.log('Received ' + items.length + ' new items')
  let feeds, updatedFeeds
  let now = Date.now()
  const config = yield select(getConfig)
  const sortDirection = config.itemSort
  if (type === ItemType.unread) {
    feeds = yield select(getFeeds)
    const updated = yield createFeedsWhereNeededAndAddInfo(items, [...feeds])
    updatedFeeds = updated.feeds
    items = updated.items
    console.log('createFeedsWhereNeededAndAddInfo took ' + (Date.now() - now))
    now = Date.now()
    yield put({
      type: UPDATE_FEEDS,
      feeds: updatedFeeds,
      skipFetchItems: true
    })
  }

  items = yield cleanUpItems(items, type)
  console.log('cleaning up items took ' + (Date.now() - now))
  now = Date.now()

  yield call(InteractionManager.runAfterInteractions)
  now = Date.now()
  if (Platform.OS === 'web') {
    yield call(setItemsIDB, items)
  } else {
    yield call(setItemsSQLite, items)
  }
  console.log('setItemsIDB took ' + (Date.now() - now))
  yield call(InteractionManager.runAfterInteractions)

  now = Date.now()
  items = items.map(deflateItem)
  console.log('deflating items took ' + (Date.now() - now))

  now = Date.now()
  // this is a mess of extra args because from redux 4 I can't access one reducer from another
  // so now I have to pass the feeds and sortDirection in the action
  // so that rizzleSort can use them :/
  yield put({
    type: ITEMS_BATCH_FETCHED,
    items,
    itemType: type,
    feeds,
    sortDirection,
    updatedFeeds
  })
  console.log(`ITEMS_BATCH_FETCHED (${type}) ${(Date.now() - now)}`)
}

export function * cleanUpItems (items, type) {
  const fixCreatedAt = (item) => ({
    ...item,
    created_at: typeof item.created_at === 'number'
      ? (item.created_at > Date.parse('2000-01-01') ?
          item.created_at :
          item.created_at * 1000)
      : Date.parse(item.created_at),
    original_created_at: item.created_at
  })
  const addDateFetched = item => ({
    ...item,
    date_fetched: Math.round(Date.now())
  })
  const currentItem = yield select(getCurrentItem)

  // actually this is sketchy because the items in the store might be deflated
  // OTOH, maybe this is OK, because any _visible_ items will probably be inflated
  //
  // WAIT, shouldn't I actually remove all existing items from the new items? 20240212
  // - maybe this is the cause of all the items in the store with null styles?
  const existingItems = (yield select(getItems, type))?.filter(ei => items.find(i => i._id === ei._id))
  // let's try that
  items = items.filter(i => !existingItems.find(ei => ei._id === i._id))

  const setSavedIfNecessary = item => type === ItemType.saved ?
    {
      ...item,
      isSaved: true
    } :
    item
  const setId = (item) => ({
    ...item,
    _id: item._id || id(item)
  })

  return items
    .map(nullValuesToEmptyStrings)
    .map(fixRelativePaths)
    .map(addStylesIfNecessary) //(item) => existingItems && existingItems.find(ei => ei._id === item._id) ? item : addStylesIfNecessary(item))
    .map(sanitizeContent)
    .map(fixCreatedAt)
    .map(addDateFetched)
    .map(setSavedIfNecessary)
    .map(setId)
}

function * createFeedsWhereNeededAndAddInfo (items, feeds) {
  let feed
  let item
  let newOrUpdatedFeeds = []
  for (var i = 0; i < items.length; i++) {
    // give the loop a chance to stop in case the fork has been cancelled
    yield delay(1)
    item = items[i]
    // note that we have to look at feed.feedbinId AND feed._id
    // this is for feeds that have been migrated from an external provider
    // to rizzle, whereby feed.feedbinId is the exernal provider's id, and
    // feed._id is rizzle's id
    feed = feeds.find(feed => feed.feedbinId === item.feed_id ||
      feed._id === item.feed_id ||
      feed.title === item.feed_title)
    if (!feed) {
      feed = {
        _id: id()
      }
      newOrUpdatedFeeds.push(feed)
    }
    if (!feed.title && item.feed_title) {
      if (__DEV__) debugger
      feed.title = item.feed_title
      if (!newOrUpdatedFeeds.find(f => f._id === feed._id)) {
        newOrUpdatedFeeds.push(feed)
      }
    }
    if (!feed.color) {
      if (__DEV__) debugger
      feed.color = getFeedColor()
      if (!newOrUpdatedFeeds.find(f => f._id === feed._id)) {
        newOrUpdatedFeeds.push(feed)
      }
    }

    item.feed_id = feed._id
    // item.feed_color = feed.color
    item.feed_title = feed.title
  }
  return { 
    feeds: newOrUpdatedFeeds, 
    items 
  }
}
