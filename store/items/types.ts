import type { Direction } from "../config/types"
import type { Feed } from "../feeds/types"

export enum ItemType {
  unread = 'unread',
  saved = 'saved'
}

export interface ItemStyles {
  coverImage: {
    align: string
    color: string
    isBW: boolean
    isCoverImageColorDarker: boolean
    isInline: boolean
    isMultiply: boolean
    isScreen: boolean
    resizeMode: "cover" | "contain"
    showCoverImage: boolean
  }
  title: {
    [x: string]: string | boolean | number | undefined
    bg?: boolean
    excerptFullWidth?: boolean
    excerptHorizontalAlign?: boolean
    excerptInvertBG?: boolean
    fontSize?: number
    hasBorder?: boolean
    hasShadow?: boolean
    invertBG?: boolean
    invertedBGMargin?: number
    isBold?: boolean
    isInline?: boolean
    isItalic?: boolean
    isUpperCase?: boolean
    isVertical?: boolean
    lineHeightAsMultiplier?: number
    fontResized?: boolean
    vAlign?: boolean
  }
  color?: string
  dropCapFamily?: string
  dropCapIsBold?: boolean
  dropCapIsDrop?: boolean
  dropCapIsMonochrome?: boolean
  dropCapIsStroke?: boolean
  dropCapSize?: number
  fontClasses?: { heading: string, body: string }
  hasColorBlockquoteBG?: boolean
  hasFeedBGColor?: boolean
  isCoverInline?: boolean
}

export interface Item {
  _id: string
  blobId: string | undefined // fastmail newsletters
  content_length: number | undefined
  coverImageFile: string | undefined
  coverImageUrl: string | undefined
  created_at: number
  decoration_failures?: number | undefined
  feed_id: string
  feed_title: string
  hasCoverImage?: boolean | undefined
  hasShownMercury?: boolean | undefined
  imageDimensions?: {
    width: number
    height: number
  }
  isAnalysed?: boolean | undefined
  isDecorated?: boolean | undefined
  isExternal?: boolean | undefined
  isHtmlCleaned?: boolean | undefined
  isKeepUnread?: boolean | undefined
  isMercuryCleaned?: boolean | undefined
  isNewsletter?: boolean | undefined
  isSaved?: boolean | undefined
  id?: string | number | undefined
  readAt?: number | undefined
  savedAt: number | undefined
  scrollRatio?: {
    html?: number
    mercury?: number
  }
  showCoverImage?: boolean
  showMercuryContent?: boolean
  title: string
  url: string
}

export interface ItemInflated extends Item {
  _id: string
  author?: string
  content_html?: string
  content_mercury?: string
  date_published?: string
  excerpt?: string
  faceCentreNormalised?: {
    x: number
    y: number
  }
  readingTime?: number
  styles: ItemStyles
}

export interface MercuryStuff {
  error?: string
  message?: string
  author?: string
  content?: string
  date_published?: string
  domain?: string
  excerpt?: string
  lead_image_url?: string
  title?: string
}

export interface ImageStuff {
  coverImageFile?: string
  imageDimensions?: {
    width: number
    height: number
  }
  faceCentreNormalised?: {
    x: number
    y: number
  }
}

interface BackendItem {
  id: string
  url: string
}

export interface ItemsState {
  readonly items: Item[]
  readonly index: number
  readonly lastUpdated: number
}

export const SET_DISPLAY_MODE = 'SET_DISPLAY_MODE'
export const UPDATE_CURRENT_INDEX = 'UPDATE_CURRENT_INDEX'
export const INCREMENT_INDEX = 'INCREMENT_INDEX'
export const DECREMENT_INDEX = 'DECREMENT_INDEX'
export const ITEMS_BATCH_FETCHED = 'ITEMS_BATCH_FETCHED'
export const PRUNE_UNREAD = 'PRUNE_UNREAD'
export const CLEAR_READ_ITEMS = 'CLEAR_READ_ITEMS'
export const SET_LAST_UPDATED = 'SET_LAST_UPDATED'
export const REMOVE_ITEMS = 'REMOVE_ITEMS'
export const SAVE_ITEM = 'SAVE_ITEM'
export const SET_SAVED_ITEMS = 'SET_SAVED_ITEMS'
export const SAVE_EXTERNAL_URL = 'SAVE_EXTERNAL_URL'
export const SAVE_EXTERNAL_ITEM = 'SAVE_EXTERNAL_ITEM'
export const SAVE_EXTERNAL_ITEM_SUCCESS = 'SAVE_EXTERNAL_ITEM_SUCCESS'
export const UNSAVE_ITEM = 'UNSAVE_ITEM'
export const UNSAVE_ITEMS = 'UNSAVE_ITEMS'
export const UPDATE_ITEM = 'UPDATE_ITEM'
export const MARK_ITEM_READ = 'MARK_ITEM_READ'
export const MARK_ITEMS_READ = 'MARK_ITEMS_READ'
export const MARK_ITEMS_READ_SKIP_BACKEND = 'MARK_ITEMS_READ_SKIP_BACKEND'
export const RECEIVED_REMOTE_READ_ITEMS = 'RECEIVED_REMOTE_READ_ITEMS'
export const SHARE_ITEM = 'SHARE_ITEM'
export const TOGGLE_MERCURY_VIEW = 'TOGGLE_MERCURY_VIEW'
export const ITEM_DECORATION_SUCCESS = 'ITEM_DECORATION_SUCCESS'
export const ITEM_DECORATION_FAILURE = 'ITEM_DECORATION_FAILURE'
export const ITEM_DECORATION_PROGRESS = 'ITEM_DECORATION_PROGRESS'
export const IMAGE_ANALYSIS_DONE = 'IMAGE_ANALYSIS_DONE'
export const ADD_readingTime = 'ADD_readingTime'
export const SET_SCROLL_OFFSET = 'SET_SCROLL_OFFSET'
export const SET_TITLE_FONT_SIZE = 'SET_TITLE_FONT_SIZE'
export const SORT_ITEMS = 'SORT_ITEMS'
export const ITEM_BODY_CLEANED = 'ITEM_BODY_CLEANED'
export const RESET_DECORATION_FALIURES = 'RESET_DECORATION_FALIURES'
export const SET_KEEP_UNREAD = 'SET_KEEP_UNREAD'

