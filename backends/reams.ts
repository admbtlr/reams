import Config from 'react-native-config'
import {id} from '../utils'
import {
  addReadItemFS,
  addReadItemsFS,
  upsertSavedItemFS,
  getReadItemsFS,
  getSavedItemsFS,
  removeSavedItemFS,
  addFeedFS,
  getFeedsFS,
  upsertFeedsFS,
  removeFeedFS,
  setDb,
  setUid } from '../storage/firestore'
import { 
  addFeed as addFeedSupabase,
  addFeeds as addFeedsSupabase,
  addReadItems as addReadItemsSupabase,
  getFeeds as getFeedsSupabase,
  getFeedBySiteUrl,
  getReadItems as getReadItemsSupabase,
  removeUserFeed as removeUserFeedSupabase,
  addSavedItem as addSavedItemSupabase,
  removeSavedItem as removeSavedItemSupabase,
  getSavedItems as getSavedItemsSupabase,
  getCategories as getCategoriesSupabase,
  addCategory as addCategorySupabase,
  updateCategory as updateCategorySupabase
} from '../storage/supabase'
import { Feed } from '../store/feeds/types'
import { convertColorIfNecessary } from '../sagas/feeds'
import { Item } from '../store/items/types'
import { createItemStyles } from '../utils/createItemStyles'
import { Category } from '../store/categories/types'
import log from '../utils/log'

let isPlus = false

export function init () {
}

// export async function sendEmailLink (email: string) {
//   const url = 'https://app.rizzle.net/sign-in'
//   const actionCodeSettings = {
//     // Your redirect URL
//     url,
//     handleCodeInApp: true,
//     iOS: {
//       bundleId: 'com.adam-butler.rizzle',
//     }
//   }

//   // send email...
//   try {
//     auth().sendSignInLinkToEmail(email, actionCodeSettings)
//   } catch (e) {
//     log(e)
//   }

// }

export async function getReadItems (oldItems: Item[]) {
  const oldestItem = oldItems.map(i => i.created_at).sort()[0]
  const readItems = await getReadItemsSupabase(oldestItem)
  return readItems
}

// callback, type, lastUpdated, oldItems, feeds, maxNum
export async function fetchItems (
  callback: (items: Item[]) => void, 
  type: string, 
  lastUpdated: number, 
  oldItems: Item[], 
  feeds: FeedWithIsNew[], 
  maxNum: number) {
  if (type === 'saved') {
    // TODO need to account for saved items in the remote action queue that haven't been processed yet
    let saved = await getSavedItemsSupabase(oldItems)
    const savedItems: Item[] = saved.map(i => ({
      ...i,
      styles: createItemStyles(i),
      title: i.title || '',
      content_html: '',
      content_length: 0,
      coverImageFile: '',
      coverImageUrl: '',
      created_at: i.savedAt || Date.now(),
      feed_id: '',
      feed_title: '',
    }))
    callback(savedItems as Item[])
  } else if (type === 'unread') {
    try {
      const readItems = await getReadItemsSupabase()
      // let unreadItemArrays = await fetchUnreadItems(feeds, lastUpdated)
      // unreadItemArrays = extractErroredFeeds(unreadItemArrays)
      // let newItems = unreadItemArrays.reduce((accum, unread) => accum.concat(unread), [])
      let newItems: Item[] = await fetchUnreadItemsBatched(feeds, lastUpdated)
      newItems = newItems.map((item: Item) => ({
        ...item,
        _id: id(item.url)
      }))
      newItems = newItems.filter((newItem) => !!!oldItems.find(oldItem => oldItem._id === newItem._id))
      newItems = newItems.filter(newItem => !readItems.find(readItem => newItem._id === readItem._id))
      callback(newItems)
    } catch (error) {
      log(error)
    }
  }
  return true
}

// function extractErroredFeeds (unreadItemsArrays) {
//   let errored = unreadItemsArrays.filter(uia => uia.message)
//   errored.forEach(({feed, message}) => {
//     log(`${feed.title} has errored: ${message}`)
//   })
//   return unreadItemsArrays.filter(uia => uia.length)
// }

// const fetchUnreadItems = (feeds: { url : string, isNew?: boolean }[], lastUpdated: number) => {
//   const promises = feeds.filter(feed => !!feed).map(feed => {
//     const url = `${Config.API_URL}/feed/?url=${feed.url}&lastUpdated=${feed.isNew ? 0 : lastUpdated}`
//     // const url = `http://localhost:8080/feed/?url=${feed.url}`
//     return fetch(url).then(response => {
//       return { response, feed }
//     }).then(({response, feed}) => {
//         if (!response.ok) {
//           throw {
//             feed,
//             message: response.statusText
//           }
//         }
//         return response.json().then(json => {
//           return { json, feed }
//         })
//     }).then(({json, feed}) => json.map(mapRizzleServerItemToRizzleItem).map((item: Item) => {
//       return {
//         ...item,
//         feed_title: feed.title,
//         feed_id: feed._id,
//         feed_color: feed.color
//       }
//     })).catch(({feed, message}) => {
//       return {feed, message}
//     })
//   })
//   return Promise.all(promises)
// }

