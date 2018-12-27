import { REHYDRATE } from 'redux-persist'

export const initialState = {
  index: 0,
  savedIndex: 0,
  display: 'unread', // currently 'unread' || 'saved'
  decoratedCount: 0,
  unreadCount: 0
}

export function itemsMeta (state = initialState, action) {
  let newState = {}

  switch (action.type) {

    case REHYDRATE:
      console.log('Rehydrated!')

    case 'ITEMS_UPDATE_CURRENT_INDEX':
      if (state.display === 'unread') {
        newState.index = action.index
      } else {
        newState.savedIndex = action.index
      }
      return {
        ...state,
        ...newState
      }

    case 'ITEMS_META_SET_UNREAD_COUNT':
      return {
        ...state,
        unreadCount: action.unreadCount
      }

    case 'ITEM_DECORATION_PROGRESS':
      return {
        ...state,
        decoratedCount: action.decoratedCount
      }

    case 'TOGGLE_DISPLAYED_ITEMS':
      const display = state.display === 'unread' ? 'saved' : 'unread'
      return {
        ...state,
        display
      }

    default:
      return state
  }
}

