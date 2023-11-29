import { 
  ConfigActionTypes,
  Direction,
  UPDATE_ONBOARDING_INDEX,
  TOGGLE_ONBOARDING,
  ITEMS_ONBOARDING_DONE,
  FEED_ONBOARDING_DONE,
  SET_LAST_UPDATED,
  SET_FILTER,
  IS_ONLINE,
  SET_ITEM_SORT,
  SET_SHOW_NUM_UNREAD,
  SET_ORIENTATION,
  STATE_ACTIVE,
  SET_MIGRATION_VERSION
} from "./types"
import {
  UNSET_BACKEND,
  UserActionTypes
} from '../user/types'
import { 
  FeedActionTypes,
  REMOVE_FEED 
} from "../feeds/types"
import { Dimensions } from "react-native"
import { DELETE_CATEGORY } from "../categories/types"
import { id } from "../../utils"

export interface Filter {
  title?: string,
  type: string,
  _id: string
}

export interface ConfigState {
  readonly isOnboarding: boolean
  readonly lastUpdated: number
  readonly onboardingIndex: number
  readonly onboardingLength: number
  readonly filter: Filter | null
  readonly isOnline: boolean
  readonly orientation: string
  readonly itemSort: Direction
  readonly showNumUnread: boolean
  readonly isItemsOnboardingDone: boolean
  readonly isFeedOnboardingDone: boolean
  readonly lastActivated: number
  readonly migrationVersion?: number
}

const {width, height } = Dimensions.get('window')

export const initialState = {
  isOnboarding: true,
  lastUpdated: 0,
  onboardingIndex: 0,
  onboardingLength: 13,
  filter: null,
  isOnline: false,
  orientation: height > width ? 'portrait' : 'landscape',
  itemSort: Direction.desc,
  showNumUnread: true,
  isItemsOnboardingDone: true,
  isFeedOnboardingDone: false,
  lastActivated: 0
}

let extras

export function config (
  state = initialState, 
  action: ConfigActionTypes | FeedActionTypes | UserActionTypes
) : ConfigState {
  switch (action.type) {
    case UNSET_BACKEND:
      if (action.backend === 'reams') {
        return {
          ...state,
          isOnboarding: true,
        }
      } else {
        return state
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

    case SET_FILTER:
      return {
        ...state,
        filter: action.filter
      }

    case DELETE_CATEGORY:
      if (state.filter !== null && state.filter._id === action._id) {
        return {
          ...state,
          filter: null
        }
      }

    case REMOVE_FEED:
      return {
        ...state,
        filter: null
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

    case STATE_ACTIVE: {
      return {
        ...state,
        lastActivated: action.time
      }
    }
    
    case SET_MIGRATION_VERSION: {
      return {
        ...state,
        migrationVersion: action.version
      }
    }

    default:
      return state
  }
}
