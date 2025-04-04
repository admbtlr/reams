import { 
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
  SET_MIGRATION_VERSION,
  SET_SEARCH_TERM 
} from "./types"
import type {
  ConfigActionTypes
} from './types'
import {
  UNSET_BACKEND,
} from '../user/types'
import type { UserActionTypes } from '../user/types'
import type { 
  FeedActionTypes,
} from "../feeds/types"
import { REMOVE_FEED } from "../feeds/types"
import { Dimensions } from "react-native"
import { DELETE_CATEGORY } from "../categories/types"

export interface Filter {
  title?: string,
  type: 'category' | 'feed' | 'newsletter' | 'search',
  _id?: string
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

export const initialState: ConfigState = {
  filter: null,
  isItemsOnboardingDone: true,
  isFeedOnboardingDone: false,
  isOnboarding: true,
  isOnline: false,
  itemSort: Direction.desc,
  lastActivated: 0,
  lastUpdated: 0,
  migrationVersion: 2,
  onboardingIndex: 0,
  onboardingLength: 13,
  orientation: height > width ? 'portrait' : 'landscape',
  showNumUnread: true,
}

export function config (
  // biome-ignore lint/style/useDefaultParameterLast: <explanation>
  state: ConfigState = initialState, 
  action: ConfigActionTypes | FeedActionTypes | UserActionTypes
) : ConfigState {
  switch (action.type) {
    case UNSET_BACKEND:
      if (action.backend === 'reams') {
        return {
          ...state
        }
      }
      return state

    case UPDATE_ONBOARDING_INDEX: {
      const isOnboarding = (action.index < state.onboardingLength)
      return {
        ...state,
        isOnboarding,
        onboardingIndex: action.index
      }
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
      if (state.filter !== null && state.filter._id === action.category._id) {
        return {
          ...state,
          filter: null
        }
      }
      return state

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

    case SET_SEARCH_TERM: {
      return {
        ...state,
        filter: {
          type: 'search',
          title: action.term
        }
      }
    }

    default:
      return state
  }
}
