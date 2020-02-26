import { ConfigActionTypes, REMOTE_ACTION_COMPLETED } from './types'

export interface RemoteActionQueueState {
  readonly actions: object[]
}

const initialState = {
  actions: []
}

export function remoteActionQueue (
  state = initialState, 
  action: ConfigActionTypes | any
) : RemoteActionQueueState {
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
