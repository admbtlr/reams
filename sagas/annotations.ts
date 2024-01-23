import { call, put, select } from 'redux-saga/effects'
import { Item, UNSAVE_ITEM } from '../store/items/types'
import { Annotation } from '../store/annotations/types'
import { RootState } from '../store/reducers'
import { Category } from '../store/categories/types'
import { createHighlight, deleteHighlight, updateHighlight } from '../backends/readwise'

function * hasReadwiseBackend () {
  const isReadwise: boolean =  yield select((state: RootState) => !!state.user.backends.find(b => b.name === 'readwise')) 
  return isReadwise
}

export function * createAnnotation ({ payload }: { payload: Annotation } ): any {
  const isReadwise = yield hasReadwiseBackend()
  if (isReadwise) {
    const readwiseResponse = yield call(createHighlight, payload)
    const remoteId = readwiseResponse.modified_highlights[0]
    yield put({ type: 'annotations/updateAnnotation', annotation: { ...payload, remote_id: remoteId }, skipRemote: true })
  }
}

export function * updateAnnotation ({ annotation }: { annotation: Annotation }, skipRemote?: Boolean ): any {
  const isReadwise = yield hasReadwiseBackend()
  if (isReadwise && !skipRemote) {
    yield call(updateHighlight, annotation)
  }
}

export function * deleteAnnotation ({ annotation }: { annotation: Annotation } ): any {
  const annotations = yield select((state: RootState) => state.annotations)
  const item: Item = yield select((state: RootState) => state.itemsSaved.items.find((i: Item) => i._id === annotation.item_id))
  const annotationsForItem = annotations.filter((a: Annotation) => a.item_id === item._id)
  const isReadwise = yield hasReadwiseBackend()
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
