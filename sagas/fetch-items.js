import { call, cancelled, delay, fork, put, select, take } from 'redux-saga/effects'
import { eventChannel, END } from 'redux-saga'
import { InteractionManager, Platform } from 'react-native'

import {
  ITEMS_BATCH_FETCHED,
  MARK_ITEMS_READ,
  SET_LAST_UPDATED,
  ItemType,
  SET_SAVED_ITEMS,
  MARK_ITEMS_READ_SKIP_BACKEND
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
  getReadItems as getReadItemsBackends,
  isFetchPaginated
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
  getNewsletters,
  getUser,
} from './selectors'
import NetInfo from '@react-native-community/netinfo'
import { 
  setItems as setItemsSQLite,
  deleteItems as deleteItemsSQLite
} from '../storage/sqlite'
import { 
  setItems as setItemsIDB,
  deleteItems as deleteItemsIDB
} from '../storage/idb-storage'


let feeds
let savedItems = []

export function * fetchAllItems (includeSaved = true) {
  const netInfo = yield call(NetInfo.fetch)
  if (!netInfo.isInternetReachable) return
  yield put({
    type: ADD_MESSAGE,
    message: {
      messageString: 'Loading articles',
      hasEllipsis: true
    }
  })
  yield fetchItems(ItemType.unread)
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

function * addIsNewToFeeds () {
  let feeds = yield select(getFeeds)
  if (!feeds || feeds.length === 0) {
    return []
  }
  feeds = feeds.filter(f => !f.isMuted)
  const feedsLocal = yield select(getFeedsLocal)
  const feedsWithIsNew = feeds.map(f => {
    const feedLocal = feedsLocal.find(fl => fl._id === f._id)
    return feedLocal && feedLocal.isNew ? {
      ...f,
      isNew: true
    } : f
  })
  return feedsWithIsNew
}

function * getReadItemsFromBackendAndMarkRead () {
  const oldItems = yield select(getItems, ItemType.unread)
  const readItems = yield call(getReadItemsBackends, oldItems)
  if (readItems?.length > 0) {
    yield put({
      type: MARK_ITEMS_READ_SKIP_BACKEND,
      items: readItems
    })  
  }
}

export function * fetchItems (type = ItemType.unread) {
  const lastUpdated = yield select(getLastUpdated, type)
  if (lastUpdated === -1) {
    return
  }
  const feedsWithIsNew = type === ItemType.unread ? yield call(addIsNewToFeeds) : null
  const oldItems = yield select(getItems, type)
  if (type === ItemType.unread) {
    console.log('Calling getReadItemsFromBackendAndMarkRead')
    yield getReadItemsFromBackendAndMarkRead()
  }
  
  // feedbin is paged, so we need to keep fetching until we get no items
  // reams is not paged, so we only need to fetch once
  // if (isFetchPaginated()) {
    const itemsChannel = yield call(fetchItemsChannel, type, lastUpdated, oldItems, feedsWithIsNew)
    let isFirstBatch = true
    let didError = false
    try {
      while (true) {
        const items = yield take(itemsChannel)
        if (items.length > 0) {
          yield receiveItems(items, type)
          isFirstBatch = false
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
      }
      yield cleanupFetch(type, feedsWithIsNew)
      itemsChannel.close()
    }
  // } else {
  //   let items = yield call(fetchItemsBackends, receiveAndProcessItems, lastUpdated, oldItems, feedsWithIsNew)
  //   yield receiveAndProcessItems(items, type, true, 0)
  //   yield cleanupFetch(type, feedsWithIsNew)
  // }
}

function * cleanupFetch (type, feedsWithIsNew) {
  if (type === ItemType.unread) {
    const updatedFeeds = feedsWithIsNew?.filter(f => f.isNew).map(f => ({...f, isNew: false}))
    if (updatedFeeds?.length > 0) {
      yield put({
        type: UPDATE_FEEDS,
        feeds: updatedFeeds,
        skipFetchItems: true
      })
    }
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

function * receiveItems (items, type) {
  console.log('Received ' + items.length + ' new items')
  const feeds = yield select(getFeeds)
  const newsletters = yield select(getNewsletters)
  const config = yield select(getConfig)
  const sortDirection = config.itemSort
  if (type === ItemType.unread) {
    items = yield updateFeeds(items)
  }
  items = yield cleanUpItems(items, type)
  // yield call(InteractionManager.runAfterInteractions)
  // yield call(InteractionManager.runAfterInteractions)

  // saved items are not added to the store until the end
  // so that remotely unsaved items are removed from the store
  if (type === ItemType.saved) {
    const currentItems = yield select(getItems, ItemType.saved)
    const toAdd = items.filter(i => !currentItems.find(ci => ci._id === i._id))
    const toDelete = currentItems.filter(ci => !items.find(i => i._id === ci._id))
    yield addToLocalDatabase(toAdd)
    yield removeFromLocalDatabase(toDelete)
    yield put({
      type: SET_SAVED_ITEMS,
      items: items.map(deflateItem)
    })
  } else {
    yield addToLocalDatabase(items)
    // this is a mess of extra args because from redux 4 I can't access one reducer from another
    // so now I have to pass the feeds and sortDirection in the action
    // so that rizzleSort can use them :/
    yield put({
      type: ITEMS_BATCH_FETCHED,
      items: items.map(deflateItem),
      itemType: type,
      feeds: feeds.concat(newsletters),
      sortDirection,
      updatedFeeds
    })
  }
}

function * updateFeeds (items) {
  const feeds = yield select(getFeeds)
  const updated = yield createFeedsWhereNeededAndAddInfo(items, [...feeds])
  updatedFeeds = updated.feeds
  yield put({
    type: UPDATE_FEEDS,
    feeds: updatedFeeds,
    skipFetchItems: true
  })
  return updated.items
}

export function * cleanUpItems (items, type) {
  // remove all existing items from the new items
  // const existingItems = (yield select(getItems, type))?.filter(ei => items.find(i => i._id === ei._id))
  if (type === ItemType.saved) {
    items = items.map(i => ({...i, isSaved: true}))
  }

  return items
    // .filter(i => !existingItems.find(ei => ei._id === i._id))
    .map(nullValuesToEmptyStrings)
    .map(fixRelativePaths)
    .map(addStylesIfNecessary) //(item) => existingItems && existingItems.find(ei => ei._id === item._id) ? item : addStylesIfNecessary(item))
    .map(sanitizeContent)
    .map(fixCreatedAt)
    .map(setId)
}

function fixCreatedAt (item) {
  return {
    ...item,
    created_at: typeof item.created_at === 'number'
      ? (item.created_at > Date.parse('2000-01-01') ?
          item.created_at :
          item.created_at * 1000)
      : Date.parse(item.created_at),
    original_created_at: item.created_at
  }
}

function setId (item) {
  return {
    ...item,
    _id: item._id || id(item)
  }
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

function * addToLocalDatabase (items) {
  if (Platform.OS === 'web') {
    yield call(setItemsIDB, items)
  } else {
    yield call(setItemsSQLite, items)
  }
}

function * removeFromLocalDatabase (items) {
  if (Platform.OS === 'web') {
    yield call(deleteItemsIDB, items)
  } else {
    yield call(deleteItemsSQLite, items)
  }
}
