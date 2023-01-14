export interface Annotation {
  _id?: string
  text: string
  serialized: string
  url?: string
  item_id?: string
  note?: string
  created_at?: number
}

export interface AnnotationsState {
  readonly annotations: Annotation[]
}

export const ADD_ANNOTATION = 'ADD_ANNOTATION'
export const EDIT_ANNOTATION = 'EDIT_ANNOTATION'
export const DELETE_ANNOTATION = 'DELETE_ANNOTATION'


interface addAnnotationAction {
  type: typeof ADD_ANNOTATION
  annotation: Annotation
}

interface editAnnotationAction {
  type: typeof EDIT_ANNOTATION
  annotation: Annotation
}

interface deleteAnnotationAction {
  type: typeof DELETE_ANNOTATION
  annotation: Annotation
}

export type AnnotationsActionTypes = addAnnotationAction |
  editAnnotationAction |
  deleteAnnotationAction