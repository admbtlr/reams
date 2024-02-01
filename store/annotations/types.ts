export interface Annotation {
  _id: string
  text: string
  serialized: string
  url?: string | null
  item_id?: string | null
  note?: string | null
  created_at?: string
  remote_id?: string
}

export interface AnnotationsState {
  readonly annotations: Annotation[]
  updatedAt?: number
}

interface createAnnotationAction {
  type: 'createAnnotation'
  annotation: Annotation
}

interface updateAnnotationAction {
  type: 'updateAnnotation'
  payload: Annotation
}

interface deleteAnnotationAction {
  type: 'deleteAnnotation'
  annotation: Annotation
}

export type AnnotationsActionTypes = createAnnotationAction |
  updateAnnotationAction |
  deleteAnnotationAction