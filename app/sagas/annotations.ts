import { call, put, select } from 'redux-saga/effects'
import { Item, UNSAVE_ITEM } from '../store/items/types'
import { Annotation, EDIT_ANNOTATION } from '../store/annotations/types'
import { RootState } from '../store/reducers'
import { Category } from '../store/categories/types'
import { createHighlight, deleteHighlight, updateHighlight } from '../backends/readwise'

export function * addAnnotation ({ annotation }: { annotation: Annotation } ): any {
  const isReadwise = yield select((state: RootState) => !!state.config.readwiseToken)
  if (isReadwise) {
    const readwiseResponse = yield call(createHighlight, annotation)
    const remoteId = readwiseResponse.modified_highlights[0]
    yield put({ type: EDIT_ANNOTATION, annotation: { ...annotation, remote_id: remoteId }, skipRemote: true })
  }
}

export function * editAnnotation ({ annotation }: { annotation: Annotation }, skipRemote?: Boolean ): any {
  const isReadwise = yield select((state: RootState) => !!state.config.readwiseToken)
  if (isReadwise && !skipRemote) {
    yield call(updateHighlight, annotation)
  }
}

export function * deleteAnnotation ({ annotation }: { annotation: Annotation } ): any {
  const annotations = yield select((state: RootState) => state.annotations.annotations)
  const item: Item = yield select((state: RootState) => state.itemsSaved.items.find((i: Item) => i._id === annotation.item_id))
  const annotationsForItem = annotations.filter((a: Annotation) => a.item_id === item._id)
  const isReadwise = yield select((state: RootState) => !!state.config.readwiseToken)
  if (annotationsForItem.length === 0) {
    yield put({ type: 'REMOVE_ITEM_FROM_CATEGORY', itemId: item._id, categoryId: 'annotated' })
    const categories = yield select((state: RootState) => state.categories.categories)
    const categoriesForItem = categories.filter((c: Category) => c.itemIds?.includes(item._id))
    // potential race condition: can't tell whether item has already been removed from category
    if (categoriesForItem.length === 0) {
      yield put({ type: UNSAVE_ITEM, item })
    }
  }
  if (isReadwise) {
    yield call(deleteHighlight, annotation)
  }
}
