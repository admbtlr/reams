import { itemsSaved, initialState } from '../../store/items/items-saved'
import { UPDATE_CURRENT_INDEX, INCREMENT_INDEX, ItemType } from '../../store/items/types'
import dotenv from 'dotenv'
dotenv.config()

describe('itemsSaved reducer', () => {
  it('should handle UPDATE_CURRENT_INDEX', () => {
    const action = { type: UPDATE_CURRENT_INDEX, displayMode: ItemType.saved, index: 1 }
    const expectedState = { ...initialState, index: 1 }
    expect(itemsSaved(initialState, action)).toEqual(expectedState)
  })

  it('should handle INCREMENT_INDEX', () => {
    const action = { type: INCREMENT_INDEX }
    const expectedState = { ...initialState, index: initialState.index + 1 }
    expect(itemsSaved(initialState, action)).toEqual(expectedState)
  })

  // Add more tests for other actions
})