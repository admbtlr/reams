import { put, select } from 'redux-saga/effects'
const co = require('co')
import { fetchUnreadItems } from '../backends'
import { mergeItems, id } from '../../utils/merge-items.js'
import { getFeedColor } from '../../utils/'
import { checkOnline } from './check-online'
import { nullValuesToEmptyStrings,
  fixRelativePaths,
  addStylesIfNecessary,
  setShowCoverImage,
} from '../../utils/item-utils'

const RNFS = require('react-native-fs')

import { getItems, getCurrentItem, getFeeds } from './selectors'

let feeds
let getFirebase

export function * fetchItems2 (getFirebaseFn) {
  const isOnline = yield checkOnline()
  if (!isOnline) return

  yield put({
    type: 'ITEMS_IS_LOADING',
    isLoading: true
  })

  getFirebase = getFirebaseFn

  feeds = yield select(getFeeds)
  const oldItems = yield select(getItems, 'items')
  const currentItem = yield select(getCurrentItem)
  yield fetchUnreadItems(oldItems, currentItem, feeds, co.wrap(receiveItems, feeds))

  yield put({
    type: 'FEEDS_SET_LAST_UPDATED',
    lastUpdated: Date.now()
  })
  yield put({
    type: 'ITEMS_IS_LOADING',
    isLoading: false
  })

  // TODO: now remove the cached images for all the read items
  // removeCachedCoverImages(readItems)
}

function * receiveItems (newItems) {
  console.log('Received ' + newItems.length + ' new items')
  feeds = yield createFeedsWhereNeeded(newItems, feeds)
  const readyItems = addFeedInfoToItems(newItems, feeds)
    .map(nullValuesToEmptyStrings)
    .map(fixRelativePaths)
    .map(addStylesIfNecessary)
    .map(setShowCoverImage)
    .map(item => {
      return {
        ...item,
        date_fetched: Math.round(Date.now() / 1000)
      }
    })


  addToFirestore(readyItems)

  co(function* () {
    yield put({
      type: 'ITEMS_FETCH_DATA_SUCCESS',
      items: readyItems
    })
  }).then(_ => console.log('Done'))
}

function addToFirestore (items) {
  const db = getFirebase().firestore()
  let ref
  for (var i = 0; i < items.length; i++) {
    ref = db.collection('items-unread').doc(items[i]._id)
    ref.set(items[i])
  }
}

function addFeedInfoToItems(items, feeds, moreFeeds) {
  let allFeeds = []
  if (feeds) allFeeds = feeds
  if (moreFeeds) allFeeds = concat(allFeeds, moreFeeds)
  return items.map(item => {
    const feed = feeds.find(feed => feed.id === item.feed_id || feed._id === item.feed_id)
    return {
      ...item,
      feed_id: feed._id,
      feed_color: feed ? feed.color : null
    }
  })
}

function * createFeedsWhereNeeded (items, feeds) {
  let newFeeds = []
  items.forEach(item => {
    if (!feeds.find(feed => {
        return feed.id === item.feed_id || feed._id === item.feed_id
      })) {
      const newFeed = {
        id: item.feed_id,
        _id: id(),
        title: item.feed_title,
        color: getFeedColor(feeds)
      }
      newFeeds.push(newFeed)
      feeds.push(newFeed)
    }
  })
  yield put({
    type: 'FEEDS_ADD_FEEDS_SUCCESS',
    addedFeeds: newFeeds
  })
  return feeds
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

