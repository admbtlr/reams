const initialState = {
  backend: 'feedwrangler',
  isFirstTime: true,
  isOnboarding: false,
  lastUpdated: 0,
  onboardingIndex: 0,
  onboardingLength: 13,
  feedFilter: null,
  isOnline: false
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

    case 'CONFIG_TOGGLE_FIRST_TIME':
      return {
        ...state,
        isFirstTime: action.isFirstTime
      }

    case 'CONFIG_SET_LAST_UPDATED':
      return {
        ...state,
        lastUpdated: action.lastUpdated
      }

    case 'CONFIG_SET_FEED_FILTER':
      return {
        ...state,
        feedFilter: action.feedFilter
      }

    case 'CONFIG_IS_ONLINE':
      return {
        ...state,
        isOnline: action.isOnline
      }

    default:
      return state
  }
}
