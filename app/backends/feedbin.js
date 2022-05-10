import {decode, encode} from 'base-64'
import EncryptedStorage from 'react-native-encrypted-storage'
import { getItemsByIds } from './utils'
import { getFeedColor, id } from '../utils'

let credentials = {}

export async function init ({ username, password }) {
  if (!password) {
    password = await EncryptedStorage.getItem("feedbin_password")    
  }
  credentials = { username, password }
}

export const authenticate = (username, password) => {
  let url = 'https://api.feedbin.com/v2/authentication.json'
  const encoded = encode(`${username}:${password}`)
  return fetch(url, {
    headers: {
      Authorization: `Basic ${encoded}`
    }
  })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 401) {
          return {
            status: 'error',
            message: 'unauthorized'
          }
        } else {
          return  {
            status: 'error',
            message: 'unknown error'
          }
        }
      }
      return {
        status: 'success'
      }
    })
}

function getUrl (endpoint) {
  if (endpoint.startsWith('http')) return endpoint
  return 'https://api.feedbin.com/v2/' + endpoint
}

function getFetchConfig () {
  return {
    headers: getBasicAuthHeader()
  }
}

function getBasicAuthHeader () {
  const encoded = encode(`${credentials.username}:${credentials.password}`)
  return {
    Authorization: `Basic ${encoded}`
  }
}

function getRequest (endpoint) {
  return doRequest(getUrl(endpoint))
}

function postRequest (endpoint, body) {
  return doRequest(getUrl(endpoint), {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

function deleteRequest (endpoint, body, expectNoContent = false) {
  return doRequest(getUrl(endpoint), {
    method: 'DELETE',
    body: JSON.stringify(body)
  }, expectNoContent)
}

async function doRequest (url, options = {}, expectNoContent = false) {
  const getNextPage = (headers) => {
    const links = headers?.get('Links')?.split(',')
    if (links) {
      const nextPage = links.find(link => link.indexOf('rel="next"') > -1)
      return nextPage?.match(/<(.*)>/)[1]
    } else {
      return null
    }
  }

  options.headers = options.headers || getBasicAuthHeader()
  options.headers['Content-Type'] = 'application/json; charset=utf-8'
  const response = await fetch(url, options)
  if (!response.ok) {
    throw Error(response.statusText)
  }

  const json = await response.json()
  if (response.headers) {
    const nextPage = getNextPage(response.headers)
    if (nextPage) {
      json.nextPage = nextPage
    }
  }
  return expectNoContent || json
}

export async function fetchItems (callback, type, lastUpdated, oldItems, feeds, maxNum) {
  if (type === 'unread') {
    await fetchUnreadItems (callback, lastUpdated, oldItems, feeds, maxNum)
  } else if (type === 'saved') {
    await fetchSavedItems (callback, lastUpdated, oldItems, feeds, maxNum)
  }
}

async function getPaginatedItems (endpoint, maxNum, callback) {
  let items = []
  let numItems = 0
  let nextPage = endpoint
  while (nextPage) {
    let response = await getRequest(nextPage)
    nextPage = response.nextPage
    // this is a weird setup where the response is an array of items plus potentially a URL keyed on `nextPage`
    // not even sure how that's supposed to work
    let newItems = response.filter(i => i !== nextPage)
    newItems = newItems.map(mapFeedbinItemToRizzleItem)
    callback(newItems)
    numItems += newItems.length
    if (numItems >= maxNum) {
      break
    }
  }
}

export async function getReadItems (oldItems) {
  const endpoint = 'unread_entries.json'
  let unreadItemIds = await getRequest(endpoint)
  let readItems = []
  oldItems.forEach(item => {
    if (!unreadItemIds.includes(item.id)) {
      readItems.push(item)
    }
  })
  return readItems
}

async function fetchUnreadItems (callback, lastUpdated, oldItems, feeds, maxNum) {
  const date = lastUpdated ? new Date(lastUpdated) : null
  const endpoint = 'entries.json?read=false&starred=false&per_page=100' + (date ? `&since=${date.toISOString()}` : '')
  await getPaginatedItems(endpoint, maxNum, callback)
  // const endpoint = 'unread_entries.json'
  // let itemIds = await getRequest(endpoint)
  // const oldItemIds = oldItems.map(oi => oi.id)
  // const newIds = itemIds.filter(id => !oldItemIds.includes(id))
  // const unreadItems = oldItems.filter(oi => itemIds.includes(oi.id))

  // if (newIds.length > 0) {
  //   const url = getUrl('entries.json?ids=')
  //   await getItemsByIds(newIds, url, mapFeedbinItemToRizzleItem, callback, getFetchConfig())
  // }
}

async function fetchSavedItems (callback, lastUpdated, oldItems, feeds, maxNum) {
  const endpoint = 'starred_entries.json'
  let itemIds = await getRequest(endpoint)
  const oldItemIds = oldItems.map(oi => oi.id)
  const newIds = itemIds.filter(id => !oldItemIds.includes(id))
  if (newIds.length > 0) {
    const url = getUrl('entries.json?ids=')
    await getItemsByIds(newIds, url, mapFeedbinItemToRizzleItem, callback, getFetchConfig())
  }
}

export async function markItemRead (item) {
  return markItemsRead([item])
}

export async function markItemsRead (items) {
  const endpoint = 'unread_entries.json'
  const body = {
    unread_entries: items.map(i => i.id)
  }
  let itemIds = await deleteRequest(endpoint, body)
}

export async function saveItem (item, folder) {
  const endpoint = 'starred_entries.json'
  const body = {
    starred_entries: [item.id]
  }
  let itemId = await postRequest(endpoint, body)
  return itemId === item.id
}

export async function unsaveItem (item, folder) {
  const endpoint = 'starred_entries.json'
  const body = {
    starred_entries: [item.id]
  }
  let itemId = await deleteRequest(endpoint, body)
  return itemId === item.id
}

export async function fetchFeeds (oldFeeds) {
  let feeds = await getRequest('subscriptions.json')
  if (oldFeeds) {
    const oldFeedIds = oldFeeds ? oldFeeds.map(of => of.id) : []
    feeds = feeds.filter(f => !oldFeedIds.includes(f.feed_id))
  }
  feeds = feeds
    .map(feed => ({
      _id: id(),
      id: feed.feed_id,
      subscription_id: feed.id,
      title: feed.title,
      url: feed.feed_url,
      link: feed.site_url,
      color: getFeedColor()
    }))
  return feeds
}

// returns the id
export async function addFeed (feed) {
  const f = await postRequest('subscriptions.json', {
    feed_url: feed.url
  })
  return f.feed_id
}

export async function removeFeed (feed) {
  await deleteRequest(`subscriptions/${feed.subscription_id}.json`, {}, true)
}

export const markFeedRead = (feed, olderThan, items) => {
}

export async function getFeedDetails (feed) {
}

const mapFeedbinItemToRizzleItem = (item) => {
  let mappedItem = {
    id: item.id,
    url: item.url,
    external_url: item.url,
    title: item.title,
    content_html: item.content,
    author: item.author,
    created_at: new Date(item.created_at).getTime(),
    date_modified: new Date(item.created_at).getTime(),
    date_published: item.published,
    external_url: item.url,
    feed_title: item.feed_name,
    feed_id: item.feed_id
  }
  return mappedItem
}

