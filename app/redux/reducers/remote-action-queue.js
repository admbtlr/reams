const initialState = {
  actions: []
}

export function remoteActionQueue (state = initialState, action) {
  switch (action.type) {
    case 'ITEM_MARK_READ':
    case 'FEED_MARK_READ':
      return {
        ...state,
        actions: [
          ...state.actions,
          action
        ]
      }

    case 'REMOTE_ACTIONS_ACTION_COMPLETED':
      const filtered = state.actions.filter(a => a !== action.action)
      return {
        ...state,
        actions: filtered
      }
    default:
      return state
  }
}
