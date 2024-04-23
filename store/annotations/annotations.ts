import { 
  Annotation, AnnotationsState
} from "./types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../reducers";
import { 
  addAnnotation as addAnnotationSupabase,
  updateAnnotation as updateAnnotationSupabase,
  deleteAnnotation as deleteAnnotationSupabase,
  fetchAnnotations as fetchAnnotationsSupabase
} from "../../storage/supabase"
import { UNSET_BACKEND } from "../user/types";

export const createAnnotation = createAsyncThunk(
  'annotations/createAnnotation',
  async (annotation: Annotation, { getState, dispatch }): Promise<Annotation> => {
    const { config } = getState() as RootState
    if (!config.isOnline) {
      // TODO add to remote action queue
      return annotation
    } else {
      return await addAnnotationSupabase(annotation)
    }
  }
)

export const updateAnnotation = createAsyncThunk(
  'annotations/updateAnnotation',
  async (annotation: Annotation, { getState, dispatch }): Promise<Annotation> => {
    const { config } = getState() as RootState
    if (!config.isOnline) {
      // TODO add to remote action queue
      return annotation
    } else {
      return await updateAnnotationSupabase(annotation)
    }
  }
)

export const deleteAnnotation = createAsyncThunk(
  'annotations/deleteAnnotation',
  async (annotation: Annotation, { getState, dispatch }): Promise<Annotation> => {
    const { config } = getState() as RootState
    if (!config.isOnline) {
      // TODO add to remote action queue
      return annotation
    } else {
      return await deleteAnnotationSupabase(annotation)
    }
  }
)

export const fetchAnnotations = createAsyncThunk(
  'annotations/fetchAnnotations',
  async (_, { getState }): Promise<Annotation[]> => {
    console.log('fetchAnnotations')
    const { annotations } = getState() as RootState
    return await fetchAnnotationsSupabase(annotations.updatedAt)
  }
)

const initialState: AnnotationsState = {
  annotations: [],
  updatedAt: 0
}

const annotationsSlice = createSlice({
  name: 'annotations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(createAnnotation.fulfilled, (state, action) => {
      state.annotations.push(action.payload)
    })
    builder.addCase(updateAnnotation.fulfilled, (state, action) => {
      let i = state.annotations.findIndex((a: Annotation) => a._id === action.payload._id)
      state.annotations[i] = action.payload
    })
    builder.addCase(deleteAnnotation.fulfilled, (state, action) => {
      let i = state.annotations.findIndex((a: Annotation) => a._id === action.payload._id)
      state.annotations.splice(i, 1)
    })
    builder.addCase(fetchAnnotations.fulfilled, (state, action) => {
      // TODO this doesn't account for remotely deleted annotations
      action.payload.forEach((a: Annotation) => {
        let i = state.annotations.findIndex((s: Annotation) => s._id === a._id)
        if (i > -1) {
          state.annotations[i] = a
        } else {
          state.annotations.push(a)
        }
      })
      state.updatedAt = Date.now()
    })
    builder.addCase(UNSET_BACKEND, (state) => {
      state = initialState
    })
  }
})

// Extract the action creators object and the reducer
export const { actions, reducer } = annotationsSlice
// Export the reducer, either as a default or named export
const annotations = annotationsSlice.reducer
export default annotations

export const selectAnnotations = (state: RootState) => state.annotations.annotations
