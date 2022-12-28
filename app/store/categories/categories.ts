import { ConfigActionTypes, UNSET_BACKEND } from '../config/types'
import { id } from '../../utils/'
import {
  Category,
  CREATE_CATEGORY,
  DELETE_CATEGORY,
  UPDATE_CATEGORY,
  UPDATE_CATEGORIES,
  ADD_FEED_TO_CATEGORY,
  REMOVE_FEED_FROM_CATEGORY,
  CategoriesState,
  CategoriesActionTypes
} from './types'

const initialState: CategoriesState = {
  categories: []
}

export function categories (
  state = initialState, 
  action: CategoriesActionTypes | ConfigActionTypes
) {
  let categories: Category[]

  switch (action.type) {
    case CREATE_CATEGORY:
      return {
        categories: [
          ...state.categories,
          {
            id: action.id,
            _id: action._id || id(),
            name: action.name,
            feeds: []
          } as Category
        ]
      }

    case DELETE_CATEGORY:
      return {
        categories: state.categories.filter(c => c._id !== action.category._id)
      }

    case UPDATE_CATEGORY:
      let incoming = action.category
      if (incoming.feeds.length > 0 && typeof incoming.feeds[0] === 'object') {
        // we have a feed object, not just an id
        incoming.feeds = incoming.feeds.map(f => f._id)
      }
      categories = state.categories.map(c => c._id === incoming._id ?
        incoming :
        c)
      return {
        categories: categories
      }

    case UPDATE_CATEGORIES:
      const newCategories = action.categories.map(c => c)    
      categories = state.categories.map(c => c)
      newCategories.forEach((newCategory: Category) => {
        const index = categories.findIndex(c => c.id === newCategory.id)
        if (index === -1) {
          categories.push(newCategory)
        } else {
          categories[index] = newCategory
        }
      })
      // if we have a category with an id that is not in the new categories, remove it
      categories = categories.filter(c => c.id && c.id != '' ? newCategories.find(nc => nc.id === c.id) : true)
      return {
        categories: categories
      }
  
    case ADD_FEED_TO_CATEGORY:
      categories = state.categories.map(c => c)
      const categoryIndex = categories.findIndex(c => c._id === action.categoryId)
      if (categoryIndex > -1) {
        categories[categoryIndex].feeds.push(action.feedId)
      }
      return {
        categories: categories
      }

    case REMOVE_FEED_FROM_CATEGORY:
      categories = state.categories.map(c => c)
      const categoryIndex2 = categories.findIndex(c => c._id === action.categoryId)
      if (categoryIndex2 > -1) {
        categories[categoryIndex2].feeds = categories[categoryIndex2].feeds.filter(f => f !== action.feedId)
      }
      return {
        categories: categories
      }

    case UNSET_BACKEND:
      return initialState
    
    default:
      return state
  }
}
