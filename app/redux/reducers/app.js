const initialState = {
  appState: 'inactive'
}

export function app (state = initialState, action) {
  switch (action.type) {
    case 'APP_STATE_CHANGED':
      return {
        appState: action.appState
      }

    default:
      return state
  }
}
