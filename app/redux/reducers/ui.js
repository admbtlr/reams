const initialState = {
  viewButtonsVisible: 'false'
}

export function ui (state = initialState, action) {
  switch (action.type) {
    case 'UI_TOGGLE_VIEW_BUTTONS':
      return {
        ...state,
        viewButtonsVisible: !state.viewButtonsVisible
      }

    default:
      return state
  }
}
