import { deleteCategory } from "store/categories/types"
import { Filter } from "./config"

export enum Direction {
  forwards, 
  backwards
}

// config
export const SET_BACKEND = 'SET_BACKEND'
export const UNSET_BACKEND = 'UNSET_BACKEND'
export const SET_READWISE_TOKEN = 'SET_READWISE_TOKEN'
export const UPDATE_ONBOARDING_INDEX = 'UPDATE_ONBOARDING_INDEX'
export const TOGGLE_ONBOARDING = 'TOGGLE_ONBOARDING'
export const ITEMS_ONBOARDING_DONE = 'ITEMS_ONBOARDING_DONE'
export const FEED_ONBOARDING_DONE = 'FEED_ONBOARDING_DONE'
export const SET_LAST_UPDATED = 'SET_LAST_UPDATED'
export const SET_FILTER = 'SET_FILTER'
export const IS_ONLINE = 'IS_ONLINE'
export const SET_ORIENTATION = 'SET_ORIENTATION'
export const SET_ITEM_SORT = 'SET_ITEM_SORT'
export const SET_SHOW_NUM_UNREAD = 'SET_SHOW_NUM_UNREAD'
export const STATE_ACTIVE = 'STATE_ACTIVE'
export const STATE_INACTIVE = 'STATE_INACTIVE'

// remote action queue
export const REMOTE_ACTION_COMPLETED = 'REMOTE_ACTION_COMPLETED'
export const REMOTE_ACTION_ERRORED = 'REMOTE_ACTION_ERRORED'

// user
export const SET_UID = 'SET_UID'
export const SET_USER_DETAILS = 'SET_USER_DETAILS'
export const SET_SIGN_IN_EMAIL = 'SET_SIGN_IN_EMAIL'

interface setBackendAction {
  type: typeof SET_BACKEND
  backend: string,
  credentials: object | null
}

interface unsetBackendAction {
  type: typeof UNSET_BACKEND
}

interface setReadwiseTokenAction {
  type: typeof SET_READWISE_TOKEN
  token: string
}

interface updateOnboardingInxeAction {
  type: typeof UPDATE_ONBOARDING_INDEX
  index: number
}

interface toggleOnboardingAction {
  type: typeof TOGGLE_ONBOARDING
  isOnboarding: boolean
}

interface itemsOnboardingDoneAction {
  type: typeof ITEMS_ONBOARDING_DONE
}

interface feedOnboardingDoneAction {
  type: typeof FEED_ONBOARDING_DONE
}

interface setFilterAction {
  type: typeof SET_FILTER
  filter: Filter | null
}

interface isOnlineAction {
  type: typeof IS_ONLINE
  isOnline: boolean
}

interface setOrientationAction {
  type: typeof SET_ORIENTATION
  orientation: string
}

interface setItemSortAction {
  type: typeof SET_ITEM_SORT
  itemSort: Direction
}

interface setShowNumUnreadAction {
  type: typeof SET_SHOW_NUM_UNREAD
  showNumUnread: boolean
}

interface remoteActionCompletedAction {
  type: typeof REMOTE_ACTION_COMPLETED
  action: object
}

interface remoteActionErroredAction {
  type: typeof REMOTE_ACTION_ERRORED
  action: object
}

interface setUidAction {
  type: typeof SET_UID
  uid: string
}

interface setUserDetailsAction {
  type: typeof SET_USER_DETAILS
  details: object
}

interface setSignInEmailAction {
  type: typeof SET_SIGN_IN_EMAIL
  email: string
}

interface setStateActiveAction {
  type: typeof STATE_ACTIVE
  time: number
}

export type ConfigActionTypes = setBackendAction |
  unsetBackendAction |
  setReadwiseTokenAction |
  updateOnboardingInxeAction |
  toggleOnboardingAction |
  itemsOnboardingDoneAction |
  feedOnboardingDoneAction |
  setFilterAction |
  isOnlineAction |
  setOrientationAction |
  setItemSortAction |
  setShowNumUnreadAction |
  remoteActionCompletedAction |
  setUidAction |
  setUserDetailsAction |
  setSignInEmailAction |
  setStateActiveAction |
  deleteCategory
