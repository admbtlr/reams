import {
  ADD_MESSAGE,
  CLEAR_MESSAGES,
  DECREASE_FONT_SIZE,
  DarkModeSetting,
  FETCH_DATA_SUCCESS,
  HIDE_ALL_BUTTONS,
  HIDE_HELPTIP,
  HIDE_IMAGE_VIEWER,
  HIDE_LOADING_ANIMATION,
  INCREASE_FONT_SIZE,
  REMOVE_MESSAGE,
  SET_BUTTON_LABELS,
  SET_DARK_MODE,
  SET_DARK_MODE_SETTING,
  SET_FONT_SIZE,
  SET_MESSAGE,
  SHOW_HELPTIP,
  SHOW_IMAGE_VIEWER,
  SHOW_ITEM_BUTTONS,
  SHOW_VIEW_BUTTONS,
  TOGGLE_BUTTON_LABELS,
  TOGGLE_DARK_MODE,
  TOGGLE_VIEW_BUTTONS,
  UIActionTypes,
  UIState
} from './types'

const initialState = {
  darkModeSetting: DarkModeSetting.AUTO,
  displayedHelpTips: [],
  fontSize: 3,
  helpTipKey: '',
  hiddenModals: [],
  imageViewerUrl: '',
  imageViewerVisible: false,
  isActive: true,
  showButtonLabels: false,
  isDarkMode: false,
  isHelpTipVisible: false,
  itemButtonsVisible: false,
  message: '',
  messageQueue: [],
  modalProps: {},
  modalVisible: false,
  showLoadingAnimation: true,
  viewButtonsVisible: false
}

const MAX_FONT_SIZE = 5
const MIN_FONT_SIZE = 1

let isDarkMode

export function ui(
  state: UIState = initialState,
  action: UIActionTypes
) {
  switch (action.type) {
    case TOGGLE_VIEW_BUTTONS:
      return {
        ...state,
        viewButtonsVisible: !state.viewButtonsVisible
      }

    case SHOW_VIEW_BUTTONS:
      return {
        ...state,
        viewButtonsVisible: true
      }

    case SHOW_ITEM_BUTTONS:
      return {
        ...state,
        itemButtonsVisible: true
      }

    case HIDE_ALL_BUTTONS:
      return {
        ...state,
        viewButtonsVisible: false,
        itemButtonsVisible: false
      }

    case HIDE_LOADING_ANIMATION:
    case FETCH_DATA_SUCCESS:
      return {
        ...state,
        showLoadingAnimation: false
      }

    case TOGGLE_DARK_MODE:
      return {
        ...state,
        isDarkMode: !state.isDarkMode
      }

    case TOGGLE_BUTTON_LABELS:
      return {
        ...state,
        showButtonLabels: !state.showButtonLabels
      }

    case SET_BUTTON_LABELS:
      return {
        ...state,
        showButtonLabels: action.showButtonLabels
      }

    case SET_DARK_MODE:
      isDarkMode = state.darkModeSetting === DarkModeSetting.AUTO ?
        action.isDarkMode :
        state.isDarkMode
      return {
        ...state,
        isDarkMode
      }

    case SET_DARK_MODE_SETTING:
      isDarkMode = action.darkModeSetting === DarkModeSetting.AUTO ?
        state.isDarkMode :
        action.darkModeSetting === DarkModeSetting.ON
      return {
        ...state,
        darkModeSetting: action.darkModeSetting,
        isDarkMode
      }

    case SHOW_IMAGE_VIEWER:
      return {
        ...state,
        imageViewerVisible: true,
        imageViewerUrl: action.url
      }

    case HIDE_IMAGE_VIEWER:
      return {
        ...state,
        imageViewerVisible: false,
        imageViewerUrl: ''
      }

    case INCREASE_FONT_SIZE:
      let fontSize = state.fontSize + 1
      fontSize = fontSize > MAX_FONT_SIZE ? MAX_FONT_SIZE : fontSize
      return {
        ...state,
        fontSize
      }

    case DECREASE_FONT_SIZE:
      fontSize = state.fontSize - 1
      fontSize = fontSize < MIN_FONT_SIZE ? MIN_FONT_SIZE : fontSize
      return {
        ...state,
        fontSize
      }

    case SET_FONT_SIZE:
      return {
        ...state,
        fontSize: action.fontSize
      }

    case SET_MESSAGE:
      return {
        ...state,
        message: action.message
      }

    case ADD_MESSAGE:
      // this is a dirty hack to migrate the store
      const messageQueue = state.messageQueue ?? []
      const message = typeof action.message === 'object' ?
        action.message :
        {
          messageString: action.message,
          isSelfDestruct: false
        }

      return {
        ...state,
        messageQueue: [
          ...messageQueue,
          message
        ]
      }

    case REMOVE_MESSAGE:
      return {
        ...state,
        messageQueue: state.messageQueue.filter(m => m.messageString !== action.messageString)
      }

    case CLEAR_MESSAGES:
      return {
        ...state,
        messageQueue: []
      }

    case SHOW_HELPTIP:
      return {
        ...state,
        isHelpTipVisible: true,
        helpTipKey: action.key
      }

    case HIDE_HELPTIP:
      let displayedHelpTips = [
        ...state.displayedHelpTips || [],
        state.helpTipKey
      ]
      return {
        ...state,
        isHelpTipVisible: false,
        helpTipKey: '',
        displayedHelpTips
      }


    default:
      return state
  }
}
