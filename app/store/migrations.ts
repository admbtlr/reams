import { Category } from "./categories/types"
import { Item } from "./items/types"
import { RootState } from "./reducers"

export const migrations = {
  0: (state: RootState) => {
    // null migration
    return state
  },
  1: (state: RootState) => {
    // migration to
    // 1. add categories
    // 2. add inbox, archive and annotated categories
    // 3. add saved items to inbox
    const inboxCategory: Category = {
      _id: 'inbox',
      name: 'inbox',
      isItems: true,
      isSystem: true,
      itemIds: [],
      feeds: []
    }
    const archiveCategory: Category = {
      _id: 'archive',
      name: 'archive',
      isItems: true,
      isSystem: true,
      itemIds: [],
      feeds: []
    }
    const annotatedCategory: Category = {
      _id: 'annotated',
      name: 'annotated',
      isItems: true,
      isSystem: true,
      itemIds: [],
      feeds: []
    }
    state.itemsSaved.items.forEach((item: Item) => {
      if (!inboxCategory.itemIds.includes(item._id)) {
        inboxCategory.itemIds.push(item._id)
      }
    })  
    if (!state.categories) {
      state.categories = {
        categories: []
      }
    }
    
    return {
      ...state,
      categories: {
        categories: [
          ...state.categories.categories,
          inboxCategory,
          archiveCategory,
          annotatedCategory
        ]
      }
    }
  },
  2: (state: RootState) => {
    // migration to change is_external to isExternal
    state.itemsSaved.items.forEach((item: Item) => {
      if (item.is_external) {
        item.isExternal = item.is_external
        delete item.is_external
      }
    })
    return state
  }
}