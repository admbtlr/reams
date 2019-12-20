import { connect } from 'react-redux'
import Buttons from '../components/Buttons.js'
import { getIndex, getItems } from '../utils/get-item'

const mapStateToProps = (state) => {
  const feedFilter = state.config.feedFilter
  const items = getItems(state)
  const index = state.config.isOnboarding ?
    state.config.onboardingIndex :
    getIndex(state)
  const currentItem = items.length > 0 ? items[index] : null
  const prevItem = index > 0 ? items[index - 1] : null
  const nextItem = index < items.length - 1 ? items[index + 1] : null
  const numItems = state.config.isOnboarding ?
    state.config.onboardingLength :
    items.length
  const feedColor = (feedId) => state.feeds.feeds.find(f => f._id === feedId) &&
    state.feeds.feeds.find(f => f._id === feedId).color
  return {
    prevItem: prevItem && {
      ...prevItem,
      feed_color: feedColor(prevItem.feed_id)
    },
    currentItem: currentItem && {
      ...currentItem,
      feed_color: feedColor(currentItem.feed_id)
    },
    nextItem: nextItem && {
      ...nextItem,
      feed_color: feedColor(nextItem.feed_id)
    },
    numItems,
    index,
    isCurrentItemSaved: currentItem && currentItem.isSaved,
    showMercuryContent: currentItem && currentItem.showMercuryContent,
    isCurrentItemMercuryButtonEnabled: currentItem && currentItem.content_mercury,
    toolbar: state.toolbar,
    displayMode: state.itemsMeta.display,
    decoratedCount: state.itemsMeta.decoratedCount,
    visible: state.ui.itemButtonsVisible,
    isDarkBackground: state.webView.isDarkBackground,
    isOnboarding: state.config.isOnboarding
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    toggleSaved: (item) => {
      if (item) {
        item.isSaved ?
          dispatch({
            type: 'ITEM_UNSAVE_ITEM',
            item
          }) :
          dispatch({
            type: 'ITEM_SAVE_ITEM',
            item,
            savedAt: Date.now()
          })
      }
    },
    setDisplayMode: (displayMode) => dispatch({
      type: 'SET_DISPLAY_MODE',
      displayMode
    }),
    share: () => dispatch({
      type: 'ITEM_SHARE_ITEM',
      item
    }),
    toggleMercury: (item) => {
      if (item) {
        dispatch({
          type: 'ITEM_TOGGLE_MERCURY',
          item
        })
      }
    },
    showModal: (modalProps) => dispatch({
      type: 'UI_SHOW_MODAL',
      modalProps
    })
  }
}

let ButtonsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Buttons)

export default ButtonsContainer
