import { call, put, select } from 'redux-saga/effects'
import { Item, UNSAVE_ITEM } from '../store/items/types'
import { Annotation } from '../store/annotations/types'
import { RootState } from '../store/reducers'
import { Category } from '../store/categories/types'

export function * deleteAnnotation ({ annotation }: { annotation: Annotation } ) {
  const annotations = yield select((state: RootState) => state.annotations.annotations)
  const item: Item = yield select((state: RootState) => state.itemsSaved.items.find((i: Item) => i._id === annotation.item_id))
  const annotationsForItem = annotations.filter((a: Annotation) => a.item_id === item._id)
  if (annotationsForItem.length === 0) {
    yield put({ type: 'REMOVE_ITEM_FROM_CATEGORY', itemId: item._id, categoryId: 'annotated' })
    const categories = yield select((state: RootState) => state.categories.categories)
    const categoriesForItem = categories.filter((c: Category) => c.itemIds?.includes(item._id))
    // potential race condition: can't tell whether item has already been removed from category
    if (categoriesForItem.length === 0) {
      yield put({ type: UNSAVE_ITEM, item })
    }
  }
}
