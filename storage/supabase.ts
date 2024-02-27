import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import Config from 'react-native-config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Item } from '../store/items/types'
import { Database } from './supabase.types'
import { Feed } from '../store/feeds/types'
import { getFeedMeta } from '../backends/reams'
import { id as createId} from '../utils'
import { createItemStyles } from '../utils/createItemStyles'

const supabaseUrl = Config.SUPABASE_URL
const supabaseAnonKey = Config.SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    storage: AsyncStorage as any,
  },
})

const getUserId = async () => {
  const { data } = await supabase.auth.getSession()
  return data?.session?.user?.id
}

export const getSavedItems = async (currentItems: {
  _id: string
  url: string
  title: string
  savedAt: number | undefined
  isSaved: boolean | undefined
}[]) => {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('No user id')
  }
  const { data: allSavedIds, error } = await supabase
    .from('User_SavedItem')
    .select('item_id, saved_at')
    .eq('user_id', userId)
  if (error) {
    throw error
  }
  const newIds = (allSavedIds?.map(d => d.item_id) || []).filter(id => !currentItems.find(i => i._id === id))
  if (newIds.length === 0) {
    return currentItems
  }

  const { data: newItems, error: newItemsError } = await supabase
    .from('Item')
    .select()
    .in('_id', newIds)
  if (newItemsError) {
    throw newItemsError
  }
  const completeNewItems = newItems.map(i => ({ 
    _id: i._id,
    url: i.url, 
    title: i.title,
    savedAt: Math.round(new Date((allSavedIds
        ?.find(asi => asi?.item_id === i._id)
        ?.saved_at || 0))
      .valueOf() / 1000),
    isSaved: true
  }))

  // add all the current items whose ids were returned from the database
  // this keeps all the fields on the existing items, but removes any that were remotely deleted
  const undeletedCurrentItems = currentItems.filter(i => allSavedIds.find(d => d.item_id === i._id) !== undefined)
  const savedItems = [
    ...completeNewItems,
    ...undeletedCurrentItems
  ]
  return savedItems.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))
}

export const getReadItems = async () => {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('No user id')
  }
  const { data, error } = await supabase
    .from('User_ReadItem')
    .select('Item(*)')
    .eq('user_id', userId)
  if (error) {
    throw error
  }
  return data === null ? [] : data.map(d => d.Item === null ? null : ({
    _id: d.Item._id,
    url: d.Item.url,
    title: d.Item.title
  })) as Item[]
}

export const addReadItems = async (items: Item[]) => {
  const itemssToUpsert = items.map(item => ({
    _id: item._id,
    url: item.url,
    title: item.title,
  }))
  const { data, error } = await supabase
    .from('Item')
    .upsert(itemssToUpsert, { onConflict: '_id' })
    .select()
  if (error) {
    throw error
  }
  const userId = await getUserId()
  if (!userId) {
    throw new Error('No user id')
  }
  const { error: readItemError } = await supabase
    .from('User_ReadItem')
    .upsert(items.map(item => ({ item_id: item._id, user_id: userId })), { onConflict: 'item_id,user_id' })
  if (readItemError) {
    throw readItemError
  }
}

export const addSavedItem = async (item: Item) => {
  const { data, error } = await supabase
    .from('Item')
    .upsert({ _id: item._id, url: item.url }, { onConflict: '_id,url' })
    .select()
  if (error) {
    throw error
  }
  const savedId = data[0]._id
  const { error: savedItemError } = await supabase
    .from('User_SavedItem')
    .insert({ 
      item_id: savedId,
      saved_at: new Date().toISOString(),
      user_id: await getUserId()
    })
  if (savedItemError) {
    throw savedItemError
  }
}

export const removeSavedItem = async (item: Item) => {
  // let error
  // let data
  const userId = await getUserId()
  if (!userId) {
    throw new Error('No user id')
  }
  const { error: userSavedItemError } = await supabase
    .from('User_SavedItem')
    .delete()
    .eq('item_id', item._id)
    .eq('user_id', userId) 
  if (userSavedItemError) {
    throw userSavedItemError
  }
  const { data: uriData, error: uriError } = await supabase
    .from('User_ReadItem')
    .select()
    .eq('item_id', item._id)
  const { data: usiData, error: usiError } = await supabase
    .from('User_SavedItem')
    .select()
    .eq('item_id', item._id)
  if (usiError) {
    throw usiError
  }
  if (uriError) {
    throw uriError
  }
  if (usiData?.length === 0 && uriData?.length === 0) {
    const { error: itemError } = await supabase
      .from('Item')
      .delete()
      .eq('_id', item._id)
    if (itemError) {
      throw itemError
    }
  }
}

