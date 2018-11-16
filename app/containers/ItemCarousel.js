import { connect } from 'react-redux'
import ItemCarousel from '../components/ItemCarousel.js'

const mapStateToProps = (state) => {
  // const items = state.items.display === 'unread' ? state.items.items : state.items.saved
  const items = state.itemsMeta.display === 'unread' ? state.itemsUnread : state.itemsSaved
  const index = state.config.isOnboarding ?
    state.config.onboardingIndex :
    state.itemsMeta.display === 'unread' ?
      state.itemsMeta.index :
      state.itemsMeta.savedIndex
  const numItems = state.config.isOnboarding ?
    state.config.onboardingLength :
    items.length
  return {
    numItems,
    index,
    displayMode: state.itemsMeta.display,
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

let ItemCarouselContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ItemCarousel)

export default ItemCarouselContainer
