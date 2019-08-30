import { REHYDRATE } from 'redux-persist'

export const initialState = {
  display: 'unread', // currently 'unread' || 'saved'
  decoratedCount: 0
}

export function itemsMeta (state = initialState, action) {
  let newState = {}

  switch (action.type) {

    case REHYDRATE:
      console.log('Rehydrated!')

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

