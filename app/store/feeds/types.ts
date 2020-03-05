export interface Feed {
  _id: string
  id?: string
  title: string
  url?: string
  color?: string | []
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
  hasRenderedIcon?: boolean
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

export const ADD_FEED_SUCCESS = 'ADD_FEED_SUCCESS'
export const ADD_FEEDS_SUCCESS = 'ADD_FEEDS_SUCCESS'
export const REFRESH_FEED_LIST = 'REFRESH_FEED_LIST'
export const ADD_FEED = 'ADD_FEED'
export const ADD_FEEDS = 'ADD_FEEDS'
export const REMOVE_FEED = 'REMOVE_FEED'
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
export const FEED_HAS_RENDERED_ICON = 'FEED_HAS_RENDERED_ICON'
export const SET_FEEDS_NEW = 'SET_FEEDS_NEW'
export const SET_CACHED_FEED_COVER_IMAGE = 'SET_CACHED_FEED_COVER_IMAGE'

interface addFeedSuccessAction {
  type: typeof ADD_FEED_SUCCESS,
  feed: Feed
}

interface addFeedsSuccessAction {
  type: typeof ADD_FEEDS_SUCCESS
  feeds: Feed[]
}

interface refreshFeedListAction {
  type: typeof REFRESH_FEED_LIST
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

interface removeFeedAction {
  type: typeof REMOVE_FEED
  feed: Feed
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
  id: string
}

interface unlikeFeedAction {
  type: typeof UNLIKE_FEED
  id: string
}

interface muteFeedToggleAction {
  type: typeof MUTE_FEED_TOGGLE
  id: string
}

interface unmuteFeedAction {
  type: typeof UNMUTE_FEED
  id: string
}

interface mercuryFeedToggleAction {
  type: typeof MERCURY_FEED_TOGGLE
  id: string
}

interface markFeedReadAction {
  type: typeof MARK_FEED_READ
  id: string
  originalId?: string
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

interface feedHasRenderedIconAction {
  type: typeof FEED_HAS_RENDERED_ICON
  id: string
}

interface setFeedsNewAction {
  type: typeof SET_FEEDS_NEW
  feeds: Feed[]
}

interface setCachedFeedCoverImageAction {
  type: typeof SET_CACHED_FEED_COVER_IMAGE
  id: string
  cachedCoverImageId: string
}

export type FeedActionTypes = addFeedSuccessAction |
  addFeedsSuccessAction |
  refreshFeedListAction |
  addFeedAction |
  addFeedsAction |
  removeFeedAction |
  updateFeedsAction |
  updateFeedAction |
  likeFeedToggleAction |
  unlikeFeedAction |
  muteFeedToggleAction |
  unmuteFeedAction |
  mercuryFeedToggleAction |
  markFeedReadAction |
  cacheFeedIconErrorAction |
  setCachedFeedIconAction |
  feedHasRenderedIconAction |
  setFeedsNewAction |
  setCachedFeedCoverImageAction
