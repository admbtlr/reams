let credentials = {}

export function init ({ username, password }) {
  credentials = { username, password }
}

export const authenticate = (username, password) => {
  let url = 'https://api.feedbin.com/v2/authentication.json'
  const encoded = btoa(`${username}:${password}`)
  return fetch(url, {
    headers: {
      Authorization: `Basic ${encoded}`
    }
  })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 401) {
          return 'unauthorized'
        } else {
          return 'unknown error'
        }
      }
      return 'success'
    })
}

function getUrl (endpoint) {
  return 'https://api.feedbin.com/v2/' + endpoint
}

function getBasicAuthHeader () {
  const encoded = btoa(`${credentials.username}:${credentials.password}`)
  return {
    Authorization: `Basic ${encoded}`
  }
}

function getRequest (endpoint) {
  return doRequest(getUrl(endpoint), {
    headers: getBasicAuthHeader()
  })
}

function postRequest (endpoint, body) {
  return doRequest(getUrl(endpoint), {
    method: 'POST',
    headers: getBasicAuthHeader(),
    body: JSON.stringify(body)
  })
}

function deleteRequest (endpoint, body) {
  return doRequest(getUrl(endpoint), {
    method: 'DELETE',
    headers: getBasicAuthHeader()
  })
}

function doRequest (url, options) {
  return fetch(url, options)
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
    })
    .then((response) => response.json())
}

export async function fetchItems (callback, type, lastUpdated, oldItems, feeds, maxNum) {
  if (type === 'unread') {
    await fetchUnreadItems (callback, lastUpdated, oldItems, feeds, maxNum)
  }
}

async function fetchUnreadItems (callback, lastUpdated, oldItems, feeds, maxNum) {
  const endpoint = 'unread_entries.json'
  let itemIds = await getRequest(endpoint)
  const oldItemIds = oldItems.map(oi => oi.id)
  const newIds = itemIds.filter(id => !oldItemIds.includes(id))
  const url = getUrl()
  if (newIds.length > 0) {
    await getItemsByIds(newIds, url, mapFeedbinItemToRizzleItem, callback)
  }
}

export async function markItemRead (item) {}

export async function markItemsRead (items) {
}

export const saveItem = (item, folder) => {
}

export const unsaveItem = (item, folder) => {
}

export async function fetchFeeds (oldFeeds) {
  const feeds = await getRequest('subscriptions.json')
  const oldFeedIds = oldFeeds.map(of => of.id)
  const newFeeds = feeds.filter(f => !oldFeedIds.includes(f.id))
    .map(feed => ({
      _id: id(),
      id: feed.id,
      title: feed.title,
      url: feed.feed_url,
      link: feed.site_url
    }))
  return newFeeds
}

// returns the id
export async function addFeed (feed) {
  const f = await postRequest('subscriptions.json', {
    feed_url: feed.url
  })
  return f.id
}

export async function removeFeed (feed) {
  await deleteRequest(`subscriptions/${feed.id}.json`)
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
    created_at: item.created_at,
    date_modified: item.created_at,
    date_published: item.published,
    external_url: item.url,
    feed_title: item.feed_name,
    feed_id: item.feed_id
  }
  return mappedItem
}

