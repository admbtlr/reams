import { connect } from 'react-redux'
import {
  UPDATE_ONBOARDING_INDEX
} from '../store/config/types'
import {
  SAVE_ITEM,
  TOGGLE_MERCURY_VIEW,
  UNSAVE_ITEM,
  UPDATE_CURRENT_INDEX,
  ItemType
} from '../store/items/types'
import {
  TOGGLE_VIEW_BUTTONS
} from '../store/ui/types'
import ItemCarousel from '../components/ItemCarousel.js'
import { getIndex, getItems } from '../utils/get-item'
import { ADD_TO_CATEGORY } from '../store/categories/types'

const mapStateToProps = (state, ownProps) => {
  // const items = state.items.display === 'unread' ? state.items.items : state.items.saved
  const items = getItems(state)
  // temporary!
  // just keeping this here while there's no UI for saved items
  // only want to show saved items with 'inbox' category
  // if (state.itemsMeta.display === ItemType.saved) {
  //   const inbox = state.categories.categories.find(category => category._id === 'inbox')
  //   items = items.filter(item => inbox.itemIds.find(itemId => itemId === item._id) !== undefined)
  // }
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
    isOnboarding: state.config.isOnboarding,
    orientation: state.config.orientation
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateCurrentIndex: (index, lastIndex, displayMode, isOnboarding) => {
      if (isOnboarding) {
        dispatch({
          type: UPDATE_ONBOARDING_INDEX,
          index,
          lastIndex,
          displayMode
        })
      } else {
        dispatch({
          type: UPDATE_CURRENT_INDEX,
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
        displayMode: currentDisplayMode === ItemType.saved ?
          ItemType.unread :
          ItemType.saved
      })
    },
    setSaved: (item, isSaved) => {
      if (!item) return
      if (isSaved) {
        dispatch({
          type: SAVE_ITEM,
          item,
          savedAt: Date.now()
        })
        dispatch({
          type: ADD_TO_CATEGORY,
          itemId: item._id,
          categoryId: 'inbox'
        })
      } else {
        dispatch({
          type: UNSAVE_ITEM,
          item
        })
      }
    },
    share: () => dispatch({
      type: 'ITEM_SHARE_ITEM',
      item
    }),
    toggleViewButtons: () => dispatch({
      type: TOGGLE_VIEW_BUTTONS
    }),
    toggleMercury: (item) => {
      if (item) {
        dispatch({
          type: TOGGLE_MERCURY_VIEW,
          item
        })
      }
    }
  }
}

const ItemCarouselContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ItemCarousel)

export default ItemCarouselContainer
