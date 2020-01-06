import { connect } from 'react-redux'
import ItemCarousel from '../components/ItemCarousel.js'
import { getIndex, getItems } from '../utils/get-item'

const mapStateToProps = (state, ownProps) => {
  // const items = state.items.display === 'unread' ? state.items.items : state.items.saved
  const items = getItems(state)
  const index = getIndex(state)
  const numItems = state.config.isOnboarding ?
    state.config.onboardingLength :
    items.length
  return {
    ...ownProps,
    numItems,
    index,
    displayMode: state.itemsMeta.display,
    isItemsOnboardingDone: state.config.isItemsOnboardingDone,
    isOnboarding: state.config.isOnboarding
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateCurrentIndex: (index, lastIndex, displayMode, isOnboarding) => {
      if (isOnboarding) {
        return dispatch({
          type: 'CONFIG_UPDATE_ONBOARDING_INDEX',
          index,
          lastIndex,
          displayMode
        })
      } else {
        return dispatch({
          type: 'ITEMS_UPDATE_CURRENT_INDEX',
          index,
          lastIndex,
          displayMode
        })
      }
    },
    toggleDisplayMode: (currentDisplayMode) => {
      return dispatch({
        type: 'SET_DISPLAY_MODE',
        displayMode: currentDisplayMode === 'saved' ?
          'unread' :
          'saved'
      })
    }
  }
}

let ItemCarouselContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ItemCarousel)

export default ItemCarouselContainer
