import { 
  HostColor, HostColorsState
} from "./types";
import { RootState } from "../reducers";
import { createSlice } from "@reduxjs/toolkit";

const initialState:HostColorsState = {
  hostColors: []
}

const hostColorsSlice = createSlice({
  name: 'hostColors',
  initialState,
  reducers: {
    createHostColor(state, action) {
      if (state.hostColors.find(hc => hc.host === action.payload.host) === undefined) {
        state.hostColors.push(action.payload)
      }
    },
    updateHostColor(state, action) {
      const hc = state.hostColors.find(hc => hc.host === action.payload.host)
      if (hc !== undefined) {
        hc.color = action.payload.color
      }
    },
    deleteHostColor(state, action) {
      state.hostColors = state.hostColors.filter(hc => hc.host !== action.payload.host)
    } 
  }
})

// Extract the action creators object and the reducer
export const { actions, reducer } = hostColorsSlice
// Export the reducer, either as a default or named export
const hostColors = hostColorsSlice.reducer
export default hostColors

export const selectHostColors = (state: RootState) => state.hostColors.hostColors
