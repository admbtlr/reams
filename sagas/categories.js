import { call, put, select } from 'redux-saga/effects'
import { CREATE_CATEGORY_REMOTE, DELETE_CATEGORY_REMOTE, UPDATE_CATEGORIES, UPDATE_CATEGORY, UPDATE_CATEGORY_REMOTE } from "../store/categories/types"
import { 
  getCategories as getCategoriesFromBackend,
  addCategory as createCategoryOnBackend,
  updateCategory as updateCategoryOnBackend,
  deleteCategory as deleteCategoryOnBackend
} from "../backends"
import { id } from '../utils'

export function * getCategories () {
  const categories = yield getCategoriesFromBackend()
  const reamsFeeds = yield select(state => state.feeds.feeds)
  const reamsCategories = yield select(state => state.categories.categories)
  const normaliseCategories = categories => (categories?.map(c => ({
    id: c.id,
    _id: reamsCategories.find(rc => rc.id === c.id)?._id || id(),
    name: c.name,
    feedIds: c.feed_ids
      .map(f => reamsFeeds.find(rf => rf.id === f)).map(rf => rf._id)
  })))
  const categoriesNormalised = normaliseCategories(categories)

  if (categories) {
    yield put({ type: UPDATE_CATEGORIES, categories: categoriesNormalised })
  }
}

export function * createCategory ({ category }) {
  yield put({ type: CREATE_CATEGORY_REMOTE, category })
}

export function * updateCategory (action) {
  const category = action.category ? 
    action.category : 
    yield select(state => state.categories.categories.find(c => c._id === action.categoryId))
  const reamsFeeds = yield select(state => state.feeds.feeds)
  if (!action.fromRemote) {
    const feedIds = category.feedIds.map(f => reamsFeeds.find(rf => rf._id === f))
    yield put({ type: UPDATE_CATEGORY_REMOTE, category: { ...category, feedIds } })
  }
}

export function * deleteCategory ({ category }) {
  yield put({ type: DELETE_CATEGORY_REMOTE, category })
}
