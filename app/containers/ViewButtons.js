import { 
  DECREASE_FONT_SIZE,
  INCREASE_FONT_SIZE,
  TOGGLE_DARK_MODE 
} from '../store/ui/types'

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
      type: INCREASE_FONT_SIZE
    }),
    decreaseFontSize: () => dispatch({
      type: DECREASE_FONT_SIZE
    }),
    toggleDarkMode: () => dispatch({
      type: TOGGLE_DARK_MODE
    })
  }
}

let ViewButtonsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewButtons)

export default ViewButtonsContainer
