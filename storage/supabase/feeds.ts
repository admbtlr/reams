import { SourceDB, getUserId, supabase } from '.'
import { getFeedMeta } from '../../backends'
import { Feed, Source } from '../../store/feeds/types'
import { id as createId, pgTimestamp} from '../../utils'

interface FeedDB extends SourceDB {}

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
  return data?.length > 0 ? {
    ...data[0],
    color: data[0]?.color?.match(/\[[0-9]*,[0-9]*,[0-9]*\]/) ? JSON.parse(data[0].color) : [0, 0, 0],
  } as FeedDB : null
}

export const getFeeds = async (): Promise<FeedDB[] | null> => {
  const {data, error} = await supabase
    .from('User_Feed')
    .select('*, Feed(*)',)
  if (error) {
    throw error
  }
  // console.log('getFeed', data)
  return data === null ? null : data.map(d => ({
    ...d.Feed,
    color: d.Feed?.color?.match(/\[[0-9]*,[0-9]*,[0-9]*\]/) ? JSON.parse(d.Feed.color) : [0, 0, 0],
    isNudgeActive: d.is_nudge_active,
    nextNudge: d.next_nudge,
    readCount: d.read_count
  })) as FeedDB[]
}

export const getFeedsById = async (ids: [string]): Promise<FeedDB[] | null> => {
  const {data, error} = await supabase
    .from('Feed')
    .select('*',)
    .in('_id', ids)
  if (error) {
    throw error
  }
  // console.log('getFeed', data)
  return data === null ? null : data as FeedDB[]
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
      title: feedMeta?.title || '',
      description: feedMeta?.description || '',
      root_url: feedMeta?.rootUrl,
      color: feedMeta?.color || '',
      favicon_url: feedMeta?.favicon?.url || '',
      favicon_size: feedMeta?.favicon?.size || '',
      didError: feedMeta?.didError
     }
    let response = await supabase
      .from('Feed')
      .insert({ 
        _id,
        url: feed.url || '',
        title: feedMeta?.title || '',
        description: feedMeta?.description || '',
        root_url: feedMeta?.rootUrl || '',
        color: feedMeta?.color,
        favicon_url: feedMeta?.favicon?.url,
        favicon_size: feedMeta?.favicon?.size,
        did_error: feedMeta?.didError ?? false
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
  let userFeed
  let response = await supabase
    .from('User_Feed')
    .select()
    .eq('feed_id', feedDB._id)
    .eq('user_id', userId)
    if (response.error) {
      throw response.error
    } else {
      userFeed = response.data[0]
    }
  let userFeedQuery
  if (response.data.length === 0) {
    userFeedQuery = await supabase
      .from('User_Feed')
      .insert({ 
        feed_id: feedDB._id,
        user_id: userId
      })
      .select()
    if (userFeedQuery.error || !userFeedQuery.data) {
      throw userFeedQuery.error || new Error('No user feed data')
    }
    userFeed = userFeedQuery.data[0]
  }
  const color = typeof feedDB.color === 'object' ?
    feedDB.color :
    feedDB.color.replace(/[\[\]]/g, '').split(',').map(c => parseInt(c))
  return {
    _id: feedDB._id,
    rootUrl: feedDB.root_url ?? '',
    url: feedDB.url,
    title: feedDB.title,
    description: feedDB.description,
    color,
    favicon: {
      url: feedDB.favicon_url,
      size: feedDB.favicon_size
    },
    isNudgeActive: userFeed.is_nudge_active,
    nextNudge: userFeed.next_nudge,
    readCount: userFeed.read_count ?? 0
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

export const incrementReadCountFeed = async (feedId: string) => {
  const { data } = await supabase.auth.getSession()
  const user_id = data?.session?.user?.id
  if (!user_id) {
    throw new Error('No user id')
  }
  const select = await supabase
    .from('User_Feed')
    .select('read_count')
    .eq('feed_id', feedId)
    .eq('user_id', user_id)
  if (select.error) {
    throw select.error
  }
  const readCount = (select.data.length > 0 && select.data[0].read_count) || 0
  const update = await supabase
    .from('User_Feed')
    .update({
      read_count: readCount + 1
    })
    .eq('feed_id', feedId)
    .eq('user_id', user_id)
  if (update.error) {
    throw update.error
  }
}

export const pauseNudgeFeed = async (source: Source) => {
  const { data } = await supabase.auth.getSession()
  const user_id = data?.session?.user?.id
  if (!user_id) {
    throw new Error('No user id')
  }
  const update = await supabase
    .from('User_Feed')
    .update({
      next_nudge: source.nextNudge
    })
    .eq('feed_id', source._id)
    .eq('user_id', user_id)
  if (update.error) {
    throw update.error
  }
}

export const deactivateNudgeFeed = async (source: Source) => {
  const { data } = await supabase.auth.getSession()
  const user_id = data?.session?.user?.id
  if (!user_id) {
    throw new Error('No user id')
  }
  const update = await supabase
    .from('User_Feed')
    .update({
      is_nudge_active: false
    })
    .eq('feed_id', source._id)
    .eq('user_id', user_id)
  if (update.error) {
    throw update.error
  }
}

