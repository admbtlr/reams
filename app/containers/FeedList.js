import { connect } from 'react-redux'
import FeedList from '../components/FeedList.js'

const mapStateToProps = (state) => {
  const items = state.items.display === 'unread' ? state.items.items : state.items.saved
  const index = state.config.isOnboarding ?
    state.config.onboardingIndex :
    state.items.display === 'unread' ?
      state.items.index :
      state.items.savedIndex
  const numItems = state.config.isOnboarding ?
    state.config.onboardingLength :
    items.length
  return {
    numItems,
    index,
    displayMode: state.items.display,
    isOnboarding: state.config.isOnboarding
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateCurrentIndex: (index, lastIndex, isOnboarding) => {
      if (isOnboarding) {
        return dispatch({
          type: 'CONFIG_UPDATE_ONBOARDING_INDEX',
          index,
          lastIndex
        })
      } else {
        return dispatch({
          type: 'ITEMS_UPDATE_CURRENT_INDEX',
          index,
          lastIndex
        })
      }
    }
  }
}

let FeedListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedList)

export default FeedListContainer
