import { REMOTE_ACTION_COMPLETED } from './types'

const initialState = {
  actions: []
}

export function remoteActionQueue (state = initialState, action) {
  switch (action.type) {
    case 'ITEM_MARK_READ':
    case 'ITEMS_MARK_READ':
      return {
        ...state,
        actions: [
          ...state.actions,
          action
        ]
      }

    case REMOTE_ACTION_COMPLETED:
      const filtered = state.actions.filter(a => a !== action.action)
      return {
        ...state,
        actions: filtered
      }
    default:
      return state
  }
}
