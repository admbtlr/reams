import {
  SHOW_MODAL
} from '../store/ui/types'
import { 
  SET_DISPLAY_MODE
} from '../store/items/types'

import { connect } from 'react-redux'
import Buttons from '../components/Buttons.js'
import { getIndex, getItems } from '../utils/get-item'

const mapStateToProps = (state) => {
  const items = getItems(state)
  const index = state.config.isOnboarding ?
    state.config.onboardingIndex :
    getIndex(state)
  const currentItem = items.length > 0 ? items[index] : null
  const numItems = state.config.isOnboarding ?
    state.config.onboardingLength :
    items.length
  return {
    index,
    isCurrentItemSaved: currentItem && currentItem.isSaved,
    showMercuryContent: currentItem && currentItem.showMercuryContent,
    isCurrentItemMercuryButtonEnabled: currentItem && currentItem.content_mercury,
    displayMode: state.itemsMeta.display,
    visible: state.ui.itemButtonsVisible,
    isDarkMode: state.ui.isDarkMode,
    isOnboarding: state.config.isOnboarding,
    // panAnim: state.animatedValues.panAnim
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
    })
  }
}

let ButtonsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Buttons)

export default ButtonsContainer
