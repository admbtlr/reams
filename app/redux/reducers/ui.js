const initialState = {
  viewButtonsVisible: false,
  itemButtonsVisible: false,
  modalVisible: false,
  modalProps: {}
}

export function ui (state = initialState, action) {
  switch (action.type) {
    case 'UI_TOGGLE_VIEW_BUTTONS':
      return {
        ...state,
        viewButtonsVisible: !state.viewButtonsVisible
      }

    case 'UI_SHOW_ITEM_BUTTONS':
      return {
        ...state,
        itemButtonsVisible: true
      }

    case 'UI_HIDE_ALL_BUTTONS':
      return {
        ...state,
        viewButtonsVisible: false,
        itemButtonsVisible: false
      }

    case 'UI_SHOW_MODAL':
      console.log(action)
      return {
        ...state,
        modalVisible: true,
        modalProps: action.modalProps
      }

    case 'UI_HIDE_MODAL':
      return {
        ...state,
        modalVisible: false
      }

    default:
      return state
  }
}
