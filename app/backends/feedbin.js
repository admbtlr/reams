import {decode, encode} from 'base-64'
// import EncryptedStorage from 'react-native-encrypted-storage'
import { AsyncStorage } from '@react-native-async-storage/async-storage'
import { getItemsByIds } from './utils'
import { getFeedColor, id } from '../utils'
import Config from 'react-native-config'

let credentials = {}

export async function init ({ username, password }) {
  if (!password) {
    password = await AsyncStorage.getItem("feedbin_password")    
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
  const reqUrl = !!Config.CORS_PROXY ? Config.CORS_PROXY + url : url
  const response = await fetch(reqUrl, options)
  if (!response.ok) {
    const text = await response.text()
    console.log(text)
    throw Error(response.statusText)
  }

  let json, nextPage
  if (response.headers) {
    nextPage = getNextPage(response.headers)
  }
  if (!expectNoContent) {
    json = await response.json()
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
  let itemIds = await postRequest(endpoint, body)
  return itemIds[0] === item.id
}

export async function unsaveItem (item, folder) {
  const endpoint = 'starred_entries.json'
  const body = {
    starred_entries: [item.id]
  }
  let itemIds = await deleteRequest(endpoint, body)
  return itemIds[0] === item.id
}

export async function saveExternalItem(item) {
  let endpoint = 'pages.json'
  let body = { url: item.url }
  const feedbinItem = await postRequest(endpoint, body)
  const success = await saveItem(feedbinItem, 'inbox')
  if (success) {
    return {
      ...item,
      id: feedbinItem.id
    }
  }
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

export async function getCategories () {
  const taggings = await getRequest('taggings.json')
  if (!taggings) return null
  const tags = await getRequest('tags.json')
  // convert from Feedbin's weird format
  let names = taggings.map(t => t.name)
  names = [ ...new Set(names) ]
  return tags.map(tag => ({
    id: tag.id,
    name: tag.name,
    feed_ids: taggings.filter(t => t.name === tag.name).map(t => t.feed_id)
  }))
}

export async function createCategory () {
  // weirdly, this isn't a thing on Feedbin
}

// returns the category
export async function updateCategory ({ id, name, feeds }) {
  const taggings = await getRequest('taggings.json')
  let tags = await getRequest('tags.json')
  const oldTag = tags.find(t => t.id === id)

  // AAAARGH if the tag isn't on feedbin because the taggings have been deleted, we need to create it
  // but then the feedbin id will be different, so we'll need to update our local copy

  let oldFeedIds = []
  let newFeedIds = feeds.map(f => f.id)
  let removedFeedIds = []
  let taggingsForTag = []

  if (oldTag) {
    taggingsForTag = taggings.filter(t => t.name === oldTag.name)
    oldFeedIds = taggingsForTag.map(t => t.feed_id)
    newFeedIds = feeds.filter(f => !oldFeedIds.includes(f.id)).map(f => f.id)
    removedFeedIds = oldFeedIds.filter(ofid => !feeds.map(f => f.id).includes(ofid))
    await postRequest('tags.json', {
      old_name: oldTag.name,
      new_name: name
    })
  }
  const promises = []
  newFeedIds.forEach(fid => {
    promises.push(postRequest('taggings.json', {
      feed_id: fid,
      name
    }))
  })
  removedFeedIds.forEach(fid => {
    const tag = taggingsForTag.find(t => t.feed_id === fid)
    promises.push(deleteRequest(`taggings/${tag.id}.json`, '', true))
  })

  await Promise.all(promises)

  tags = await getRequest('tags.json')
  const newTag = tags.find(t => t.name === name)
  return {
    id: newTag ? newTag.id : id,
    name,
    feeds
  }
}
               
export async function deleteCategory (category) {
  await deleteRequest('tags.json', { "name": category.name })
}

const mapFeedbinItemToRizzleItem = (item) => {
  let mappedItem = {
    id: item.id,
    feed_id: item.feed_id,
    url: item.url,
    external_url: item.url,
    title: item.title,
    content_html: item.content,
    author: item.author,
    created_at: new Date(item.created_at).getTime(),
    date_published: item.published,
    }
  return mappedItem
}

