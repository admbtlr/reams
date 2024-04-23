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

export function isFetchPaginated () {
  return backend === 'feedbin'
}

export async function loadMercuryStuff (item) {
  const url = getMercuryUrl(item)
  try {
    const response = await fetch(url)
    if (response.ok) {
      return response.json()
    } else {
      log(`${response.url}: ${response.status} ${response.statusText}`)
      return
    }  
  } catch (e) {
    log('loadMercuryStuff', e)
  }
}

export function getMercuryUrl (item) {
  let url = Config.API_URL + '/mercury?url=' +
    encodeURIComponent(item.url)
  if (item.isNewsletter) {
    url += '&skipContent=true'
  }
  return url
}

export async function getReadItems (oldItems) {
  if (backend === 'feedbin') {
    return await feedbin.getReadItems(oldItems)
  }
  return await reams.getReadItems(oldItems)
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
    await feedbin.markItemRead(item)
  }
  return await reams.markItemsRead([item])
}

export async function markItemsRead (items, feedId = null, olderThan = null) {
  if (backend === 'feedbin') {
    await feedbin.markItemsRead(items)
  }
  return await reams.markItemsRead(items)
}

export async function saveItem (item) {
  if (backend === 'feedbin') {
    return await feedbin.saveItem(item)
  } else {
    return await reams.saveItem(item)
  }
}

export async function unsaveItem (item, folder) {
  if (backend === 'feedbin') {
    await feedbin.unsaveItem(item)
  } else {
    return await reams.unsaveItem(item)
  }
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
  return await reams.addFeed(feed)
}

export async function updateFeed (feed) {
  switch (backend) {
    case 'basic':
    case 'reams':
      return await reams.updateFeed(feed)
  }
}

export async function removeFeed (feed) {
  if (backend === 'feedbin') {
    await feedbin.removeFeed(feed)
  }
  return await reams.removeFeed(feed)
}

export async function getFeedMeta (feed) {
  return await reams.getFeedMeta(feed)
}

export async function getCategories () {
  // let's just say that categories are not supported when using feedbin as a backend
  // if (backend === 'feedbin') {
  //   await feedbin.getCategories()
  // }
  return await reams.getCategories()
}

export async function addCategory (category) {
  // if (backend === 'feedbin') {
  //   await feedbin.addCategory(category)
  // }
  return await reams.addCategory(category)
}

export async function updateCategory (category) {
  // if (backend === 'feedbin') {
  //   await feedbin.updateCategory(category)
  // }
  return await reams.updateCategory(category)
}

export async function deleteCategory (category) {
  // if (backend === 'feedbin') {
  //   await feedbin.deleteCategory(category)
  // }
  return await reams.deleteCategory(category)
}

export async function getNewsletters () {
  return await reams.getNewsletters()
}

export async function addNewsletter (newsletter) {
  return await reams.addNewsletter(newsletter)
}

export async function updateNewsletter (newsletter) {
  return await reams.updateNewsletter(newsletter)
}

export async function deleteNewsletter (newsletter) {
  return await reams.deleteNewsletter(newsletter)
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