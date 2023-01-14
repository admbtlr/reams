import { 
  ADD_ANNOTATION,
  DELETE_ANNOTATION,
  EDIT_ANNOTATION,
  AnnotationsActionTypes, 
  AnnotationsState, 
  Annotation
} from "./types";

const initialState:AnnotationsState = {
  annotations: []
}

export function annotations (
  state = initialState, 
  action: AnnotationsActionTypes
) {
  switch (action.type) {
    case ADD_ANNOTATION:
      return {
        ...state,
        annotations: [
          ...state.annotations,
          action.annotation
        ]
      }
    case EDIT_ANNOTATION:
      return {
        ...state,
        annotations: state.annotations.map(annotation => {
          if (annotation._id === action.annotation._id) {
            return action.annotation
          }
          return annotation
        })
      }
    case DELETE_ANNOTATION:
      return {
        ...state,
        annotations: state.annotations.filter((a: Annotation) => a._id !== action.annotation._id)
      }
    default:
      return state
  }
}  
