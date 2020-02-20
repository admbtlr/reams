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
          ? 'Loading Stories' + (action.numItems
            ? ` (${action.numItems})`
            : '')
          : ''
      }
    // case 'SCROLL_HANDLER_ATTACHED': {
    //   return {
    //     ...state,
    //     scrollOwner: action.owner
    //   }
    // }

    default:
      return state
  }
}
