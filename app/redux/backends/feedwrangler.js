import { InteractionManager } from 'react-native'
import { store } from '../store'
import { id } from '../../utils'
import log from '../../utils/log'

let feedWranglerAccessToken = '07de039941196f956e9e86e202574419'
const itemsFetchBatchSize = 100

let itemsCache = []

const CLIENT_KEY = 'fdc257afbb554f67888c2aee80481e8e'

let feeds

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
      if (json.success) {
        return json.access_token
      }
      console.log(json)
    })
    .catch(e => {
      log(e)
    })
}

export const fetchItems = async function (callback, type, lastUpdated, oldItems, currentItem, feeds, maxNum) {
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
    const expandedItems = await getItemsByIds(idsToExpand, callback)
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
        log(e)
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

async function getItemsByIds (itemIds, callback) {
  const chunkArray = (arr) => {
    let i, j
    let temparray = []
    const chunk = 100
    itemIds = itemIds || []
    for (i = 0, j = itemIds.length; i < j; i += chunk) {
      temparray.push(itemIds.slice(i, i + chunk))
    }
    return temparray
  }
  const chunkedItemsIds = chunkArray(itemIds)
  const promises = chunkedItemsIds.map(itemIdChunk => {
    let url = 'https://feedwrangler.net/api/v2/feed_items/get?'
    url += 'access_token=' + feedWranglerAccessToken
    url += '&feed_item_ids=' + itemIdChunk.reduce((accum, id) => `${accum}${id.id},`, '')
    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText)
        }
        return response
      })
      .then((response) => response.json())
      .then((json) => {
        callback(json.feed_items.map(mapFeedwranglerItemToRizzleItem))
        return true
      })
      .catch(e => {
        log(e)
      })
  })
  return Promise.all(promises)
    .then(_ => true)
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

export const receiveUnreadItems = (response, createdSince, page) => {
  return response.json()
    .then((feed) => {
      const items = [...feed.feed_items].map((item) => {
        return {
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
      })
      itemsCache = itemsCache.concat(items)
      if (items.length === itemsFetchBatchSize) {
        return getUnreadItems(createdSince, page + 1)
      } else {
        return Promise.resolve(itemsCache)
      }
    })
}

function getItemIds (createdSince, offset = 0, type = 'unread') {
  let url = 'https://feedwrangler.net/api/v2/feed_items/list_ids?'
  url += 'access_token=' + feedWranglerAccessToken
  url += (createdSince && type === 'unread') ? ('&updated_since=' + createdSince) : ''
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
}

export const markItemRead = (item) => {
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
}

export const addFeed = (feedUrl) => {
  let url = 'https://feedwrangler.net/api/v2/subscriptions/add_feed?'
  url += 'access_token=' + feedWranglerAccessToken
  url += '&feed_url=' + feedUrl
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
}