interface FeedWithIsNew extends Feed {
  isNew?: boolean
}

const fetchUnreadItemsBatched = (feeds: FeedWithIsNew[], lastUpdated: number) => {
  let bodyFeeds = feeds.map(feed => ({
    url: feed.url,
    _id: feed._id,
    lastUpdated: feed.isNew ? 0 : lastUpdated
  }))
  // chunk into 10 at a time and do a Promise.all
  // to avoid body size restriction on server
  let chunked = bodyFeeds.reduce((acc: any[], val, index) => {
    const key = Math.floor(index / 10)
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(val)
    return acc
  }, [])
  const promises = Object.values(chunked).map(feeds => fetch(Config.CORS_PROXY + '?url=' + Config.API_URL + '/feeds', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ feeds })
  })
    .then(res => res.json()))
  return Promise.all(promises)
    .then(chunkedItems => {
      return chunkedItems.reduce((items, chunk) => items.concat(chunk), [])
        .filter((item: Item) => item.feed_id !== undefined) // just ignore errors
        .map(mapRizzleServerItemToRizzleItem)
        .map((item: Item) => {
          const feed = feeds.find(feed => feed._id === item.feed_id)
          return {
            ...item,
            feed_title: feed?.title,
            feed_color: feed?.color
          }
        })
    })
    .catch(err => {
      log(err)
    })
}

// export async function markItemRead (item: Item) {
//   if (isPlus) {
//     addReadItemFS(item)
//   }
// }

export async function markItemsRead (items: Item[]) {
  try {
    addReadItemsSupabase(items)
  } catch (e) {
    log('Error marking items read in supabase', e)
    throw e
  }
}

export const saveItem = async (item: Item) => {
  try {
    await addSavedItemSupabase(item)
  } catch (e) {
    log('Error saving item in supabase', e)
    throw e
  }
}

export const unsaveItem = async (item: Item) => {
  try {
    await removeSavedItemSupabase(item)
  } catch (e) {
    log('Error unsaving an item in supabase', e)
    throw e
  }
}


export async function saveExternalItem (item: Item) {
  try {
    await addSavedItemSupabase(item)
  } catch (e) {
    log('Error saving item in supabase', e)
    throw e
  }
}

export async function addFeed (feedToAdd: {url: string, id?: number}, userId?: string): Promise<Feed | undefined> {
  let feed
  try {
    feed = await addFeedSupabase(feedToAdd, userId)
  } catch (e) {
    log('Error adding feed to supabase', e)
  } finally {
    return feed
  }
}

export async function addFeeds (feeds: Feed[]) {
  return await addFeedsSupabase(feeds)
}

// actually this should never happen
// export async function updateFeed (feed: Feed) {
//   if (isPlus) {
//     upsertFeedsFS([feed])
//   }
// }

export async function removeFeed (feed: Feed) {
  await removeUserFeedSupabase(feed)
}

export async function fetchFeeds () {
  const feeds = await getFeedsSupabase()
  return feeds && feeds.map(feed => ({
    ...feed,
    color: convertColorIfNecessary(feed.color),
    favicon: {
      url: feed.favicon_url,
      size: feed.favicon_size
    }
  }))
}

// export const markFeedRead = (feed, olderThan, items) => {
//   return
// }

interface FeedMeta {
  title: string
  description: string
  favicon: {
    url: string
    size: string // e.g. "120x120"
  }
  image: string // url
  rootUrl: string // url
  color: string // hex || rgb()
  didError: boolean
}

export async function getFeedMeta (feed: { url: string }): Promise<FeedMeta> {
  log('getFeedMeta')
  const apiUrl = `${Config.API_URL}/feed-meta?url=${feed.url}`
  return fetch(apiUrl).then(response => {
    return { response, feed }
  }).then(({response, feed}) => {
    if (!response.ok) {
      throw {
        feed,
        message: response.statusText
      }
    }
    return response.json()
  }).then(json => {
    log(json)
    return {
      ...json,
      url: feed.url,
      color: convertColorIfNecessary(json.color)
    }
  }).catch(({feed, message}) => {
    throw new Error(`Error getting feed meta for ${feed.url}: ${message}`)
  })
}

export async function findFeeds (url: string): Promise<{ url: string, title: string }[] | undefined> {
  try {
    const feedMeta = await getFeedMeta({ url })
    if (feedMeta && feedMeta.title) {
      return [{url, title: feedMeta.title}]
    }
  } catch (e: any) {
    // throw new Error(`Error finding feeds for ${url}: ${e.message}`)
  }
  try {
    const apiUrl = `${Config.API_URL}/find-feeds?url=${url}&extended=1`
    const response = await fetch(apiUrl)
    if (!response.ok) {
      throw {
        url,
        message: response.statusText
      }
    }
    const json = await response.json()
    if (json.length > 0 && json[0]?.url) {
      return json.map((feed: Feed) => ({
        ...feed,
        color: feed.color ? convertColorIfNecessary(feed.color) : undefined
      }))
    }
  } catch(e: any) {
    throw new Error(`Error finding feeds for ${url}: ${e.message}`)
  }
  try {
    const feed = await getFeedBySiteUrl(url)
    if (feed !== undefined && feed !== null) {
      return [{url, title: feed.title}]
    }
  } catch (e: any) {
    throw new Error(`Error finding feeds for ${url}: ${e.message}`)
  }
}

