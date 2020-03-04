const initialState = {
  isVisible: true,
  message: '',
  // scrollOwner: null,
  scrollDiff: 0
}

export function toolbar (state = initialState, action) {
  switch (action.type) {
    case 'ITEMS_IS_LOADING':
      return {
        ...state,
        message: action.isLoading
          ? 'Loading stories' + (action.numItems
            ? ` (${action.numItems})`
            : '')
          : ''
      }

    default:
      return state
  }
}
