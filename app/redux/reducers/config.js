const initialState = {
  backend: 'rizzle',
  isOnboarding: true,
  onboardingIndex: 0,
  onboardingLength: 13
}

export function config (state = initialState, action) {
  switch (action.type) {
    case 'CONFIG_SET_BACKEND':
      return {
        ...state,
        backend: action.backend
      }

    case 'CONFIG_UPDATE_ONBOARDING_INDEX':
      const isOnboarding = (action.index < state.onboardingLength)
      return {
        ...state,
        isOnboarding,
        onboardingIndex: action.index
      }

    case 'CONFIG_TOGGLE_ONBOARDING':
      return {
        ...state,
        isOnboarding: action.isOnboarding
      }

    default:
      return state
  }
}
