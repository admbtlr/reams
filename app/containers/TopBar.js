import { 
  SET_DISPLAY_MODE
} from '../store/items/types'
import { 
  SHOW_MODAL
} from '../store/ui/types'
import { connect } from 'react-redux'
import TopBar from '../components/TopBar.js'
import { getItems, getIndex } from '../utils/get-item'

const mapStateToProps = (state, ownProps) => {
  return {
    displayMode: state.itemsMeta.display,
    feedFilter: state.config.feedFilter,
    isDarkMode: state.ui.isDarkMode,
    isOnboarding: state.config.isOnboarding,
    ...ownProps
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setDisplayMode: (displayMode) => dispatch({
      type: SET_DISPLAY_MODE,
      displayMode
    }),
    showModal: (modalProps) => dispatch({
      type: SHOW_MODAL,
      modalProps
    }),
  }
}

let TopBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TopBar)

export default TopBarContainer
