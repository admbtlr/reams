import { Direction } from "../config/types"
import { Feed } from "../feeds/types"

export enum ItemType {
  unread = 'unread',
  saved = 'saved'
}

interface ItemStyles {
  coverImage: {
    align: string
    color: string
    isBW: boolean
    isCoverImageColorDarker: boolean
    isInline: boolean
    isMultiply: boolean
    isScreen: boolean
    resizeMode: "cover" | "containe"
    showCoverImage: boolean
  }
  title: {
    fontSize?: number
    lineHeight?: number
    fontResized?: boolean
  }
  isCoverInline?: boolean
}

export interface Item {
  _id: string
  content_length: number | undefined
  coverImageFile: string | undefined
  coverImageUrl: string | undefined
  created_at: number
  decoration_failures: number | undefined
  feed_id: string
  feed_title: string
  hasCoverImage: boolean | undefined
  hasShownMercury: boolean | undefined
  imageDimensions?: {
    width: number
    height: number
  }
  isDecorated: boolean | undefined
  isSaved: boolean | undefined
  id: string | number | undefined
  readAt: number | undefined
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
  readingTime?: number
  styles: ItemStyles
}

export interface MercuryStuff {
  error?: string
  message?: string
  author?: string
  content?: string
  date_published?: string
  dek?: string
  direction?: string
  domain?: string
  excerpt?: string
  lead_image_url?: string
  next_page_url?: string
  rendered_pages?: number
  title?: string
  total_pages?: number
  url?: string
  word_count?: number
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
export const CLEAR_READ_ITEMS_SUCCESS = 'CLEAR_READ_ITEMS_SUCCESS'
export const SET_LAST_UPDATED = 'SET_LAST_UPDATED'
export const REMOVE_ITEMS = 'REMOVE_ITEMS'
export const SAVE_ITEM = 'SAVE_ITEM'
export const SET_SAVED_ITEMS = 'SET_SAVED_ITEMS'
export const SAVE_EXTERNAL_URL = 'SAVE_EXTERNAL_URL'
export const SAVE_EXTERNAL_ITEM = 'SAVE_EXTERNAL_ITEM'
export const SAVE_EXTERNAL_ITEM_SUCCESS = 'SAVE_EXTERNAL_ITEM_SUCCESS'
export const UNSAVE_ITEM = 'UNSAVE_ITEM'
export const UNSAVE_ITEMS = 'UNSAVE_ITEMS'
export const MARK_ITEM_READ = 'MARK_ITEM_READ'
export const MARK_ITEMS_READ = 'MARK_ITEMS_READ'
export const RECEIVED_REMOTE_READ_ITEMS = 'RECEIVED_REMOTE_READ_ITEMS'
export const SHARE_ITEM = 'SHARE_ITEM'
export const TOGGLE_MERCURY_VIEW = 'TOGGLE_MERCURY_VIEW'
export const ITEM_DECORATION_SUCCESS = 'ITEM_DECORATION_SUCCESS'
export const ITEM_DECORATION_FAILURE = 'ITEM_DECORATION_FAILURE'
export const ITEM_DECORATION_PROGRESS = 'ITEM_DECORATION_PROGRESS'
export const ADD_READING_TIME = 'ADD_READING_TIME'
export const SET_SCROLL_OFFSET = 'SET_SCROLL_OFFSET'
export const SET_TITLE_FONT_SIZE = 'SET_TITLE_FONT_SIZE'
export const SORT_ITEMS = 'SORT_ITEMS'

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
  itemSort: any
  prunedItems: Item[]
}

interface clearReadItemsSuccessAction {
  type: typeof CLEAR_READ_ITEMS_SUCCESS
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

interface itemDecorationProgressAction {
  type: typeof ITEM_DECORATION_PROGRESS
  decoratedCount: number
}

interface addReadingTimeAction {
  type: typeof ADD_READING_TIME
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

export interface setTitleFontResizedAction {
  type: typeof SET_TITLE_FONT_RESIZED
  item: Item
}

export interface sortItems {
  type: typeof SORT_ITEMS
}

export type ItemActionTypes = setDisplayModeAction |
  updateCurrentIndexAction |
  incrementIndexAction |
  decrementIndexAction |
  itemsBatchFetchedAction |
  pruneUnreadAction |
  clearReadItemsSuccessAction |
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
  toggleMercuryViewAction |
  flateItemsAction |
  flateItemsErrorAction |
  itemDecorationSuccessAction |
  itemDecorationFailureAction |
  itemDecorationProgressAction |
  addReadingTimeAction |
  setScrollOffsetAction |
  setTitleFontSizeAction |
  setTitleFontResizedAction |
  sortItems
