import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import Config from 'react-native-config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Item } from '../store/items/types'
import { Database } from './supabase.types'
import { Feed } from '../store/feeds/types'
import { getFeedMeta } from '../backends/reams'
import { id as createId} from '../utils'

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

export const getSavedItems = async () => {}

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
    .from('SavedItem')
    .insert({ item_id: savedId })
  if (savedItemError) {
    throw savedItemError
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
