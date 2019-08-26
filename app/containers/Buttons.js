import { connect } from 'react-redux'
import Buttons from '../components/Buttons.js'
import { getIndex, getItems } from '../utils/get-item'

const mapStateToProps = (state) => {
  const feedFilter = state.config.feedFilter
  const items = getItems(state)
  const index = getIndex(state)
  const currentItem = items.length > 1 ? items[index] : null
  const prevItem = index > 0 ? items[index - 1] : null
  const nextItem = index < items.length - 1 ? items[index + 1] : null
  const numItems = state.config.isOnboarding ?
    state.config.onboardingLength :
    items.length
  return {
    prevItem,
    currentItem,
    nextItem,
    numItems,
    index,
    isCurrentItemSaved: currentItem && currentItem.isSaved,
    showMercuryContent: currentItem && currentItem.showMercuryContent,
    isCurrentItemMercuryButtonEnabled: currentItem && currentItem.content_mercury,
    toolbar: state.toolbar,
    displayMode: state.itemsMeta.display,
    decoratedCount: state.itemsMeta.decoratedCount,
    visible: state.ui.itemButtonsVisible,
    isDarkBackground: state.webView.isDarkBackground
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
    toggleDisplay: () => dispatch({ type: 'TOGGLE_DISPLAYED_ITEMS' }),
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
    }
  }
}

let ButtonsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Buttons)

export default ButtonsContainer
