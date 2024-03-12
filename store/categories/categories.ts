import { UserActionTypes, UNSET_BACKEND } from '../user/types'
import { id } from '../../utils/'
import {
  Category,
  CREATE_CATEGORY,
  DELETE_CATEGORY,
  UPDATE_CATEGORY,
  UPDATE_CATEGORIES,
  ADD_FEED_TO_CATEGORY,
  REMOVE_FEED_FROM_CATEGORY,
  ADD_ITEM_TO_CATEGORY,
  REMOVE_ITEM_FROM_CATEGORY,
  CategoriesState,
  CategoriesActionTypes
} from './types'
import { Feed, REMOVE_FEED } from '../feeds/types'
import { UNSAVE_ITEM } from '../items/types'
import { clone } from '@tensorflow/tfjs'

const initialState: CategoriesState = {
  categories: [
    {
      _id: 'annotated',
      name: 'annotated',
      isSystem: true,
      feeds: [],
      itemIds: []
    },
    {
      _id: 'inbox',
      name: 'inbox',
      isSystem: true,
      feeds: [],
      itemIds: []
    },
    {
      _id: 'archive',
      name: 'archive',
      isSystem: true,
      feeds: [],
      itemIds: []
    },
  ]
}

const cloneCategories = (categories: Category[]) => {
  return categories.map((c: Category) => ({
    ...c,
    feeds: [...c.feeds],
    itemIds: [...c.itemIds]
  }))
}

export function categories (
  state = initialState, 
  action: CategoriesActionTypes | UserActionTypes
) {
  let categories: Category[]

  let categoryIndex: number

  switch (action.type) {
    case CREATE_CATEGORY:
      return {
        categories: [
          ...state.categories,
          {
            id: action.id,
            _id: action._id || id(),
            name: action.name,
            feedIds: [],
            itemIds: []
          } as Category
        ]
      }

    case DELETE_CATEGORY:
      return {
        categories: state.categories.filter(c => c._id !== action.category._id)
      }

    case UPDATE_CATEGORY:
      let incoming = action.category
      if (incoming.feedIds.length > 0 && typeof incoming.feedIds[0] === 'object') {
        // we have a feed object, not just an id
        //@ts-ignore
        incoming.feeds = incoming.feedIds.map((f: Feed) => f._id)
      }
      categories = state.categories.map(c => c._id === incoming._id ?
        incoming :
        c)
      return {
        categories: categories
      }

    case UPDATE_CATEGORIES:
      const newCategories = action.categories.map((c: Category) => c)    
      categories = cloneCategories(state.categories)
      newCategories.forEach((newCategory: Category) => {
        const index = categories.findIndex(c => c.id === newCategory.id)
        if (index === -1) {
          categories.push(newCategory)
        } else {
          categories[index] = newCategory
        }
      })
      // if we have a category with an id that is not in the new categories, remove it
      categories = categories.filter((c: Category) => c.id && c.id != '' ? 
        newCategories.find((nc: Category) => nc.id === c.id) : 
        true)
      // ensure all categories have itemIds, because Feedbin doesn't know about them
      categories = categories.map((c: Category) => {
        if (!c.itemIds) {
          c.itemIds = []
        }
        return c
      })
      return {
        categories: categories
      }
  
    case ADD_FEED_TO_CATEGORY:
      categories = cloneCategories(state.categories)
      categoryIndex = categories.findIndex(c => c._id === action.categoryId)
      if (categoryIndex > -1) {
        categories[categoryIndex].feeds.push(action.feedId)
      }
      return {
        categories: categories
      }

    case REMOVE_FEED_FROM_CATEGORY:
      categories = cloneCategories(state.categories)
      categoryIndex = categories.findIndex(c => c._id === action.categoryId)
      if (categoryIndex > -1) {
        categories[categoryIndex].feeds = categories[categoryIndex].feeds.filter(f => f !== action.feedId)
      }
      return {
        categories: categories
      }

    case ADD_ITEM_TO_CATEGORY:
      categories = cloneCategories(state.categories)
      categoryIndex = categories.findIndex(c => c._id === action.categoryId)
      if (categoryIndex > -1) {
        categories[categoryIndex].itemIds.push(action.itemId)
      }
      return {
        categories: categories
      }

    case REMOVE_ITEM_FROM_CATEGORY:
      categories = cloneCategories(state.categories)
      categoryIndex = categories.findIndex(c => c._id === action.categoryId)
      if (categoryIndex > -1) {
        categories[categoryIndex].itemIds = categories[categoryIndex].itemIds.filter(f => f !== action.itemId)
      }
      return {
        categories: categories
      }
  
    case REMOVE_FEED:
      categories = cloneCategories(state.categories)
      categories.forEach(c => {
        c.feeds = c.feeds.filter(f => f !== action.feed._id)
      })
      return {
        categories
      }

    case UNSAVE_ITEM:
      categories = cloneCategories(state.categories)
      categories.forEach(c => {
        if (c.itemIds) {
          c.itemIds = c.itemIds.filter(i => i !== action.item._id)
        }
      })
      return {
        categories
      }

    case UNSET_BACKEND:
      if (action.backend === 'reams') {
        return initialState
      } else {
        return state
      }
      
    
    default:
      return state
  }
}
