const initialState = {
  backend: 'rizzle'
}

export function config (state = initialState, action) {
  switch (action.type) {
    case 'CONFIG_SET_BACKEND':
      return {
        config: [
          ...state.config,
          backend: action.backend
        ]
      }

    default:
      return state
  }
}
