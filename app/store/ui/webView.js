const initialState = {
  fontSize: 3,
  isDarkBackground: false
}

const MAX_FONT_SIZE = 5
const MIN_FONT_SIZE = 0

export function webView (state = initialState, action) {
  let fontSize
  switch (action.type) {
    case 'WEBVIEW_TOGGLE_BACKGROUND':
      return {
        ...state,
        isDarkBackground: !state.isDarkBackground
      }

    case 'WEBVIEW_SET_DARK_MODE':
      return {
        ...state,
        isDarkBackground: action.isDarkMode
      }

    case 'WEBVIEW_INCREASE_FONT_SIZE':
      fontSize = state.fontSize + 1
      fontSize = fontSize > MAX_FONT_SIZE ? MAX_FONT_SIZE : fontSize
      return {
        ...state,
        fontSize
      }

    case 'WEBVIEW_DECREASE_FONT_SIZE':
      fontSize = state.fontSize - 1
      fontSize = fontSize < MIN_FONT_SIZE ? MIN_FONT_SIZE : fontSize
      return {
        ...state,
        fontSize
      }

    default:
      return state
  }
}
