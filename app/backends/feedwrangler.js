import { InteractionManager } from 'react-native'
import { store } from '../store'
import { getFeedColor, id } from '../utils'
import { getItemsByIds } from './utils'
import log from '../utils/log'

let feedWranglerAccessToken = '07de039941196f956e9e86e202574419'
const itemsFetchBatchSize = 100

let itemsCache = []

const CLIENT_KEY = 'fdc257afbb554f67888c2aee80481e8e'

let feeds

export const init = (config) => {
  feedWranglerAccessToken = config.accessToken || config.credentials.accessToken
}

export const authenticate = (username, password) => {
  let url = 'https://feedwrangler.net/api/v2/users/authorize?'
  url += 'email=' + username
  url += '&password=' + password
  url += '&client_key=' + CLIENT_KEY
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response
    })
    .then((response) => response.json())
    .then(json => {
      if (json.result === 'success') {
        return {
          status: 'success',
          token: json.access_token
        }
      } else {
        return {
          status: 'error',
          message: 'unknown error'
        }
      }
    })
    .catch(e => {
      log('authenticate', e)
    })
}

export const fetchItems = async function (callback, type, lastUpdated, oldItems, feeds, maxNum) {
  let newItems
  let newIds = await fetchItemIds(lastUpdated, type)
  newIds = newIds || []
  console.log(`Got ${newIds.length} new item ids to expand`)

  // feedwrangler always orders DESC
  if (typeof(maxNum) === 'number') newIds = newIds.slice(0, maxNum)
  console.log(`Sliced down to ${newIds.length} new item ids to expand`)

  newItems = newIds.map((item) => {
    return oldItems.find((oldItem) => oldItem.id === item.id) || item
  })
  const idsToExpand = newItems.filter(item => !!!item._id)

  if (idsToExpand && idsToExpand.length > 0) {
    const url = 'https://feedwrangler.net/api/v2/feed_items/get?'
      + 'access_token=' + feedWranglerAccessToken
      + '&feed_item_ids='
    const expandedItems = await getItemsByIds(idsToExpand, url, mapFeedwranglerItemToRizzleItem, callback)
    return true
  }
  return true
}

async function fetchItemIds (createdSince, type) {
  const pageSize = 1000
  let itemIds = []
  let itemIdBatch

  const recursiveGetIds = (offset = 0) => {
    return getItemIds(createdSince, offset, type)
      .then(itemIdBatch => {
        itemIdBatch = itemIdBatch || []
        itemIds = itemIds.concat(itemIdBatch)
        if (itemIdBatch.length === pageSize) {
          return recursiveGetIds(offset + pageSize)
        } else {
          return true
        }
      })
      .catch(e => {
        log('recursiveGetIds', e)
      })
  }

  return recursiveGetIds().then(_ => {
    return itemIds.map((feed_item) => {
      return {
        id: feed_item.feed_item_id
      }
    })
  })
}

const mapFeedwranglerItemToRizzleItem = (item) => {
  return {
    _id: id(item),
    id: item.feed_item_id,
    url: item.url,
    external_url: item.url,
    title: item.title,
    content_html: item.body,
    date_published: item.published_at,
    date_modified: item.updated_at,
    created_at: item.created_at,
    author: item.author,
    feed_title: item.feed_name,
    feed_id: item.feed_id
  }
}

// export const receiveUnreadItems = (response, createdSince, page) => {
//   return response.json()
//     .then((feed) => {
//       const items = [...feed.feed_items].map((item) => {
//         return {
//           id: item.feed_item_id,
//           url: item.url,
//           external_url: item.url,
//           title: item.title,
//           content_html: item.body,
//           date_published: item.published_at,
//           date_modified: item.updated_at,
//           created_at: item.created_at,
//           author: item.author,
//           feed_title: item.feed_name,
//           feed_id: item.feed_id
//         }
//       })
//       itemsCache = itemsCache.concat(items)
//       if (items.length === itemsFetchBatchSize) {
//         return getUnreadItems(createdSince, page + 1)
//       } else {
//         return Promise.resolve(itemsCache)
//       }
//     })
// }

function getItemIds (createdSince, offset = 0, type = 'unread') {
  let url = 'https://feedwrangler.net/api/v2/feed_items/list_ids?'
  url += 'access_token=' + feedWranglerAccessToken
  url += (createdSince && type === 'unread') ? ('&updated_since=' + (createdSince / 1000)) : ''
  url += '&offset=' + offset
  url += type === 'unread' ? '&read=false' : ''
  url += type === 'saved' ? '&starred=true' : ''
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response
    })
    .then((response) => response.json())
    .then(json => json.feed_items)
    .catch(e => {
      log('Error at getItemIds: ' + e)
    })
}

