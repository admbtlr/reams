import {decode, encode} from 'base-64'
import { getItemsByIds } from './utils'
import { getFeedColor, id } from '../utils'
import { Feed } from '../store/feeds/types'
import PasswordStorage from '../utils/password-storage'
import { Item } from '../store/items/types'
import { Category } from '../store/categories/types'

let credentials: {
  username?: string,
  password?: string
} = {}

interface FeedbinFeed {
  feed_id: string,
  id: string,
  title: string,
  feed_url: string,
  site_url: string
}

interface FeedbinTag {
  id: string,
  name: string
}

interface FeedbinTagging {
  feed_id: string,
  id: string,
  name: string
}

export async function init ({ username, password }: { username: string, password: string }) {
  if (!password) {
    password = await PasswordStorage.getItem("feedbin_password")    
  }
  credentials = { username, password }
}

export const authenticate = async (username: string, password: string) => {
  let url = getUrl('https://api.feedbin.com/v2/authentication.json')
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

function getUrl (endpoint: string) {
  let feedbinUrl
  if (endpoint.startsWith('http')) {
    feedbinUrl = endpoint
  } else {
    feedbinUrl = 'https://api.feedbin.com/v2/' + endpoint
  }
  return !!process.env.EXPO_PUBLIC_CORS_PROXY ? `${process.env.EXPO_PUBLIC_CORS_PROXY}?url=${feedbinUrl}` : feedbinUrl
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

function getRequest (endpoint: string) {
  return doRequest(getUrl(endpoint))
}

function postRequest (endpoint: string, body: string | {}) {
  return doRequest(getUrl(endpoint), {
    //@ts-ignore
    method: 'POST',
    body: JSON.stringify(body)
  })
}

function deleteRequest (endpoint: string, body: string | {}, expectNoContent = false) {
  return doRequest(getUrl(endpoint), {
    //@ts-ignore
    method: 'DELETE',
    body: JSON.stringify(body)
  }, expectNoContent)
}

async function doRequest (url: string, options: { 
  headers?: Headers | { Authorization: string } | undefined ;
} = {}, expectNoContent = false) {
  const getNextPage = (headers: Headers) => {
    const links = headers?.get('Links')?.split(',')
    if (links) {
      const nextPage = links.find(link => link.indexOf('rel="next"') > -1)
      //@ts-ignore
      return nextPage?.match(/<(.*)>/)[1]
    } else {
      return null
    }
  }

  options.headers = options.headers || getBasicAuthHeader()
  //@ts-ignore
  options.headers['Content-Type'] = 'application/json; charset=utf-8'
  const reqUrl = !!process.env.EXPO_PUBLIC_CORS_PROXY ? process.env.EXPO_PUBLIC_CORS_PROXY + '?url=' + encodeURIComponent(url) : url
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

export async function fetchItems (
  callback: () => void, 
  type: string, 
  lastUpdated: number, 
  oldItems: Item[], 
  feeds: Feed[], 
  maxNum: number
) {
  if (type === 'unread') {
    await fetchUnreadItems (callback, lastUpdated, oldItems, feeds, maxNum)
  } else if (type === 'saved') {
    await fetchSavedItems (callback, lastUpdated, oldItems, feeds, maxNum)
  }
}

async function getPaginatedItems (
  endpoint: string, 
  maxNum: number, 
  callback: (items: Item[]) => void
) {
  let items = []
  let numItems = 0
  let nextPage = endpoint
  while (nextPage) {
    let response = await getRequest(nextPage)
    nextPage = response.nextPage
    // this is a weird setup where the response is an array of items plus potentially a URL keyed on `nextPage`
    // not even sure how that's supposed to work
    let newItems = response.filter((i: Item | string) => i !== nextPage)
    newItems = newItems.map(mapFeedbinItemToRizzleItem)
    callback(newItems)
    numItems += newItems.length
    if (numItems >= maxNum) {
      break
    }
  }
}

export async function getReadItems (oldItems: Item[]) {
  const endpoint = 'unread_entries.json'
  let unreadItemIds = await getRequest(endpoint)
  let readItems: Item[] = []
  oldItems.forEach(item => {
    if (!unreadItemIds.includes(item.id)) {
      readItems.push(item)
    }
  })
  return readItems
}

async function fetchUnreadItems (
  callback: () => void, 
  lastUpdated: number, 
  oldItems: Item[], 
  feeds: Feed[], 
  maxNum: number
) {
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

async function fetchSavedItems (
  callback: () => void, 
  lastUpdated: number, 
  oldItems: Item[], 
  feeds: Feed[], 
  maxNum: number
) {
  const endpoint = 'starred_entries.json'
  let itemIds = await getRequest(endpoint)
  const oldItemIds = oldItems.map(oi => oi.id)
  const newIds = itemIds.filter((id: string) => !oldItemIds.includes(id))
  if (newIds.length > 0) {
    const url = getUrl('entries.json?ids=')
    await getItemsByIds(newIds, url, mapFeedbinItemToRizzleItem, callback, getFetchConfig())
  }
}

export async function markItemRead (item: Item) {
  return markItemsRead([item])
}

export async function markItemsRead (items: Item[]) {
  const endpoint = 'unread_entries.json'
  const body = {
    unread_entries: items.map(i => i.id)
  }
  let itemIds = await deleteRequest(endpoint, body, true)
}

export async function saveItem (item: Item) {
  const endpoint = 'starred_entries.json'
  const body = {
    starred_entries: [item.id]
  }
  let itemIds = await postRequest(endpoint, body)
  return itemIds[0] === item.id
}

export async function unsaveItem (item: Item) {
  const endpoint = 'starred_entries.json'
  const body = {
    starred_entries: [item.id]
  }
  let itemIds = await deleteRequest(endpoint, body, true)
  return itemIds[0] === item.id
}

export async function saveExternalItem(item: Item) {
  let endpoint = 'pages.json'
  let body = { url: item.url }
  const feedbinItem = await postRequest(endpoint, body)
  const success = await saveItem(feedbinItem)
  if (success) {
    return {
      ...item,
      id: feedbinItem.id
    }
  }
}

export async function fetchFeeds (oldFeeds: Feed[] ): Promise<Feed[]> {
  let feeds = await getRequest('subscriptions.json')
  if (oldFeeds) {
    const oldFeedIds = oldFeeds ? oldFeeds.map(of => of.feedbinId) : []
    feeds = feeds.filter((f: { feed_id: number }) => !oldFeedIds.includes(f.feed_id))
  }

  // this is the pseudo-feed that Feedbin uses for saved items
  feeds = feeds.filter((f: { site_url: string }) => f.site_url !== 'http://pages.feedbinusercontent.com')
  if (feeds.length === 0) return []

  feeds = feeds
    .map((feed: FeedbinFeed) => ({
      _id: id(feed.feed_url),
      feedbinId: feed.feed_id,
      subscription_id: feed.id,
      title: feed.title,
      url: feed.feed_url,
      link: feed.site_url,
      color: getFeedColor()
    }))
  return feeds
}

// returns the feedbinId
export async function addFeed (feed: {url: string}): Promise<string> {
  const f = await postRequest('subscriptions.json', {
    feed_url: feed.url
  })
  return f.feed_id
}

export async function removeFeed (feed: { subscription_id: string }) {
  await deleteRequest(`subscriptions/${feed.subscription_id}.json`, {}, true)
}

export const markFeedRead = (feed: Feed, olderThan: number, items: Item[]) => {
}

export async function getFeedMeta (feed: Feed) {
}

export async function getCategories () {
  const taggings: FeedbinTagging[] = await getRequest('taggings.json')
  if (!taggings) return null
  const tags: FeedbinTag[] = await getRequest('tags.json')
  // convert from Feedbin's weird format
  let names = taggings.map(t => t.name)
  names = [ ...new Set(names) ]
  return tags.map(tag => ({
    id: tag.id,
    name: tag.name,
    feed_ids: taggings.filter(t => t.name === tag.name).map(t => t.feed_id)
  }))
}

export async function addCategory () {
  // weirdly, this isn't a thing on Feedbin
}

// returns the category
export async function updateCategory ({ id, name, feeds }: { id: string, name: string, feeds: Feed[] }) {
  const taggings: FeedbinTagging[] = await getRequest('taggings.json')
  let tags = await getRequest('tags.json')
  const oldTag = tags.find((t: { id: string }) => t.id === id)

  // AAAARGH if the tag isn't on feedbin because the taggings have been deleted, we need to create it
  // but then the feedbin id will be different, so we'll need to update our local copy

  let oldFeedIds: (string | undefined)[] = []
  let newFeedIds: (string | undefined)[] = feeds.map((f: Feed) => f.feedbinId?.toString())
  let removedFeedIds: (string | number | undefined)[] = []
  let taggingsForTag: FeedbinTagging[] = []

  if (oldTag) {
    taggingsForTag = taggings.filter((t) => t.name === oldTag.name)
    oldFeedIds = taggingsForTag.map(t => t.feed_id)
    newFeedIds = feeds.filter(f => !oldFeedIds
      .includes(f.feedbinId !== undefined ? f.feedbinId.toString() : ''))
      .map(f => f.feedbinId !== undefined ? f.feedbinId.toString() : '')
    removedFeedIds = oldFeedIds.filter(ofid => !feeds.map(f => f.feedbinId?.toString()).includes(ofid))
    await postRequest('tags.json', {
      old_name: oldTag.name,
      new_name: name
    })
  }
  const promises: Promise<any>[] = []
  newFeedIds.forEach(fid => {
    promises.push(postRequest('taggings.json', {
      feed_id: fid,
      name
    }))
  })
  removedFeedIds.forEach(fid => {
    const tag = taggingsForTag.find(t => t.feed_id === fid)
    if (tag) {
      promises.push(deleteRequest(`taggings/${tag.id}.json`, '', true))
    }
  })

  await Promise.all(promises)

  tags = await getRequest('tags.json')
  const newTag = tags.find((t: { name: string }) => t.name === name)
  return {
    id: newTag ? newTag.id : id,
    name,
    feeds
  }
}
               
export async function deleteCategory (category: Category) {
  await deleteRequest('tags.json', { "name": category.name }, true)
}

const mapFeedbinItemToRizzleItem = (item: any) => {
  let mappedItem = {
    id: item.id,
    feed_id: item.feed_id,
    url: item.url,
    external_url: item.url,
    title: item.title,
    content_html: item.content,
    author: item.author,
    created_at: new Date(item.created_at).getTime() / 1000,
    date_published: item.published,
    }
  return mappedItem
}
