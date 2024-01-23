import { deleteCategory } from "store/categories/types"
import { Filter } from "./config"

export enum Direction {
  desc,
  asc,
  rnd
}

// config
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
export const SET_MIGRATION_VERSION = 'SET_MIGRATION_VERSION'

// this is just used to kick off sagas
export const START_DOWNLOADS = 'START_DOWNLOADS'

// remote action queue
export const REMOTE_ACTION_COMPLETED = 'REMOTE_ACTION_COMPLETED'
export const REMOTE_ACTION_ERRORED = 'REMOTE_ACTION_ERRORED'

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

interface setStateActiveAction {
  type: typeof STATE_ACTIVE
  time: number
}

interface updateMigrationVersionAction {
  type: typeof SET_MIGRATION_VERSION
  version: number
}

export type ConfigActionTypes = updateOnboardingInxeAction |
  toggleOnboardingAction |
  itemsOnboardingDoneAction |
  feedOnboardingDoneAction |
  setFilterAction |
  isOnlineAction |
  setOrientationAction |
  setItemSortAction |
  setShowNumUnreadAction |
  remoteActionCompletedAction |
  setStateActiveAction |
  deleteCategory |
  updateMigrationVersionAction
