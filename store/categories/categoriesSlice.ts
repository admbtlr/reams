import { 
  Category, CategoriesState
} from "./types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../reducers";
import { 
  addCategory as addCategoryBackend,
  updateCategory as updateCategoryBackend,
  deleteCategory as deleteCategoryBackend,
  getCategories as fetchCategoriesBackend
} from "../../backends"

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (category: Category, { getState, dispatch }): Promise<Category> => {
    const { config } = getState() as RootState
    if (!config.isOnline) {
      // TODO add to remote action queue
      return category
    } else {
      return await addCategoryBackend(category)
    }
  }
)

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async (category: Category, { getState, dispatch }): Promise<Category | undefined> => {
    const { config } = getState() as RootState
    if (!config.isOnline) {
      // TODO add to remote action queue
      return category
    } else {
      return await updateCategoryBackend(category)
    }
  }
)

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (category: Category, { getState, dispatch }): Promise<Category> => {
    const { config } = getState() as RootState
    if (!config.isOnline) {
      // TODO add to remote action queue
      return category
    } else {
      return await deleteCategoryBackend(category)
    }
  }
)

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { getState }): Promise<Category[]> => {
    console.log('fetchCategories')
    const { categories } = getState() as RootState
    return await fetchCategoriesBackend()
  }
)

const initialState: CategoriesState = {
  categories: [
    {
      _id: 'annotated',
      name: 'annotated',
      isSystem: true,
      feedIds: [],
      itemIds: []
    },
    {
      _id: 'inbox',
      name: 'inbox',
      isSystem: true,
      feedIds: [],
      itemIds: []
    },
    {
      _id: 'archive',
      name: 'archive',
      isSystem: true,
      feedIds: [],
      itemIds: []
    }
  ],
  // updatedAt: 0
}

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(createCategory.fulfilled, (state, action) => {
      state.categories.push(action.payload)
    })
    builder.addCase(updateCategory.fulfilled, (state, action) => {
      if (action.payload === undefined) {
        return
      }
      let i = state.categories.findIndex((a: Category) => a._id === action.payload._id)
      state.categories[i] = action.payload
    })
    builder.addCase(deleteCategory.fulfilled, (state, action) => {
      let i = state.categories.findIndex((a: Category) => a._id === action.payload._id)
      state.categories.splice(i, 1)
    })
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      action.payload.forEach((a: Category) => {
        let i = state.categories.findIndex((s: Category) => s._id === a._id)
        if (i > -1) {
          state.categories[i] = a
        } else {
          state.categories.push(a)
        }
      })
      // state.updatedAt = Date.now()
    })
  }
})

// Extract the action creators object and the reducer
export const { actions, reducer } = categoriesSlice
// Export the reducer, either as a default or named export
const categories = categoriesSlice.reducer
export default categories

export const selectCategories = (state: RootState) => state.categories.categories