export async function getCategories () {
  try {
    return await getCategoriesSupabase()
  } catch (e) {
    log('Error getting categories from supabase', e)
    throw e
  }
}

export async function addCategory (category: Category) {
  try {
    return await addCategorySupabase(category)
  } catch (e) {
    log('Error creating category in supabase', e)
    throw e
  }
}

export async function updateCategory (category: Category) {
  try {
    return await updateCategorySupabase(category)
  } catch (e) {
    log('Error updating category in supabase', e)
    throw e
  }
}

const mapRizzleServerItemToRizzleItem = (item: any) => {
  let mappedItem = {
    id: item.guid,
    url: item.link,
    external_url: item.link,
    title: item.title,
    content_html: item.description,
    author: item.author,
    created_at: item.pubdate,
    date_published: item.pubdate,
    feed_title: item.feed_name,
    feed_id: item.feed_id,
    categories: item.categories
  }
  return mappedItem
}


// {"title":"Do You Weigh More at the Equator or at the North Pole?","description":"In which a physics professor very severely overthinks his daughter's science homework.","summary":"In which a physics professor very severely overthinks his daughter's science homework.","date":"2018-04-05T14:00:00.000Z","pubdate":"2018-04-05T14:00:00.000Z","pubDate":"2018-04-05T14:00:00.000Z","link":"https://www.wired.com/story/do-you-weigh-more-at-the-equator-or-at-the-north-pole","guid":"5ac506b428f0c90b2647ac58","author":"Rhett Allain","comments":null,"origlink":null,"image":{"url":"https://media.wired.com/photos/5ac561a15d6b7160f7e186f4/master/pass/scale-111953044.jpg"},"source":{},"categories":["Science","Science / Dot Physics"],"enclosures":[{"url":null,"type":null,"length":null}],"rss:@":{},"rss:title":{"@":{},"#":"Do You Weigh More at the Equator or at the North Pole?"},"rss:description":{"@":{},"#":"In which a physics professor very severely overthinks his daughter's science homework."},"rss:link":{"@":{},"#":"https://www.wired.com/story/do-you-weigh-more-at-the-equator-or-at-the-north-pole"},"rss:guid":{"@":{"ispermalink":"false"},"#":"5ac506b428f0c90b2647ac58"},"rss:pubdate":{"@":{},"#":"Thu, 05 Apr 2018 14:00:00 +0000"},"media:content":{"@":{}},"rss:category":[{"@":{},"#":"Science"},{"@":{},"#":"Science / Dot Physics"}],"media:keywords":{"@":{},"#":"Gravity, circular motion, physics"},"dc:creator":{"@":{},"#":"Rhett Allain"},"dc:modified":{"@":{},"#":"Thu, 05 Apr 2018 15:36:32 +0000"},"dc:publisher":{"@":{},"#":"Condé Nast"},"media:thumbnail":{"@":{"url":"https://media.wired.com/photos/5ac561a15d6b7160f7e186f4/master/pass/scale-111953044.jpg","width":"2400","height":"1607"}},"meta":{"#ns":[{"xmlns:atom":"http://www.w3.org/2005/Atom"},{"xmlns:dc":"http://purl.org/dc/elements/1.1/"},{"xmlns:media":"http://search.yahoo.com/mrss/"}],"@":[{"xmlns:atom":"http://www.w3.org/2005/Atom"},{"xmlns:dc":"http://purl.org/dc/elements/1.1/"},{"xmlns:media":"http://search.yahoo.com/mrss/"}],"#xml":{"version":"1.0","encoding":"utf-8"},"#type":"rss","#version":"2.0","title":"Wired","description":"The latest from www.wired.com","date":"2018-04-05T16:16:15.000Z","pubdate":"2018-04-05T16:16:15.000Z","pubDate":"2018-04-05T16:16:15.000Z","link":"https://www.wired.com/","xmlurl":"https://www.wired.com/feed/rss","xmlUrl":"https://www.wired.com/feed/rss","author":null,"language":"en","favicon":null,"copyright":"© Condé Nast 2018","generator":null,"cloud":{},"image":{},"categories":[],"rss:@":{},"rss:title":{"@":{},"#":"Wired"},"rss:description":{"@":{},"#":"The latest from www.wired.com"},"rss:link":{"@":{},"#":"https://www.wired.com/"},"atom:link":{"@":{"href":"https://www.wired.com/feed/rss","rel":"self","type":"application/rss+xml"}},"rss:copyright":{"@":{},"#":"© Condé Nast 2018"},"rss:language":{"@":{},"#":"en"},"rss:lastbuilddate":{"@":{},"#":"Thu, 05 Apr 2018 16:16:15 +0000"}}}
/*
Unused fields:

summary
date
comments
origlink
image
enclosures
rss:@
rss:title
rss:description
rss:link
rss:category
rss:pubdate
permalink
rss:guid
media:content
dc:creator
dc:date
meta

*/