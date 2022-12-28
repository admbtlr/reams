import { ConfigActionTypes, REMOTE_ACTION_COMPLETED, REMOTE_ACTION_ERRORED } from './types'
import { 
  MARK_ITEM_READ,
  MARK_ITEMS_READ 
} from '../items/types'
import { CREATE_CATEGORY, CREATE_CATEGORY_REMOTE, DELETE_CATEGORY, DELETE_CATEGORY_REMOTE, UPDATE_CATEGORY_REMOTE } from '../categories/types'

export interface RemoteAction {
  type: string
  numErrors?: number
}

export interface RemoteActionQueueState {
  readonly actions: RemoteAction[]
}

const initialState = {
  actions: []
}

export function remoteActionQueue (
  state = initialState, 
  action: ConfigActionTypes | any
) : RemoteActionQueueState {
  switch (action.type) {
    case CREATE_CATEGORY_REMOTE:
    case DELETE_CATEGORY_REMOTE:
    case UPDATE_CATEGORY_REMOTE:
    case MARK_ITEM_READ:
    case MARK_ITEMS_READ:
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
    case REMOTE_ACTION_ERRORED:
      const actions = state.actions.map((a: RemoteAction) => {
        if (a === action.action) {
          const errors = a.numErrors || 0
          if (errors > 4) {
            return null
          } else return {
            ...a,
            numErrors: errors + 1
          }
        } else {
          return a
        }
      })
      return {
        ...state,
        actions: actions.filter(a => a !== null) as RemoteAction[]
      }
      default:
      return state
  }
}
