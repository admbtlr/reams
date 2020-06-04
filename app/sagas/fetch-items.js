import { call, cancelled, delay, fork, put, select, take } from 'redux-saga/effects'
import { eventChannel, END } from 'redux-saga'
import { InteractionManager } from 'react-native'

import {
  ITEMS_BATCH_FETCHED,
  SET_LAST_UPDATED,
  ItemType
} from '../store/items/types'
import {
  UPDATE_FEEDS
} from '../store/feeds/types'
import {
  fetchItems as fetchItemsBackends
} from '../backends'
import { setItemsAS } from '../storage/async-storage'
import { getFeedColor, id } from '../utils'
import { inflateItems } from './inflate-items'
import { nullValuesToEmptyStrings,
  fixRelativePaths,
  addStylesIfNecessary,
  sanitizeContent,
  removeCachedCoverImages,
  setShowCoverImage,
  deflateItem
} from '../utils/item-utils'
import log from '../utils/log'
import {
  getConfig,
  getCurrentItem,
  getDisplay,
  getFeeds,
  getFeedsLocal,
  getIndex,
  getItems,
  getLastUpdated,
  getUid
} from './selectors'


let feeds

export function * fetchAllItems (includeSaved = true) {
  const config = yield select(getConfig)
  if (!config.isOnline/* || !hasBackend()*/) return

  yield put({
    type: 'ITEMS_IS_LOADING',
    isLoading: true
  })
  yield fetchItems(ItemType.unread)
  if (includeSaved) {
    yield fetchItems(ItemType.saved)
  }
  yield put({
    type: 'ITEMS_IS_LOADING',
    isLoading: false
  })
}

export function * fetchUnreadItems (action) {
  if (action.skipFetchItems) return
  yield fetchAllItems(false)
}

export function * fetchItems (type = ItemType.unread) {
  let feeds

  if (type === ItemType.unread) {
    feeds = yield select(getFeeds)
    feeds = feeds.filter(f => !f.isMuted)
    const feedsLocal = yield select(getFeedsLocal)
    feeds = feeds.map(f => {
      const feedLocal = feedsLocal.find(fl => fl._id === f._id)
      return feedLocal && feedLocal.isNew ? {
        ...f,
        isNew: true
      } : f
    })
  }

  const oldItems = yield select(getItems, type)
  const lastUpdated = yield select(getLastUpdated, type)

  const itemsChannel = yield call(fetchItemsChannel, type, lastUpdated, oldItems, feeds)

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
      yield put({
        type: 'ITEMS_FETCH_DATA_SUCCESS'
      })
    }
    itemsChannel.close()
  }
}

function * receiveAndProcessItems (items, type, isFirstBatch, i) {
  const index = yield select(getIndex, type)
  yield call(InteractionManager.runAfterInteractions)
  yield receiveItems(items, type)
  if (isFirstBatch) {
    // this is a little hacky, just getting ready to view some items
    yield call(InteractionManager.runAfterInteractions)
    yield inflateItems({ index })
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
    return _ => {
      console.log('Channel closed')
    }
  })
}

export function * receiveItems (items, type) {
  console.log('Received ' + items.length + ' new items')
  let feeds
  let now = Date.now()
  if (type === ItemType.unread) {
    feeds = yield select(getFeeds)
    const updated = yield createFeedsWhereNeededAndAddInfo(items, feeds)
    feeds = updated.feeds
    items = updated.items
    console.log('createFeedsWhereNeededAndAddInfo took ' + (Date.now() - now))
    now = Date.now()
    yield put({
      type: UPDATE_FEEDS,
      feeds,
      skipFetchItems: true
    })
  }

  items = yield cleanUpItems(items, type)
  console.log('cleaning up items took ' + (Date.now() - now))
  now = Date.now()

  yield call(InteractionManager.runAfterInteractions)
  now = Date.now()
  yield call(setItemsAS, items)
  console.log('setItemsAS took ' + (Date.now() - now))
  yield call(InteractionManager.runAfterInteractions)

  now = Date.now()
  items = items.map(deflateItem)
  console.log('deflating items took ' + (Date.now() - now))

  now = Date.now()
  yield put({
    type: ITEMS_BATCH_FETCHED,
    items,
    itemType: type,
    feeds
  })
  console.log(`ITEMS_BATCH_FETCHED (${type}) ${(Date.now() - now)}`)
}

function * cleanUpItems (items, type) {
  const fixCreatedAt = (item) => ({
    ...item,
    created_at: typeof item.created_at === 'number'
      ? (item.created_at > Date.parse('Jan 01 2000') ?
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
  const setShowCoverImageIfNotCurrent = (item) => item === currentItem ?
    item :
    setShowCoverImage(item)
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
    .map(addStylesIfNecessary)
    .map(sanitizeContent)
    .map(setShowCoverImageIfNotCurrent)
    .map(fixCreatedAt)
    .map(addDateFetched)
    .map(setSavedIfNecessary)
    .map(setId)
}

function incrementFeedUnreadCounts (items, feeds) {
  feeds.forEach(feed => {
    const numUnreadInBatch = items.filter(item => item.feed_id === feed._id).length
    if (feed.number_unread) {
      feed.number_unread += numUnreadInBatch
    } else {
      feed.number_unread = numUnreadInBatch
    }
  })
  return feeds
}

// function addFeedInfoToItems(items, feeds, moreFeeds) {
//   let allFeeds = []
//   if (feeds) allFeeds = feeds
//   if (moreFeeds) allFeeds = concat(allFeeds, moreFeeds)
//   return items.map(item => {
//     const feed = feeds.find(feed => feed.id === item.feed_id || feed._id === item.feed_id)
//     return {
//       ...item,
//       feed_id: feed._id,
//       feed_color: feed ? feed.color : null
//     }
//   })
// }

function * createFeedsWhereNeededAndAddInfo (items, feeds) {
  let feed
  let item
  let newOrUpdatedFeeds = []
  for (var i = 0; i < items.length; i++) {
    // give the loop a chance to stop in case the fork has been cancelled
    yield delay(1)
    item = items[i]
    // note that we have to look at feed.id AND feed._id
    // this is for feeds that have been migrated from an external provider
    // to rizzle, whereby feed.id is the exernal provider's id, and
    // feed._id is rizzle's id
    feed = feeds.find(feed => feed.id === item.feed_id ||
      feed._id === item.feed_id ||
      feed.title === item.feed_title)
    if (!feed) {
      feed = {
        _id: id()
      }
      newOrUpdatedFeeds.push(feed)
    }
    if (feed.id === undefined) {
      debugger
      feed.id = item.feed_id
      if (!newOrUpdatedFeeds.find(f => f._id === feed._id)) {
        newOrUpdatedFeeds.push(feed)
      }
    }
    if (!feed.title && item.feed_title) {
      debugger
      feed.title = item.feed_title
      if (!newOrUpdatedFeeds.find(f => f._id === feed._id)) {
        newOrUpdatedFeeds.push(feed)
      }
    }
    if (!feed.color) {
      debugger
      feed.color = getFeedColor()
      if (!newOrUpdatedFeeds.find(f => f._id === feed._id)) {
        newOrUpdatedFeeds.push(feed)
      }
    }

    item.feed_id = feed._id
    item.feed_color = feed.color
    item.feed_title = feed.title
  }
  return { 
    feeds: newOrUpdatedFeeds, 
    items 
  }
}
