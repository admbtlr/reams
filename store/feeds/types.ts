export interface Feed {
  _id: string
  feedbinId?: number
  title: string
  description?: string
  url: string
  color?: string | number[]
  favicon?: {
    url: string
    size: string
  }
  rootUrl: string
  reading_time?: number
  number_read?: number
  number_unread?: number
  reading_rate?: number
  number_shared?: number
  number_saved?: number
  isLiked?: boolean
  isMuted?: boolean
  isMercury?: boolean
}

export interface FeedLocal {
  _id: string
  hasCachedIcon?: boolean
  cachedIconDimensions?: {
    width: number
    height: number
  }
  numCachingErrors?: number
  lastCachingError?: number
  cachedCoverImageId?: string
  isNew?: boolean
}

export interface FeedsState {
  readonly feeds: Feed[]
  readonly lastUpdated: number
}

export interface FeedsLocalState {
  readonly feeds: FeedLocal[]
}

export const SET_FEEDS = 'SET_FEEDS'
export const ADD_FEED = 'ADD_FEED'
export const ADD_FEEDS = 'ADD_FEEDS'
export const ADD_FEEDS_TO_STORE = 'ADD_FEEDS_TO_STORE'
export const REMOVE_FEED = 'REMOVE_FEED'
export const REMOVE_FEEDS = 'REMOVE_FEEDS'
export const UPDATE_FEEDS = 'UPDATE_FEEDS'
export const UPDATE_FEED = 'UPDATE_FEED'
export const LIKE_FEED_TOGGLE = 'LIKE_FEED_TOGGLE'
export const UNLIKE_FEED = 'UNLIKE_FEED'
export const MUTE_FEED_TOGGLE = 'MUTE_FEED_TOGGLE'
export const UNMUTE_FEED = 'UNMUTE_FEED'
export const MARK_FEED_READ = 'MARK_FEED_READ'
export const MERCURY_FEED_TOGGLE = 'MERCURY_FEED_TOGGLE'

export const CACHE_FEED_ICON_ERROR = 'CACHE_FEED_ICON_ERROR'
export const SET_CACHED_FEED_ICON = 'SET_CACHED_FEED_ICON'
export const SET_CACHED_COVER_IMAGE = 'SET_CACHED_COVER_IMAGE'
export const REMOVE_CACHED_COVER_IMAGE = 'REMOVE_CACHED_COVER_IMAGE'

interface addFeedsToStoreAction {
  type: typeof ADD_FEEDS_TO_STORE
  feeds: Feed[]
}

interface setFeedsAction {
  type: typeof SET_FEEDS
  feeds: Feed[]
}

interface addFeedAction {
  type: typeof ADD_FEED
  feed: Feed
}

interface addFeedsAction {
  type: typeof ADD_FEEDS
  feeds: Feed[]
}

export interface removeFeedAction {
  type: typeof REMOVE_FEED
  feed: Feed
}

interface removeFeedsAction {
  type: typeof REMOVE_FEEDS
  feeds: Feed[]
}

interface updateFeedsAction {
  type: typeof UPDATE_FEEDS
  feeds: Feed[]
}

interface updateFeedAction {
  type: typeof UPDATE_FEED
  feed: Feed
}

interface likeFeedToggleAction {
  type: typeof LIKE_FEED_TOGGLE
  feed: Feed
}

interface unlikeFeedAction {
  type: typeof UNLIKE_FEED
  feed: Feed
}

interface muteFeedToggleAction {
  type: typeof MUTE_FEED_TOGGLE
  feed: Feed
}

interface unmuteFeedAction {
  type: typeof UNMUTE_FEED
  feed: Feed
}

interface mercuryFeedToggleAction {
  type: typeof MERCURY_FEED_TOGGLE
  feed: Feed
}

interface markFeedReadAction {
  type: typeof MARK_FEED_READ
  feed: Feed
  olderThan?: number
}

interface cacheFeedIconErrorAction {
  type: typeof CACHE_FEED_ICON_ERROR
  id: string
}

interface setCachedFeedIconAction {
  type: typeof SET_CACHED_FEED_ICON
  id: string
  dimensions: {
    width: number
    height: number
  }
}

interface setCachedCardCoverImageAction {
  type: typeof SET_CACHED_COVER_IMAGE
  id: string
  cachedCoverImageId: string
}

interface removeCardCoverImageAction {
  type: typeof REMOVE_CACHED_COVER_IMAGE
  id: string
}

export type FeedActionTypes = addFeedsToStoreAction |
  addFeedAction |
  addFeedsAction |
  removeFeedAction |
  removeFeedsAction |
  updateFeedsAction |
  setFeedsAction |
  updateFeedAction |
  likeFeedToggleAction |
  unlikeFeedAction |
  muteFeedToggleAction |
  unmuteFeedAction |
  mercuryFeedToggleAction |
  markFeedReadAction |
  cacheFeedIconErrorAction |
  setCachedFeedIconAction |
  setCachedCardCoverImageAction |
  removeCardCoverImageAction