export const upsertSavedItems = async (items: Item[]) => {}

export const getFeed = async (url: string): Promise<FeedDB | null> => {
  const {data, error} = await supabase
    .from('Feed')
    .select('*')
    .like('url', url)
  if (error) {
    throw error
  }
  // console.log(url)
  // console.log('getFeed', data)
  return data === null ? null : data[0] as FeedDB
}

export const getFeeds = async (): Promise<FeedDB[] | null> => {
  const {data, error} = await supabase
    .from('User_Feed')
    .select('Feed(*)')
  if (error) {
    throw error
  }
  // console.log('getFeed', data)
  return data === null ? null : data.map(d => ({
    ...d.Feed,
    color: d.Feed?.color?.match(/\[[0-9]*,[0-9]*,[0-9]*\]/) ? JSON.parse(d.Feed.color) : [0, 0, 0]
  })) as FeedDB[]
}

export const getFeedBySiteUrl = async (siteUrl: string): Promise<FeedDB | null> => {
  const {data, error} = await supabase
    .from('Feed')
    .select('*')
    .like('root_url', siteUrl)
  if (error) {
    throw error
  }
  // console.log(siteUrl)
  // console.log('getFeed', data)
  return data === null ? null : data[0] as FeedDB
}


interface FeedDB {
  _id: string
  url: string
  title: string
  description: string
  root_url: string
  color: string
  favicon_url: string
  favicon_size: string
  didError?: boolean
}

export const addFeeds = async (feeds: Feed[]): Promise<Feed[]> => {
  return Promise.all(feeds.map(feed => addFeed(feed)))
}

export const addFeed = async (feed: { url: string, id?: number }, userId?: string): Promise<Feed> => {
  // is the feed already in the database?
  let feedDB = await getFeed(feed.url)
  if (!feedDB) {
    const _id = createId(feed.url)
    const feedMeta = await getFeedMeta(feed)
    feedDB = { 
      _id,
      url: feed.url,
      title: feedMeta.title,
      description: feedMeta.description,
      root_url: feedMeta.rootUrl,
      color: feedMeta.color,
      favicon_url: feedMeta.favicon?.url,
      favicon_size: feedMeta.favicon?.size,
      didError: feedMeta.didError
     }
    let response = await supabase
      .from('Feed')
      .insert({ 
        _id,
        url: feed.url,
        title: feedMeta.title,
        description: feedMeta.description,
        root_url: feedMeta.rootUrl,
        color: feedMeta.color,
        favicon_url: feedMeta.favicon?.url,
        favicon_size: feedMeta.favicon?.size,
        did_error: feedMeta.didError ?? false
       })
    if (response.error) {
      console.log(`Error adding feed ${feed.url}: ${response.error.message}`)
      throw response.error
    }
  }
  // now add the user_feed relationship
  userId = userId || await getUserId()
  if (!userId) {
    throw new Error('No user id')
  }
  let response = await supabase
    .from('User_Feed')
    .select()
    .eq('feed_id', feedDB._id)
    .eq('user_id', userId)
    if (response.error) {
      throw response.error
    }
  if (response.data.length === 0) {
    let response = await supabase
      .from('User_Feed')
      .insert({ 
        feed_id: feedDB._id,
        user_id: userId
      })
      .select()
    if (response.error || !response.data) {
      throw response.error || new Error('No user feed data')
    }
  }
  return {
    _id: feedDB._id,
    rootUrl: feedDB.root_url,
    url: feedDB.url,
    title: feedDB.title,
    description: feedDB.description,
    color: feedDB.color,
    favicon: {
      url: feedDB.favicon_url,
      size: feedDB.favicon_size
    }
  }
}

export const removeUserFeed = async (feed: Feed) => {
  const { data } = await supabase.auth.getSession()
  const user_id = data?.session?.user?.id
  if (!user_id) {
    throw new Error('No user id')
  }
  let response = await supabase
    .from('User_Feed')
    .delete()
    .eq('feed_id', feed._id)
    .eq('user_id', user_id)
  if (response.error) {
    throw response.error
  }
}
