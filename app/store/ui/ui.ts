import {
  FETCH_DATA_SUCCESS,
  HIDE_ALL_BUTTONS,
  HIDE_IMAGE_VIEWER,
  HIDE_LOADING_ANIMATION,
  HIDE_MODAL,
  SHOW_IMAGE_VIEWER,
  SHOW_ITEM_BUTTONS,
  SHOW_MODAL,
  SHOW_VIEW_BUTTONS,
  TOGGLE_HIDE_MODAL,
  TOGGLE_VIEW_BUTTONS,
  UIActionTypes,
  UIState
} from './types'

const initialState = {
  viewButtonsVisible: false,
  itemButtonsVisible: false,
  modalVisible: false,
  modalProps: {},
  showLoadingAnimation: true,
  imageViewerVisible: false,
  imageViewerUrl: '',
  hiddenModals: [],
  message: ''
}

export function ui (
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

    case SHOW_MODAL:
      return {
        ...state,
        modalVisible: true,
        modalProps: action.modalProps
      }

    case HIDE_MODAL:
      return {
        ...state,
        modalVisible: false
      }

    case HIDE_LOADING_ANIMATION:
    case FETCH_DATA_SUCCESS:
      return {
        ...state,
        showLoadingAnimation: false
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

    case TOGGLE_HIDE_MODAL:
      let hiddenModals = state.hiddenModals || []
      hiddenModals = [
        ...hiddenModals,
        action.modalName
      ]
      return {
        ...state,
        hiddenModals
      }

    default:
      return state
  }
}
