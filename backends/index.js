import SharedGroupPreferences from 'react-native-shared-group-preferences'
import log from '../utils/log'
import Config from 'react-native-config'

const feedbin = require('./feedbin')
const feedwrangler = require('./feedwrangler')
const reams = require('./reams')

// const group = 'group.com.adam-butler.rizzle'

const MAX_ITEMS_TO_DOWNLOAD = 1000

let backend
let backends = {
  feedbin,
  feedwrangler,
  reams,
  basic: reams,
  plus: reams
}

export async function setBackend (bcknd, config = {}) {
  backend = bcknd
  await backends[backend].init(config)
  // SharedGroupPreferences.setItem('backend', backend, group)
}

export function unsetBackend (bcknd) {
  if (bcknd === 'feedbin') {
    backend = 'reams'
  } else if (bcknd === 'reams') {
    backend = undefined
  }
}

export async function loadMercuryStuff (item) {
  const url = getMercuryUrl(item)
  const response = await fetch(url)
  if (response.ok) {
    return response.json()
  } else {
    log(`${response.url}: ${response.status} ${response.statusText}`)
    return
  }
}

export function getMercuryUrl (item) {
  let url = Config.API_URL + '/mercury?url=' +
    encodeURIComponent(item.url)
  return url
}

export async function getReadItems (oldItems) {
  let unreadOldItems
  switch (backend) {
    case 'basic':
    case 'reams':
    case 'feedwrangler':
      return []
    case 'feedbin':
      return await feedbin.getReadItems(oldItems)
  }
}

// old items are (fetched items + read items)
export async function fetchItems (callback, type, lastUpdated, oldItems, feeds) {
  if (backend === 'feedbin') {
    return await feedbin.fetchItems(callback, type, lastUpdated, oldItems, feeds, MAX_ITEMS_TO_DOWNLOAD)
  }
  return await reams.fetchItems(callback, type, lastUpdated, oldItems, feeds, MAX_ITEMS_TO_DOWNLOAD)
}

// export async function fetchSavedItems (savedItems, currentItem, feeds, lastUpdated, cb) {

//   // { readItems, newItems }
//   let items

//   if (backend === 'reams') {
//     items = await reams.getSavedItems(savedItems, MAX_ITEMS_TO_DOWNLOAD, lastUpdated, cb)
//   } else if (backend === 'feedwrangler') {
//     items = await feedwrangler.getSavedItems(savedItems, MAX_ITEMS_TO_DOWNLOAD, lastUpdated, cb)
//   }

//   return items
// }

export function fetchUnreadIds () {
  switch (backend) {
    case 'basic':
    case 'reams':
      return
    case 'feedwrangler':
      return feedwrangler.fetchUnreadIds()
  }
}

export async function markItemRead (item) {
  if (backend === 'feedbin') {
    feedbin.markItemRead(item)
  }
  return reams.markItemsRead([item])
}

export async function markItemsRead (items, feedId = null, olderThan = null) {
  if (backend === 'feedbin') {
    feedbin.markItemsRead(items)
  }
  return reams.markItemsRead(items)
}

export async function saveItem (item, folder) {
  switch (backend) {
    case 'basic':
    case 'reams':
      await reams.saveItem(item, folder)
      break
    case 'feedbin':
      await feedbin.saveItem(item)
      break
    case 'feedwrangler':
      await feedwrangler.saveItem(item)
      break
  }
  return item
}

export async function unsaveItem (item, folder) {
  switch (backend) {
    case 'basic':
    case 'reams':
      await reams.unsaveItem(item, folder)
      break
    case 'feedwrangler':
      await feedwrangler.unsaveItem(item)
      break
    case 'feedbin':
      await feedbin.unsaveItem(item)
      break
    }
  return item
}

export async function saveExternalItem (item, folder) {
  if (backend === 'feedbin') {
    return await feedbin.saveExternalItem(item)
  } else {
    return await reams.saveExternalItem(item, folder)
  }
}


// export function markFeedRead (feed, olderThan, items) {
//   switch (backend) {
//     case 'reams':
//       return reams.markItemsRead(items)
//     case 'feedwrangler':
//       return feedwrangler.markFeedRead(feed, olderThan)
//   }
// }

export async function fetchFeeds () {
  let feedsFeedbin = []
  if (backend === 'feedbin') {
    feedsFeedbin = await feedbin.fetchFeeds()
  }
  const feedsAlready = await reams.fetchFeeds()
  const feedsToAddToAlready = feedsFeedbin.filter(fb => !feedsAlready.find(fa => fa.feedbinId === fb.id))
  
  await reams.addFeeds(feedsToAddToAlready)

  return feedsAlready.concat(feedsToAddToAlready)
}

export async function addFeed (feed) {
  if (backend === 'feedbin') {
    feed.feedbinId = await feedbin.addFeed(feed)
  }
  return reams.addFeed(feed)
}

export function updateFeed (feed) {
  switch (backend) {
    case 'basic':
    case 'reams':
      return reams.updateFeed(feed)
  }
}

export function removeFeed (feed) {
  if (backend === 'feedbin') {
    feedbin.removeFeed(feed)
  }
  return reams.removeFeed(feed)
}

export async function getFeedMeta (feed) {
  return await reams.getFeedMeta(feed)
}

export async function getCategories () {
  switch (backend) {
    case 'feedbin':
      return await feedbin.getCategories()
  }
}

export async function createCategory (category) {
  switch (backend) {
    case 'feedbin':
      return await feedbin.createCategory(category)
  }
}

export async function updateCategory (category) {
  
  switch (backend) {
    case 'feedbin':
      return await feedbin.updateCategory(category)
  }
}

export async function deleteCategory (category) {
  switch (backend) {
    case 'feedbin':
      return await feedbin.deleteCategory(category)
  }
}

export function authenticate ({username, password, email}, backend) {
  switch (backend) {
    case 'basic':
    case 'reams':
      return
    case 'feedbin':
      return feedbin.authenticate(username, password)
    case 'feedwrangler':
      return feedwrangler.authenticate(username, password)
  }
}