interface setDisplayModeAction {
  type: typeof SET_DISPLAY_MODE
  displayMode: ItemType
}

interface updateCurrentIndexAction {
  type: typeof UPDATE_CURRENT_INDEX
  displayMode: ItemType
  index: number
}

interface incrementIndexAction {
  type: typeof INCREMENT_INDEX
  displayMode: ItemType
}

interface decrementIndexAction {
  type: typeof DECREMENT_INDEX
  displayMode: ItemType
}

interface updateItemAction {
  type: typeof UPDATE_ITEM
  item: Item
}

interface itemsBatchFetchedAction {
  type: typeof ITEMS_BATCH_FETCHED
  itemType: ItemType
  items: Item[]
  feeds?: Feed[]
  sortDirection?: Direction
}

interface pruneUnreadAction {
  type: typeof PRUNE_UNREAD
  maxItems: number
  itemSort: string
  prunedItems: Item[]
}

interface setLastUpdatedAction {
  type: typeof SET_LAST_UPDATED,
  itemType: ItemType
}

interface removeItemsAction {
  type: typeof REMOVE_ITEMS
  items: Item[]
}

interface setSavedItemsAction {
  type: typeof SET_SAVED_ITEMS
  items: Item[]
}

interface saveItemAction {
  type: typeof SAVE_ITEM
  item: Item
  savedAt: number
}

interface saveExternalItemAction {
  type: typeof SAVE_EXTERNAL_ITEM
  item: Item
  savedAt: number
}

interface saveExternalItemSuccessAction {
  type: typeof SAVE_EXTERNAL_ITEM_SUCCESS
  item: BackendItem
}

export interface saveExternalUrlAction {
  type: typeof SAVE_EXTERNAL_URL
  url: string
}

export interface unsaveItemAction {
  type: typeof UNSAVE_ITEM
  item: Item
}

interface unsaveItemsAction {
  type: typeof UNSAVE_ITEMS
  items: Item[]
}

export interface shareItemAction {
  type: typeof SHARE_ITEM
  item: Item
}

export interface markItemReadAction {
  type: typeof MARK_ITEM_READ
  item: Item
}

export interface markItemsReadAction {
  type: typeof MARK_ITEMS_READ
  items: Item[]
}

export interface markItemsReadSkipBackendAction {
  type: typeof MARK_ITEMS_READ_SKIP_BACKEND
  items: Item[]
}

export interface toggleMercuryViewAction {
  type: typeof TOGGLE_MERCURY_VIEW
  item: Item
}

export interface itemDecorationSuccessAction {
  type: typeof ITEM_DECORATION_SUCCESS
  item: Item
  mercuryStuff: MercuryStuff
  imageStuff: ImageStuff
  isSaved: boolean,
  displayMode: string
}

export interface itemDecorationFailureAction {
  type: typeof ITEM_DECORATION_FAILURE
  item: Item
  mercuryStuff: MercuryStuff
  isSaved: boolean
}

export interface imageAnalysisSuccessAction {
  type: typeof IMAGE_ANALYSIS_DONE
  item: Item
  imageStuff: ImageStuff
  isSaved: boolean
  displayMode: string
}

interface itemDecorationProgressAction {
  type: typeof ITEM_DECORATION_PROGRESS
  decoratedCount: number
}

interface addReadingTimeAction {
  type: typeof ADD_readingTime
  item: Item
  readingTime: number
}

export interface setScrollOffsetAction {
  type: typeof SET_SCROLL_OFFSET
  item: Item
  scrollRatio: number
}

export interface setTitleFontSizeAction {
  type: typeof SET_TITLE_FONT_SIZE
  item: Item
  fontSize: number
}

// export interface setTitleFontResizedAction {
//   type: typeof SET_TITLE_FONT_RESIZED
//   item: Item
// }

export interface sortItems {
  type: typeof SORT_ITEMS
}

export interface itemBodyCleanedAction {
  type: typeof ITEM_BODY_CLEANED
  item: Item
}

export interface resetDecorationFailuresAction {
  type: typeof ITEM_BODY_CLEANED
  itemId: string
}

export interface setKeepUnread {
  type: typeof SET_KEEP_UNREAD
  item: Item
  keepUnread: boolean
}

export type ItemActionTypes = setDisplayModeAction |
  updateCurrentIndexAction |
  incrementIndexAction |
  decrementIndexAction |
  updateItemAction |
  itemsBatchFetchedAction |
  pruneUnreadAction |
  setLastUpdatedAction |
  removeItemsAction |
  setSavedItemsAction |
  saveItemAction |
  saveExternalItemAction |
  saveExternalItemSuccessAction |
  unsaveItemAction |
  unsaveItemsAction |
  shareItemAction |
  markItemReadAction |
  markItemsReadAction |
  markItemsReadSkipBackendAction |
  toggleMercuryViewAction |
  itemDecorationSuccessAction |
  itemDecorationFailureAction |
  itemDecorationProgressAction |
  imageAnalysisSuccessAction |
  addReadingTimeAction |
  setScrollOffsetAction |
  setTitleFontSizeAction |
  // setTitleFontResizedAction |
  sortItems |
  itemBodyCleanedAction |
  resetDecorationFailuresAction |
  setKeepUnread
