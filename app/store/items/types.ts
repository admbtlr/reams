export enum ItemType {
  unread = 'unread',
  saved = 'saved'
}

export interface Item {
  _id: string
  feed_id: string
  id?: string
  created_at: number
  readAt?: number
  readingTime?: number
  isSaved?: boolean
  savedAt?: number
  url?: string
  title: string
  content_html?: string
  content_mercury?: string
  showMercuryContent?: boolean
  hasShownMercury?: boolean
  scrollRatio?: {
    html?: number
    mercury?: number
  }
  hasCoverImage?: boolean
  coverImageFile?: string
  decoration_failures?: number
  styles: {
    title: {
      fontSize?: number
      lineHeight?: number
      fontResized?: boolean
    }
  }
}

interface MercuryStuff {
  error?: string
  message?: string
}

export interface ItemsState {
  readonly items: Item[]
  readonly index: number
  readonly lastUpdated: number
}

export const SET_DISPLAY_MODE = 'SET_DISPLAY_MODE'
export const UPDATE_CURRENT_INDEX = 'UPDATE_CURRENT_INDEX'
export const ITEMS_BATCH_FETCHED = 'ITEMS_BATCH_FETCHED'
export const PRUNE_UNREAD = 'PRUNE_UNREAD'
export const CLEAR_READ_ITEMS = 'CLEAR_READ_ITEMS'
export const CLEAR_READ_ITEMS_SUCCESS = 'CLEAR_READ_ITEMS_SUCCESS'
export const SET_LAST_UPDATED = 'SET_LAST_UPDATED'
export const REMOVE_ITEMS = 'REMOVE_ITEMS'
export const SAVE_ITEM = 'SAVE_ITEM'
export const SAVE_EXTERNAL_URL = 'SAVE_EXTERNAL_URL'
export const SAVE_EXTERNAL_ITEM = 'SAVE_EXTERNAL_ITEM'
export const UNSAVE_ITEM = 'UNSAVE_ITEM'
export const UNSAVE_ITEMS = 'UNSAVE_ITEMS'
export const MARK_ITEM_READ = 'MARK_ITEM_READ'
export const MARK_ITEMS_READ = 'MARK_ITEMS_READ'
export const RECEIVED_REMOTE_READ_ITEMS = 'RECEIVED_REMOTE_READ_ITEMS'
export const SHARE_ITEM = 'SHARE_ITEM'
export const TOGGLE_MERCURY_VIEW = 'TOGGLE_MERCURY_VIEW'
export const FLATE_ITEMS = 'FLATE_ITEMS'
export const FLATE_ITEMS_ERROR = 'FLATE_ITEMS_ERROR'
export const ITEM_DECORATION_SUCCESS = 'ITEM_DECORATION_SUCCESS'
export const ITEM_DECORATION_FAILURE = 'ITEM_DECORATION_FAILURE'
export const ITEM_DECORATION_PROGRESS = 'ITEM_DECORATION_PROGRESS'
export const ADD_READING_TIME = 'ADD_READING_TIME'
export const SET_SCROLL_OFFSET = 'SET_SCROLL_OFFSET'
export const SET_TITLE_FONT_SIZE = 'SET_TITLE_FONT_SIZE'
export const SET_TITLE_FONT_RESIZED = 'SET_TITLE_FONT_RESIZED'

interface setDisplayModeAction {
  type: typeof SET_DISPLAY_MODE
  displayMode: ItemType
}

interface updateCurrentIndexAction {
  type: typeof UPDATE_CURRENT_INDEX
  displayMode: ItemType
  index: number
}

interface itemsBatchFetchedAction {
  type: typeof ITEMS_BATCH_FETCHED
  itemType: ItemType
  items: Item[]
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

export interface saveExternalUrlAction {
  type: typeof SAVE_EXTERNAL_URL
  url: string
}

interface unsaveItemAction {
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

export interface flateItemsAction {
  type: typeof FLATE_ITEMS
  itemsToInflate: Item[]
  itemsToDeflate: Item[]
}

export interface flateItemsErrorAction {
  type: typeof FLATE_ITEMS_ERROR
  items: Item[]
}

export interface itemDecorationSuccessAction {
  type: typeof ITEM_DECORATION_SUCCESS
  item: Item
  mercuryStuff: MercuryStuff
  imageStuff: object
  isSaved: boolean
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

export type ItemActionTypes = setDisplayModeAction |
  updateCurrentIndexAction |
  itemsBatchFetchedAction |
  pruneUnreadAction |
  clearReadItemsSuccessAction |
  setLastUpdatedAction |
  removeItemsAction |
  saveItemAction |
  saveExternalItemAction |
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
  setTitleFontResizedAction
