import { call, put, select, take } from 'redux-saga/effects'
import { eventChannel, END } from 'redux-saga'

import { fetchUnreadItems } from '../backends'
import {
  addUnreadItemsToFirestore,
  upsertFeedsFS,
  incrementUnreadCountFS,
  updateFeedsFS
} from '../firestore/'
import { mergeItems, id } from '../../utils/merge-items.js'
import { getFeedColor } from '../../utils/'
import { checkOnline } from './check-online'
import { inflateItems } from './inflate-items'
import { nullValuesToEmptyStrings,
  fixRelativePaths,
  addStylesIfNecessary,
  setShowCoverImage,
} from '../../utils/item-utils'
import { getItems, getCurrentItem, getFeeds, getIndex, getUid } from './selectors'

const RNFS = require('react-native-fs')


let feeds

export function * fetchItems2 () {
  const isOnline = yield checkOnline()
  if (!isOnline) return

  yield put({
    type: 'ITEMS_IS_LOADING',
    isLoading: true
  })

  const feeds = yield select(getFeeds)
  const oldItems = yield select(getItems, 'items')
  const currentItem = yield select(getCurrentItem)
  const index = yield select(getIndex)

  const itemsChannel = yield call(fetchItemsChannel, oldItems, currentItem, feeds)

  let isFirstBatch = true
  try {
    while (true) {
      let items = yield take(itemsChannel)
      yield receiveItems(items)
      if (isFirstBatch) {
        isFirstBatch = false
        // this is a little hacky, just getting ready to view some items
        yield inflateItems({ index })
      }
      console.log(items.length)
    }
  } catch (err) {
    console.log('ERROR FETCHING ITEMS: ' + err)
  } finally {
    yield put({
      type: 'FEEDS_SET_LAST_UPDATED',
      lastUpdated: Date.now()
    })
    yield put({
      type: 'ITEMS_FETCH_DATA_SUCCESS'
    })
    yield put({
      type: 'ITEMS_IS_LOADING',
      isLoading: false
    })
    yield put({
      type: 'ITEMS_UPDATE_CURRENT_INDEX',
      index: 0
    })
  }
}

function fetchItemsChannel (oldItems, currentItem, feeds) {
  return eventChannel(emitter => {
    fetchUnreadItems(oldItems, currentItem, feeds, emitter)
      .then(() => {
        emitter(END)
      })
    return _ => {
      console.log('Channel closed')
    }
  })
}

function * receiveItems (newItems) {
  debugger
  console.log('Received ' + newItems.length + ' new items')
  let currentFeeds = yield select(getFeeds)
  let { feeds, items } = yield createFeedsWhereNeededAndAddInfo(newItems, currentFeeds)
  items = items.map(nullValuesToEmptyStrings)
    .map(fixRelativePaths)
    .map(addStylesIfNecessary)
    .map(setShowCoverImage)
    .map(item => {
      return {
        ...item,
        date_fetched: Math.round(Date.now() / 1000)
      }
    })

  debugger
  yield call(addUnreadItemsToFirestore, items)
  yield call(incrementUnreadCountFS, items.length)
  feeds = incrementFeedUnreadCounts(items, feeds)
  yield call(upsertFeedsFS, feeds)

  // let itemsLite = []
  // for (var i = 0; i < items.length; i++) {
  //   itemsLite.push({
  //     _id: items[i]._id,
  //     id: items[i].id, // needed to match existing copy in store
  //     feed_id: items[i].feed_id,
  //     title: items[i].title,
  //     created_at: items[i].created_at,
  //     banner_image: items[i].bannerImage // needed by the feed component
  //   })
  // }

  // yield put({
  //   type: 'ITEMS_BATCH_FETCHED',
  //   items: itemsLite
  // })
}

function incrementFeedUnreadCounts (items, feeds) {
  feeds.forEach(feed => {
    const unreadInBatch = items.find(item => item.feed_id === feed._id)
    const numUnreadInBatch = unreadInBatch ? unreadInBatch.length : 0
    if (feed.unread_count) {
      feed.unread_count += numUnreadInBatch
    } else {
      feed.unread_count = numUnreadInBatch
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
  let newFeeds = []
  let oldFeeds = []
  items.forEach(item => {
    feed = feeds.find(feed => feed.id === item.feed_id || feed._id === item.feed_id)
    if (!feed) {
      feed = {
        id: item.feed_id,
        _id: id(),
        title: item.feed_title,
        color: getFeedColor(feeds)
      }
      feeds.push(feed)
    }
    item.feed_id = feed._id
    item.feed_color = feed.color
  })
  return { feeds, items }
}

export function * fetchItems () {
  const oldItems = yield select(getItems, 'items')
  const currentItem = yield select(getCurrentItem)
  let latestDate = 0
  if (oldItems.length > 0) {
    latestDate = [ ...oldItems ].sort((a, b) => b.created_at - a.created_at)[0].created_at
  }
  try {
    yield put({
      type: 'ITEMS_IS_LOADING',
      isLoading: true
    })
    const newItems = yield fetchUnreadItems(latestDate)
    yield put({
      type: 'ITEMS_IS_LOADING',
      isLoading: true,
      numItems: newItems.length
    })
    if (__DEV__) {
      newItems = newItems.slice(-100)
    }
    console.log(`Fetched ${newItems.length} items`)
    const { read, unread } = mergeItems(oldItems, newItems, currentItem)
    console.log(`And now I have ${unread.length} unread items`)
    yield put({
      type: 'ITEMS_FETCH_DATA_SUCCESS',
      items: unread
    })
    yield put({
      type: 'ITEMS_IS_LOADING',
      isLoading: false
    })
    // now remove the cached images for all the read items
    removeCachedCoverImages(read)
  } catch (error) {
    yield put({
      type: 'ITEMS_HAS_ERRORED',
      hasErrored: true,
      error
    })
  }
}

function removeCachedCoverImages (items) {
  if (!items) return
  for (let item of items) {
    if (item.imagePath) {
      RNFS.unlink(item.imagePath)
        .catch((error) => {
          console.log(error)
        })
    }
  }
}

