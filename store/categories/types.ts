import { removeFeedAction } from "../feeds/types"
import { unsaveItemAction } from "../items/types"

// config
export const CREATE_CATEGORY = 'CREATE_CATEGORY'
export const DELETE_CATEGORY = 'DELETE_CATEGORY'
export const UPDATE_CATEGORY = 'UPDATE_CATEGORY'
export const CREATE_CATEGORY_REMOTE = 'CREATE_CATEGORY_REMOTE'
export const DELETE_CATEGORY_REMOTE = 'DELETE_CATEGORY_REMOTE'
export const UPDATE_CATEGORY_REMOTE = 'UPDATE_CATEGORY_REMOTE'
export const UPDATE_CATEGORIES = 'UPDATE_CATEGORIES'
export const ADD_FEED_TO_CATEGORY = 'ADD_FEED_TO_CATEGORY'
export const REMOVE_FEED_FROM_CATEGORY = 'REMOVE_FEED_FROM_CATEGORY'
export const ADD_ITEM_TO_CATEGORY = 'ADD_ITEM_TO_CATEGORY'
export const REMOVE_ITEM_FROM_CATEGORY = 'REMOVE_ITEM_FROM_CATEGORY'

export interface Category {
  id?: string
  _id: string
  name: string
  isSystem?: boolean
  feedIds: string[] // feed ids, which is sketchy but ok
  itemIds: string[]
}

interface createCategory {
  type: typeof CREATE_CATEGORY | typeof CREATE_CATEGORY_REMOTE
  _id: string
  id: string
  name: string
}

export interface deleteCategory {
  type: typeof DELETE_CATEGORY | typeof DELETE_CATEGORY_REMOTE
  category: Category
}

interface updateCategory {
  type: typeof UPDATE_CATEGORY | typeof UPDATE_CATEGORY_REMOTE
  category: Category
}

interface updateCategories {
  type: typeof UPDATE_CATEGORIES
  categories: Category[]
}

interface addFeedToCategory {
  type: typeof ADD_FEED_TO_CATEGORY
  categoryId: string
  feedId: string
}

interface removeFeedFromCategory {
  type: typeof REMOVE_FEED_FROM_CATEGORY
  categoryId: string
  feedId: string
}

interface addItemToCategory {
  type: typeof ADD_ITEM_TO_CATEGORY
  categoryId: string
  itemId: string
}

interface removeItemFromCategory {
  type: typeof REMOVE_ITEM_FROM_CATEGORY
  categoryId: string
  itemId: string
}

export interface CategoriesState {
  readonly categories: Category[]
}

export type CategoriesActionTypes = createCategory | 
  deleteCategory | 
  updateCategory | 
  updateCategories | 
  addFeedToCategory | 
  removeFeedFromCategory | 
  addItemToCategory |
  removeItemFromCategory |
  unsaveItemAction |
  removeFeedAction
