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
    items,
    feeds: state.feeds.feeds,
    feedsLocal: state.feedsLocal.feeds,
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
        dispatch({
          type: 'ITEMS_UPDATE_CURRENT_INDEX',
          index,
          lastIndex,
          displayMode
        })
      }
    },
    // setPanAnim: (panAnim, item_id) => dispatch({
    //   type: 'SET_PAN_ANIM',
    //   panAnim
    // }),
    toggleDisplayMode: (currentDisplayMode) => {
      return dispatch({
        type: 'SET_DISPLAY_MODE',
        displayMode: currentDisplayMode === 'saved' ?
          'unread' :
          'saved'
      })
    },
    setSaved: (item, isSaved) => {
      if (item) {
        isSaved ?
          dispatch({
            type: 'ITEM_SAVE_ITEM',
            item,
            savedAt: Date.now()
          }) :
          dispatch({
            type: 'ITEM_UNSAVE_ITEM',
            item
          })
      }
    },
    share: () => dispatch({
      type: 'ITEM_SHARE_ITEM',
      item
    }),
    toggleViewButtons: () => dispatch({
      type: 'UI_TOGGLE_VIEW_BUTTONS'
    }),
    toggleMercury: (item) => {
      if (item) {
        dispatch({
          type: 'ITEM_TOGGLE_MERCURY',
          item
        })
      }
    },
  }
}

let ItemCarouselContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ItemCarousel)

export default ItemCarouselContainer
