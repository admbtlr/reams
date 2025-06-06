export interface Source {
  _id: string
  title: string
  description?: string
  url: string
  color?: string | number[]
  favicon?: {
    url: string | null
    size: string | null
  }
  readingTime?: number
  readCount?: number
  unreadCount?: number
  readingRate?: number
  sharedCount?: number
  savedCount?: number
  isLiked?: boolean
  isMuted?: boolean
  isMercury?: boolean
  isNewsletter?: boolean
  isNudgeActive?: boolean
  nextNudge?: number | null
  subscribeUrl?: string | null
}

export interface SourceLocal {
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


export interface Feed extends Source {
  feedbinId?: number
  rootUrl: string
  // isNewsletter?: boolean
}

export interface FeedLocal extends SourceLocal {
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
export const LIKE_SOURCE_TOGGLE = 'LIKE_SOURCE_TOGGLE'
export const UNLIKE_FEED = 'UNLIKE_FEED'
export const MUTE_SOURCE_TOGGLE = 'MUTE_SOURCE_TOGGLE'
export const UNMUTE_FEED = 'UNMUTE_FEED'
export const MARK_FEED_READ = 'MARK_FEED_READ'
export const MERCURY_SOURCE_TOGGLE = 'MERCURY_SOURCE_TOGGLE'

export const CACHE_FEED_ICON_ERROR = 'CACHE_FEED_ICON_ERROR'
export const SET_CACHED_FEED_ICON = 'SET_CACHED_FEED_ICON'
export const SET_CACHED_COVER_IMAGE = 'SET_CACHED_COVER_IMAGE'
export const REMOVE_CACHED_COVER_IMAGE = 'REMOVE_CACHED_COVER_IMAGE'

export const PAUSE_NUDGE = 'PAUSE_NUDGE'
export const DEACTIVATE_NUDGE = 'DEACTIVATE_NUDGE'

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

interface likeSourceToggleAction {
  type: typeof LIKE_SOURCE_TOGGLE
  source: Source
}

interface unlikeFeedAction {
  type: typeof UNLIKE_FEED
  feed: Feed
}

interface muteSourceToggleAction {
  type: typeof MUTE_SOURCE_TOGGLE
  source: Source
}

interface unmuteFeedAction {
  type: typeof UNMUTE_FEED
  feed: Feed
}

interface mercurySourceToggleAction {
  type: typeof MERCURY_SOURCE_TOGGLE
  source: Source
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

export interface pauseNudgeAction {
  type: typeof PAUSE_NUDGE
  sourceId: string
}

export interface deactivateNudgeAction {
  type: typeof DEACTIVATE_NUDGE
  sourceId: string
}

export type FeedActionTypes = addFeedsToStoreAction |
  addFeedAction |
  addFeedsAction |
  removeFeedAction |
  removeFeedsAction |
  updateFeedsAction |
  setFeedsAction |
  updateFeedAction |
  likeSourceToggleAction |
  unlikeFeedAction |
  muteSourceToggleAction |
  unmuteFeedAction |
  mercurySourceToggleAction |
  markFeedReadAction |
  cacheFeedIconErrorAction |
  setCachedFeedIconAction |
  setCachedCardCoverImageAction |
  removeCardCoverImageAction |
  pauseNudgeAction |
  deactivateNudgeAction
