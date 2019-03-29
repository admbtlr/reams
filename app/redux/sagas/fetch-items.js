import { call, put, select, take } from 'redux-saga/effects'
import { eventChannel, END } from 'redux-saga'

import { fetchItems as fetchItemsBackends } from '../backends'
import {
  addUnreadItemsToFirestore,
  upsertFeedsFS,
  incrementUnreadCountFS,
  updateFeedsFS
} from '../firestore/'
import { clearItemsAS, setItemsAS } from '../async-storage/'
import { mergeItems, id } from '../../utils/merge-items.js'
import { getFeedColor } from '../../utils/'
import { checkOnline } from './check-online'
import { inflateItems } from './inflate-items'
import { nullValuesToEmptyStrings,
  fixRelativePaths,
  addStylesIfNecessary,
  sanitizeContent,
  removeCachedCoverImages,
  setShowCoverImage,
  deflateItem
} from '../../utils/item-utils'
import log from '../../utils/log'
import {
  getCurrentItem,
  getDisplay,
  getFeeds,
  getIndex,
  getItems,
  getLastUpdated,
  getUid
} from './selectors'


let feeds

export function * fetchAllItems (includeSaved = true) {
  const isOnline = yield checkOnline()
  if (!isOnline) return

  yield fetchItems('unread')
  if (includeSaved) {
    yield fetchItems('saved')
  }
  yield put({
    type: 'ITEMS_IS_LOADING',
    isLoading: false
  })
}

export function * fetchUnreadItems () {
  yield fetchAllItems(false)
}

export function * fetchItems (type = 'unread') {
  yield put({
    type: 'ITEMS_IS_LOADING',
    isLoading: true
  })
  const feeds = yield select(getFeeds)
  const oldItems = yield select(getItems, type)
  const currentItem = yield select(getCurrentItem, type)
  const index = yield select(getIndex, type)
  const lastUpdated = yield select(getLastUpdated, type)

  const itemsChannel = yield call(fetchItemsChannel, type, lastUpdated, oldItems, currentItem, feeds)

  let isFirstBatch = true
  try {
    while (true) {
      let items = yield take(itemsChannel)
      yield receiveItems(items, type)
      if (isFirstBatch) {
        isFirstBatch = false
        // this is a little hacky, just getting ready to view some items
        yield inflateItems({ index })
      }
    }
  } catch (err) {
    log('fetchItems', err)
  } finally {
    yield put({
      type: type === 'unread' ?
        'UNREAD_ITEMS_SET_LAST_UPDATED' :
        'SAVED_ITEMS_SET_LAST_UPDATED',
      lastUpdated: Date.now()
    })
    yield put({
      type: 'ITEMS_FETCH_DATA_SUCCESS'
    })
  }
}

function fetchItemsChannel (type, lastUpdated, oldItems, currentItem, feeds) {
  const logger = log
  return eventChannel(emitter => {
    fetchItemsBackends(emitter, type, lastUpdated, oldItems, currentItem, feeds)
      .then(() => {
        emitter(END)
      })
      .catch(err => {
        debugger
        logger('fetchItemsChannel', err)
      })
    return _ => {
      console.log('Channel closed')
    }
  })
}

function * receiveItems (items, type) {
  console.log('Received ' + items.length + ' new items')
  let feeds
  if (type === 'unread') {
    feeds = yield select(getFeeds)
    const updated = yield createFeedsWhereNeededAndAddInfo(items, feeds)
    feeds = updated.feeds
    items = updated.items
  }
  items = items.map(nullValuesToEmptyStrings)
    .map(fixRelativePaths)
    .map(addStylesIfNecessary)
    .map(sanitizeContent)
    .map(setShowCoverImage)
    .map(item => {
      return {
        ...item,
        date_fetched: Math.round(Date.now() / 1000)
      }
    })

  if (type === 'unread') {
    feeds = incrementFeedUnreadCounts(items, feeds)
    yield put({
      type: 'FEEDS_UPDATE_FEEDS',
      feeds
    })
  } else if (type === 'saved') {
    items = items.map(i => ({
      ...i,
      isSaved: true
    }))
  }

  yield call(setItemsAS, items)

  yield put({
    type: 'ITEMS_BATCH_FETCHED',
    items: items.map(deflateItem),
    itemType: type,
    feeds
  })
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
  let newOrUpdatedFeeds = []
  items.forEach(item => {
    feed = feeds.find(feed => feed.id === item.feed_id ||
      feed._id === item.feed_id ||
      feed.title === item.feed_title)
    if (!feed) {
      feed = {
        _id: id(),
      }
      feeds.push(feed)
    }
    if (!feed.id || !feed.title || ! feed.color) {
      feed.id = item.feed_id
      feed.title = item.feed_title
      feed.color = getFeedColor(feeds)
    }

    item.feed_id = feed._id
    item.feed_color = feed.color
  })
  return { feeds, items }
}

// export function * fetchItems () {
//   const oldItems = yield select(getItems, 'items')
//   const currentItem = yield select(getCurrentItem)
//   let latestDate = 0
//   if (oldItems.length > 0) {
//     latestDate = [ ...oldItems ].sort((a, b) => b.created_at - a.created_at)[0].created_at
//   }
//   try {
//     yield put({
//       type: 'ITEMS_IS_LOADING',
//       isLoading: true
//     })
//     const newItems = yield fetchUnreadItems(latestDate)
//     yield put({
//       type: 'ITEMS_IS_LOADING',
//       isLoading: true,
//       numItems: newItems.length
//     })
//     if (__DEV__) {
//       newItems = newItems.slice(-100)
//     }
//     console.log(`Fetched ${newItems.length} items`)
//     const { read, unread } = mergeItems(oldItems, newItems, currentItem)
//     console.log(`And now I have ${unread.length} unread items`)
//     yield put({
//       type: 'ITEMS_FETCH_DATA_SUCCESS',
//       items: unread
//     })
//     yield put({
//       type: 'ITEMS_IS_LOADING',
//       isLoading: false
//     })
//     // now remove the cached images for all the read items
//     removeCachedCoverImages(read)
//   } catch (error) {
//     yield put({
//       type: 'ITEMS_HAS_ERRORED',
//       hasErrored: true,
//       error
//     })
//   }
// }

