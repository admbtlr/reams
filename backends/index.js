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
  switch (backend) {
    case 'basic':
    case 'reams':
      return await reams.fetchItems(callback, type, lastUpdated, oldItems, feeds, MAX_ITEMS_TO_DOWNLOAD)
    case 'feedwrangler':
      return await feedwrangler.fetchItems(callback, type, lastUpdated, oldItems, feeds, MAX_ITEMS_TO_DOWNLOAD)
    case 'feedbin':
      return await feedbin.fetchItems(callback, type, lastUpdated, oldItems, feeds, MAX_ITEMS_TO_DOWNLOAD)
  }
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
  switch (backend) {
    case 'basic':
    case 'reams':
      return reams.markItemRead(item)
    case 'feedwrangler':
      return feedwrangler.markItemRead(item)
    case 'feedbin':
      return feedbin.markItemRead(item)
  }
}

export async function markItemsRead (items, feedId = null, olderThan = null) {
  switch (backend) {
    case 'basic':
    case 'reams':
      return reams.markItemsRead(items)
    case 'feedwrangler':
      if (feedId) {
        return feedwrangler.markFeedRead(feedId, olderThan)
      } else {
        return feedwrangler.markItemsRead(items)
      }
    case 'feedbin':
      return feedbin.markItemsRead(items)
  }
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
  switch (backend) {
    case 'basic':
    case 'reams':
      return await reams.saveExternalItem(item, folder)
      break
    case 'feedbin':
      return await feedbin.saveExternalItem(item)
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

export function fetchFeeds () {
  switch (backend) {
    case 'basic':
    case 'reams':
      return reams.fetchFeeds()
    case 'feedwrangler':
      return feedwrangler.fetchFeeds()
    case 'feedbin':
      return feedbin.fetchFeeds()
  }
}

export async function addFeed (feed) {
  let id
  switch (backend) {
    case 'basic':
    case 'reams':
      return reams.addFeed(feed)
    case 'feedwrangler':
      id = await feedwrangler.addFeed(feed)
      feed.id = id
      return feed
    case 'feedbin':
      id = await feedbin.addFeed(feed)
      feed.id = id
      return feed
  }
}

export function updateFeed (feed) {
  switch (backend) {
    case 'basic':
    case 'reams':
      return reams.updateFeed(feed)
  }
}

export function removeFeed (feed) {
  switch (backend) {
    case 'basic':
    case 'reams':
      return reams.removeFeed(feed)
    case 'feedwrangler':
      return feedwrangler.removeFeed(feed)
    case 'feedbin':
      return feedbin.removeFeed(feed)
  }
}

export async function getFeedDetails (feed) {
  switch (backend) {
    case 'feedwrangler':
      feed = await feedwrangler.getFeedDetails(feed)
  }
  return await reams.getFeedDetails(feed)
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
