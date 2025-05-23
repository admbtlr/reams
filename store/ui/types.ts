import RizzleModal from "../../components/RizzleModal"

export interface ToolbarState {
}

interface ModalProps {
  modalText: string | {
    text: string,
    style: string[]
  }[]
  modalHideCancel?: boolean
  modalOnOk?: () => void
  modalOnCancel?: () => void
  modalShow?: boolean
}

interface Message {
  messageString: string
  isSelfDestruct?: boolean
}

export enum DarkModeSetting {
  AUTO = 2,
  ON = 1,
  OFF = 0
}

export interface UIState {
  readonly darkModeSetting: DarkModeSetting
  readonly displayedHelpTips: string[]
  readonly fontSize: number
  readonly helpTipKey: string
  readonly hiddenModals: any[]
  readonly imageViewerUrl: string
  readonly imageViewerVisible: boolean
  readonly isActive: boolean
  readonly isDarkMode: boolean
  readonly isHelpTipVisible: boolean
  readonly itemButtonsVisible: boolean
  readonly message: string
  readonly messageQueue: Message[]
  readonly showButtonLabels: boolean
  readonly showLoadingAnimation: boolean
  readonly viewButtonsVisible: boolean
}

export const TOGGLE_VIEW_BUTTONS = 'TOGGLE_VIEW_BUTTONS'
export const SHOW_VIEW_BUTTONS = 'SHOW_VIEW_BUTTONS'
export const SHOW_ITEM_BUTTONS = 'SHOW_ITEM_BUTTONS'
export const HIDE_ALL_BUTTONS = 'HIDE_ALL_BUTTONS'
export const HIDE_LOADING_ANIMATION = 'HIDE_LOADING_ANIMATION'
export const SHOW_IMAGE_VIEWER = 'SHOW_IMAGE_VIEWER'
export const HIDE_IMAGE_VIEWER = 'HIDE_IMAGE_VIEWER'
export const FETCH_ITEMS = 'FETCH_ITEMS'
export const FETCH_DATA_SUCCESS = 'FETCH_DATA_SUCCESS'
export const SET_DARK_MODE = 'SET_DARK_MODE'
export const SET_DARK_MODE_SETTING = 'SET_DARK_MODE_SETTING'
export const TOGGLE_DARK_MODE = 'TOGGLE_DARK_MODE'
export const TOGGLE_BUTTON_LABELS = 'TOGGLE_BUTTON_LABELS'
export const SET_BUTTON_LABELS = 'SET_BUTTON_LABELS'
export const INCREASE_FONT_SIZE = 'INCREASE_FONT_SIZE'
export const DECREASE_FONT_SIZE = 'DECREASE_FONT_SIZE'
export const SET_FONT_SIZE = 'SET_FONT_SIZE'
export const ITEMS_SCREEN_BLUR = 'ITEMS_SCREEN_BLUR'
export const ITEMS_SCREEN_FOCUS = 'ITEMS_SCREEN_FOCUS'
export const SET_MESSAGE = 'SET_MESSAGE'
export const ADD_MESSAGE = 'ADD_MESSAGE'
export const REMOVE_MESSAGE = 'REMOVE_MESSAGE'
export const CLEAR_MESSAGES = 'CLEAR_MESSAGES'
export const SHOW_HELPTIP = 'SHOW_HELPTIP'
export const HIDE_HELPTIP = 'HIDE_HELPTIP'

interface toggleViewButtonsAction {
  type: typeof TOGGLE_VIEW_BUTTONS
}

interface showViewButtonsAction {
  type: typeof SHOW_VIEW_BUTTONS
}

interface showItemButtonsAction {
  type: typeof SHOW_ITEM_BUTTONS
}

interface hideAllButtonsAction {
  type: typeof HIDE_ALL_BUTTONS
}

interface hideLoadingAnimationAction {
  type: typeof HIDE_LOADING_ANIMATION
}

interface showImageViewerAction {
  type: typeof SHOW_IMAGE_VIEWER
  url: string
}

interface hideImageViewerAction {
  type: typeof HIDE_IMAGE_VIEWER
}

interface fetchDataSuccessAction {
  type: typeof FETCH_DATA_SUCCESS
}

interface setDarkModeAction {
  type: typeof SET_DARK_MODE
  isDarkMode: boolean
}

interface toggleDarkModeAction {
  type: typeof TOGGLE_DARK_MODE
}

interface toggleButtonLabelsAction {
  type: typeof TOGGLE_BUTTON_LABELS
}

interface setButtonLabelsAction {
  type: typeof SET_BUTTON_LABELS
  showButtonLabels: boolean
}

interface setDarkModeSettingAction {
  type: typeof SET_DARK_MODE_SETTING
  darkModeSetting: DarkModeSetting
}

interface increaseFontSizeAction {
  type: typeof INCREASE_FONT_SIZE
}

interface decreaseFontSizeAction {
  type: typeof DECREASE_FONT_SIZE
}

interface setFontSizeAction {
  type: typeof SET_FONT_SIZE
  fontSize: number
}

interface setMessageAction {
  type: typeof SET_MESSAGE
  message: string
}

interface addMessageAction {
  type: typeof ADD_MESSAGE
  message: Message
}

interface removeMessageAction {
  type: typeof REMOVE_MESSAGE
  messageString: string
}

interface clearMessagesAction {
  type: typeof CLEAR_MESSAGES
}

interface showHelpTipAction {
  type: typeof SHOW_HELPTIP
  key: string
}

interface hideHelpTipAction {
  type: typeof HIDE_HELPTIP
}


export type UIActionTypes = toggleViewButtonsAction |
  showViewButtonsAction |
  showItemButtonsAction |
  hideAllButtonsAction |
  hideLoadingAnimationAction |
  showImageViewerAction |
  hideImageViewerAction |
  fetchDataSuccessAction |
  setDarkModeAction |
  toggleDarkModeAction |
  toggleButtonLabelsAction |
  setButtonLabelsAction |
  setDarkModeSettingAction |
  increaseFontSizeAction |
  decreaseFontSizeAction |
  setFontSizeAction |
  setMessageAction |
  addMessageAction |
  removeMessageAction |
  clearMessagesAction |
  showHelpTipAction |
  hideHelpTipAction
