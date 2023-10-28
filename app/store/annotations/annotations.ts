import { 
  Annotation, AnnotationsState
} from "./types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../reducers";
import { supabase } from "../../storage/supabase";
import { pgTimestamp } from "../../utils";

export const createAnnotation = createAsyncThunk(
  'annotations/createAnnotation',
  async (annotation: Annotation, { getState, dispatch }): Promise<Annotation> => {
    const { config } = getState() as RootState
    if (!config.isOnline) {
      // TODO add to remote action queue
      return annotation
    } else {
      const { data } = await supabase.auth.getSession()
      const { error } = await supabase.from('Annotation').insert({
        ...annotation,
        updated_at: pgTimestamp(),
        user_id: data?.session?.user?.id
      })
      if (error) throw error
      return annotation
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
      const { data } = await supabase.auth.getSession()
      const { error } = await supabase.from('Annotation').update({
        ...annotation,
        updated_at: pgTimestamp(),
        user_id: data?.session?.user?.id
      }).eq('_id', annotation._id)
      if (error) throw error
      return annotation
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
      const { error } = await supabase.from('Annotation')
        .delete()
        .eq('_id', annotation._id)
      if (error) throw error
      return annotation
    }
  }
)

export const fetchAnnotations = createAsyncThunk(
  'annotations/fetchAnnotations',
  async (_, { getState }): Promise<Annotation[]> => {
    console.log('fetchAnnotations')
    const { annotations } = getState() as RootState
    const lastUpdated = pgTimestamp(new Date(annotations.updatedAt || 0))
    const { data, error } = await supabase.from('Annotation').select('*').gte('updated_at', lastUpdated)
    if (error) throw error
    return data
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
  }
})

// Extract the action creators object and the reducer
export const { actions, reducer } = annotationsSlice
// Export the reducer, either as a default or named export
const annotations = annotationsSlice.reducer
export default annotations

export const selectAnnotations = (state: RootState) => state.annotations.annotations
