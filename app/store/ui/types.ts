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

export interface UIState {
  readonly viewButtonsVisible: boolean
  readonly itemButtonsVisible: boolean
  readonly modalVisible: boolean
  readonly modalProps: object
  readonly showLoadingAnimation: boolean
  readonly imageViewerVisible: boolean
  readonly imageViewerUrl: string
  readonly isDarkMode: boolean
  readonly hiddenModals: string[]
  readonly message: string
  readonly messageQueue: Message[]
  readonly fontSize: number
  readonly isActive: boolean
  readonly isHelpTipVisible: boolean
  readonly helpTipKey: string
  readonly displayedHelpTips: string[]

}

export const TOGGLE_VIEW_BUTTONS = 'TOGGLE_VIEW_BUTTONS'
export const SHOW_VIEW_BUTTONS = 'SHOW_VIEW_BUTTONS'
export const SHOW_ITEM_BUTTONS = 'SHOW_ITEM_BUTTONS'
export const HIDE_ALL_BUTTONS = 'HIDE_ALL_BUTTONS'
export const SHOW_MODAL = 'SHOW_MODAL'
export const HIDE_MODAL = 'HIDE_MODAL'
export const HIDE_LOADING_ANIMATION = 'HIDE_LOADING_ANIMATION'
export const SHOW_IMAGE_VIEWER = 'SHOW_IMAGE_VIEWER'
export const HIDE_IMAGE_VIEWER = 'HIDE_IMAGE_VIEWER'
export const TOGGLE_HIDE_MODAL = 'TOGGLE_HIDE_MODAL'
export const FETCH_ITEMS = 'FETCH_ITEMS'
export const FETCH_DATA_SUCCESS = 'FETCH_DATA_SUCCESS'
export const SET_DARK_MODE = 'SET_DARK_MODE'
export const TOGGLE_DARK_MODE = 'TOGGLE_DARK_MODE'
export const INCREASE_FONT_SIZE = 'INCREASE_FONT_SIZE'
export const DECREASE_FONT_SIZE = 'DECREASE_FONT_SIZE'
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

interface showModalAction {
  type: typeof SHOW_MODAL
  modalProps: ModalProps
}

interface hideModalAction {
  type: typeof HIDE_MODAL
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

interface toggleHideModalAction {
  type: typeof TOGGLE_HIDE_MODAL
  modalName: string
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

interface increaseFontSizeAction {
  type: typeof INCREASE_FONT_SIZE
}

interface decreaseFontSizeAction {
  type: typeof DECREASE_FONT_SIZE
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
  showModalAction |
  hideModalAction |
  hideLoadingAnimationAction |
  showImageViewerAction |
  hideImageViewerAction |
  toggleHideModalAction |
  fetchDataSuccessAction |
  setDarkModeAction |
  toggleDarkModeAction |
  increaseFontSizeAction |
  decreaseFontSizeAction |
  setMessageAction |
  addMessageAction |
  removeMessageAction |
  clearMessagesAction |
  showHelpTipAction |
  hideHelpTipAction
