import { 
  ConfigActionTypes,
  Direction,
  SET_BACKEND,
  UNSET_BACKEND,
  UPDATE_ONBOARDING_INDEX,
  TOGGLE_ONBOARDING,
  ITEMS_ONBOARDING_DONE,
  FEED_ONBOARDING_DONE,
  SET_LAST_UPDATED,
  SET_FEED_FILTER,
  IS_ONLINE,
  SET_ITEM_SORT,
  SET_SHOW_NUM_UNREAD,
  SET_ORIENTATION,
} from "./types"
import { 
  FeedActionTypes,
  REMOVE_FEED 
} from "../feeds/types"
import { Dimensions } from "react-native"

export interface ConfigState {
  readonly backend: string
  readonly accessToken: string
  readonly isOnboarding: boolean
  readonly lastUpdated: number
  readonly onboardingIndex: number
  readonly onboardingLength: number
  readonly feedFilter: string | null
  readonly isOnline: boolean
  readonly orientation: string
  readonly itemSort: Direction
  readonly showNumUnread: boolean
  readonly isItemsOnboardingDone: boolean
  readonly isFeedOnboardingDone: boolean
}

const {width, height } = Dimensions.get('window')

const initialState = {
  backend: '',
  accessToken: '',
  isOnboarding: true,
  lastUpdated: 0,
  onboardingIndex: 0,
  onboardingLength: 13,
  feedFilter: null,
  isOnline: false,
  orientation: height > width ? 'portrait' : 'landscape',
  itemSort: Direction.forwards,
  showNumUnread: true,
  isItemsOnboardingDone: true,
  isFeedOnboardingDone: false
}

export function config (
  state = initialState, 
  action: ConfigActionTypes | FeedActionTypes
) : ConfigState {
  switch (action.type) {
    case SET_BACKEND:
      const {
        backend,
        credentials
      } = action
      return {
        ...state,
        backend,
        ...credentials
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

    case SET_FEED_FILTER:
      return {
        ...state,
        feedFilter: action.feedFilter
      }

    case REMOVE_FEED:
      return {
        ...state,
        feedFilter: null
      }

    case IS_ONLINE:
      return {
        ...state,
        isOnline: action.isOnline
      }

    case SET_ORIENTATION:
      return {
        ...state,
        orientation: action.orientation
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
