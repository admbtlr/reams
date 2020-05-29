import { 
  ConfigActionTypes,
  Direction,
  SET_BACKEND,
  UNSET_BACKEND,
  UPDATE_ONBOARDING_INDEX,
  TOGGLE_ONBOARDING,
  ITEMS_ONBOARDING_DONE,
  FEED_ONBOARDING_DONE,
  TOGGLE_FIRST_TIME,
  SET_LAST_UPDATED,
  SET_FEED_FILTER,
  IS_ONLINE,
  SET_ITEM_SORT,
  SET_SHOW_NUM_UNREAD
} from "./types"

export interface ConfigState {
  readonly backend: string
  readonly accessToken: string
  readonly isFirstTime: boolean
  readonly isOnboarding: boolean
  readonly lastUpdated: number
  readonly onboardingIndex: number
  readonly onboardingLength: number
  readonly feedFilter: string | null
  readonly isOnline: boolean
  readonly itemSort: Direction
  readonly showNumUnread: boolean
  readonly isItemsOnboardingDone: boolean
  readonly isFeedOnboardingDone: boolean
}

const initialState = {
  backend: 'basic',
  accessToken: '',
  isFirstTime: true,
  isOnboarding: true,
  lastUpdated: 0,
  onboardingIndex: 0,
  onboardingLength: 13,
  feedFilter: null,
  isOnline: false,
  itemSort: Direction.forwards,
  showNumUnread: true,
  isItemsOnboardingDone: true,
  isFeedOnboardingDone: false
}

export function config (
  state = initialState, 
  action: ConfigActionTypes
) : ConfigState {
  switch (action.type) {
    case SET_BACKEND:
      const {
        backend
      } = action
      return {
        ...state,
        backend
      }

    case UNSET_BACKEND:
      return {
        ...state,
        backend: ''
      }

    case UPDATE_ONBOARDING_INDEX:
      const isOnboarding = (action.index < state.onboardingLength)
      return {
        ...state,
        isOnboarding,
        onboardingIndex: action.index
      }

    case TOGGLE_ONBOARDING:
      return {
        ...state,
        isOnboarding: action.isOnboarding
      }

    case ITEMS_ONBOARDING_DONE:
      return {
        ...state,
        isItemsOnboardingDone: true
      }

    case FEED_ONBOARDING_DONE:
      return {
        ...state,
        isFeedOnboardingDone: true
      }

    case TOGGLE_FIRST_TIME:
      return {
        ...state,
        isFirstTime: action.isFirstTime
      }

    case SET_FEED_FILTER:
      return {
        ...state,
        feedFilter: action.feedFilter
      }

    case IS_ONLINE:
      return {
        ...state,
        isOnline: action.isOnline
      }

    case SET_ITEM_SORT:
      return {
        ...state,
        itemSort: action.itemSort
      }

    case SET_SHOW_NUM_UNREAD:
      return {
        ...state,
        showNumUnread: action.showNumUnread
      }

    default:
      return state
  }
}
