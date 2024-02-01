import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../../store/reducers"
import { pgTimestamp } from "../../utils"
import { Annotation, AnnotationsState } from "../../store/annotations/types"
import mockedSupabase, { mockReturnValue } from "../../__mocks__/supabase"
import state from "../../__mocks__/state"
import { createAnnotation } from "../../store/annotations/annotations"
import dotenv from 'dotenv'
import { PostgrestFilterBuilder } from "@supabase/postgrest-js"
import { GetResult } from "@supabase/postgrest-js/dist/module/select-query-parser"
import { supabase } from "../../storage/supabase"
dotenv.config()

describe('annotations reducer', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should handle createAnnotation', async () => {
    const mockAnnotation: Annotation = {
      _id: '1',
      text: 'test',
      serialized: 'test',
    }

    const mockState: RootState = {
      ...state,
      annotations: {
        annotations: [mockAnnotation]
      },
    }

    jest.mock('supabase')
    jest
      .spyOn(supabase.auth, "getSession")
      .mockResolvedValueOnce({ data: { session: null }, error: null });

    jest.spyOn(supabase.from('Annotation'), 'insert')
      .mockReturnValue({
        //@ts-ignore
        data: [mockAnnotation], 
        error: null 
      })

    const result = await createAnnotation(mockAnnotation)

    expect(result).toEqual(mockAnnotation)
    expect(supabase.auth.getSession).toHaveBeenCalledTimes(1)
    expect(supabase.from).toHaveBeenCalledWith('Annotation')
  })

  // Add more tests for other actions
})