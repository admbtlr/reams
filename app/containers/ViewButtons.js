import { connect } from 'react-redux'
import ViewButtons from '../components/ViewButtons.js'

const mapStateToProps = (state) => {
  return {
    visible: state.ui.viewButtonsVisible
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    increaseFontSize: () => dispatch({
      type: 'WEBVIEW_INCREASE_FONT_SIZE'
    }),
    decreaseFontSize: () => dispatch({
      type: 'WEBVIEW_DECREASE_FONT_SIZE'
    }),
    toggleDarkBackground: () => dispatch({
      type: 'WEBVIEW_TOGGLE_BACKGROUND'
    })
  }
}

let ViewButtonsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewButtons)

export default ViewButtonsContainer
