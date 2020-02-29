import { connect } from 'react-redux'
import { TOGGLE_ONBOARDING } from '../store/config/types'
import {
  HIDE_ALL_BUTTONS,
  HIDE_LOADING_ANIMATION,
  SHOW_ITEM_BUTTONS,
  SHOW_VIEW_BUTTONS
} from '../store/ui/types'

import Onboarding from '../components/Onboarding.js'
// import { itemDidScroll } from '../redux/actions/item.js'

const mapStateToProps = (state, ownProps) => {
  // const index = state.onboarding.index
  // return {
  //   index
  // }
  return {
    isDarkBackground: state.webView.isDarkBackground
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    showItemButtons: () => dispatch({
      type: SHOW_ITEM_BUTTONS
    }),
    showViewButtons: () => dispatch({
      type: SHOW_VIEW_BUTTONS
    }),
    hideAllButtons: () => dispatch({
      type: HIDE_ALL_BUTTONS
    }),
    hideLoadingAnimation: () => dispatch({
      type: HIDE_LOADING_ANIMATION
    }),
    endOnboarding: () => dispatch({
      type: TOGGLE_ONBOARDING,
      isOnboarding: false
    })
  }
}

let OnboardingContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Onboarding)

export default OnboardingContainer
