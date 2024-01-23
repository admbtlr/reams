import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../../store/reducers"
import { pgTimestamp } from "../../utils"
import { Annotation, AnnotationsState } from "../../store/annotations/types"
import mockedSupabase from "../../__mocks__/supabase"
import { createAnnotation } from "../../store/annotations/annotations"
import dotenv from 'dotenv'
dotenv.config()

describe('annotations reducer', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should handle createAnnotation', async () => {
    const mockAnnotation: Annotation = {
      // fill with mock data
    }

    const mockState: RootState = {
      // fill with mock data
    }

    mockedSupabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: '1' } } } })
    mockedSupabase.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: null })
    })

    const result = await createAnnotation(mockAnnotation, { getState: () => mockState, dispatch: jest.fn() })

    expect(result).toEqual(mockAnnotation)
    expect(mockedSupabase.auth.getSession).toBeCalledTimes(1)
    expect(mockedSupabase.from).toBeCalledWith('Annotation')
  })

  // Add more tests for other actions
})