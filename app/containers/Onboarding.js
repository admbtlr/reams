import { connect } from 'react-redux'
import Onboarding from '../components/Onboarding.js'
// import { itemDidScroll } from '../redux/actions/item.js'

const mapStateToProps = (state, ownProps) => {
  // const index = state.onboarding.index
  // return {
  //   index
  // }
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    showItemButtons: () => dispatch({
      type: 'UI_SHOW_ITEM_BUTTONS'
    }),
    showViewButtons: () => dispatch({
      type: 'UI_SHOW_VIEW_BUTTONS'
    }),
    hideAllButtons: () => dispatch({
      type: 'UI_HIDE_ALL_BUTTONS'
    }),
    hideLoadingAnimation: () => dispatch({
      type: 'UI_HIDE_LOADING_ANIMATION'
    }),
    endOnboarding: () => dispatch({
      type: 'CONFIG_TOGGLE_ONBOARDING',
      isOnboarding: false
    })
  }
}

let OnboardingContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Onboarding)

export default OnboardingContainer