export async function markItemRead (item) {
  const id = typeof item === 'object' ? item.id : item
  let url = 'https://feedwrangler.net/api/v2/feed_items/update?'
  url += 'access_token=' + feedWranglerAccessToken
  url += '&feed_item_id=' + id
  url += '&read=true'
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response
    })
    .then((response) => response.json())
    .catch(e => {
      log('Error at markItemRead: ' + e)
    })
}

export async function markItemsRead (items) {
  const idString = items.reduce((accum, val) => {
    return `${accum},${val}`
  }, '')
  let url = 'https://feedwrangler.net/api/v2/feed_items/mark_all_read?'
  url += 'access_token=' + feedWranglerAccessToken
  url += '&feed_item_ids=' + idString
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response
    })
    .then((response) => response.json())
    .catch(e => {
      log('Error at markItemsRead: ' + e)
    })
}

export const saveItem = (item) => {
  const id = typeof item === 'object' ? item.id : item
  let url = 'https://feedwrangler.net/api/v2/feed_items/update?'
  url += 'access_token=' + feedWranglerAccessToken
  url += '&feed_item_id=' + id
  url += '&starred=true'
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response
    })
    .then((response) => response.json())
    .catch(e => {
      log('Error at saveItem: ' + e)
    })
}

export const unsaveItem = (item) => {
  const id = typeof item === 'object' ? item.id : item
  let url = 'https://feedwrangler.net/api/v2/feed_items/update?'
  url += 'access_token=' + feedWranglerAccessToken
  url += '&feed_item_id=' + id
  url += '&starred=false'
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response
    })
    .then((response) => response.json())
    .catch(e => {
      log('Error at unsaveItem: ' + e)
    })
}

export const getFeedDetails = (feed) => {
  let feedExtras
  const id = typeof feed === 'object' ? feed.id : feed
  if (feeds && (feedExtras = feeds.find(f => f.feed_id === feed.id))) {
    return {
      ...feed,
      url: feedExtras.feed_url
    }
  }
  let url = 'https://feedwrangler.net/api/v2/subscriptions/list?'
  url += 'access_token=' + feedWranglerAccessToken
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response
    })
    .then((response) => response.json())
    .then(json => {
      feeds = json.feeds
      feedExtras = feeds.find(f => f.feed_id === feed.id)
      return {
        ...feed,
        url: feedExtras.feed_url
      }
    })
    .catch(e => {
      log('Error at getFeedDetails: ' + e)
    })
}

export const markFeedRead = (feed, olderThan) => {
  const isAll = !feed
  const id = typeof feed === 'object' ? feed.id : feed
  let url = 'https://feedwrangler.net/api/v2/feed_items/mark_all_read?'
  url += 'access_token=' + feedWranglerAccessToken
  url += isAll ? '' : '&feed_id=' + id
  url += '&created_on_before=' + olderThan
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response
    })
    .then((response) => response.json())
    .then(json => {
      console.log(json)
    })
    .catch(e => {
      log('Error at markFeedRead: ' + e)
    })
}

// returns id
export const addFeed = (feed) => {
  let url = 'https://feedwrangler.net/api/v2/subscriptions/add_feed_and_wait?'
  url += 'access_token=' + feedWranglerAccessToken
  url += '&feed_url=' + feed.url
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response
    })
    .then((response) => response.json())
    .then(json => {
      console.log(json)
      return json.feed.feed_id
    })
    .catch(e => {
      log('Error at addFeed: ' + e)
    })
}

// returns id
export const removeFeed = (feed) => {
  let url = 'https://feedwrangler.net/api/v2/subscriptions/remove_feed?'
  url += 'access_token=' + feedWranglerAccessToken
  url += '&feed_id=' + feed.id
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response
    })
    .catch(e => {
      log('Error at addFeed: ' + e)
    })
}

export const fetchFeeds = () => {
  let url = 'https://feedwrangler.net/api/v2/subscriptions/list?'
  url += 'access_token=' + feedWranglerAccessToken
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response
    })
    .then((response) => response.json())
    .then(json => {
      return json.feeds.map(feed => ({
        _id: id(),
        id: feed.feed_id,
        title: feed.title,
        url: feed.feed_url,
        link: feed.site_url,
        color: getFeedColor()
      }))
    })
    .catch(e => {
      log('Error at fetchFeeds: ' + e)
    })
}