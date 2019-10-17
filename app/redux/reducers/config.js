const initialState = {
  backend: '',
  accessToken: '',
  isFirstTime: true,
  isOnboarding: true,
  lastUpdated: 0,
  onboardingIndex: 0,
  onboardingLength: 13,
  feedFilter: null,
  isOnline: false,
  itemSort: 'forewards',
  setShowNumUnread: true
}

export function config (state = initialState, action) {
  switch (action.type) {
    case 'CONFIG_SET_BACKEND':
      return {
        ...state,
        backend: action.backend,
        accessToken: action.accessToken
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

    case 'CONFIG_SET_ITEM_SORT':
      return {
        ...state,
        itemSort: action.itemSort
      }

    case 'CONFIG_SET_SHOW_NUM_UNREAD':
      return {
        ...state,
        showNumUnread: action.showNumUnread
      }

    default:
      return state
  }
}
