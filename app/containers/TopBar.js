import { connect } from 'react-redux'
import TopBar from '../components/TopBar.js'
import { getItems, getIndex } from '../utils/get-item'

const mapStateToProps = (state, ownProps) => {
  const feedFilter = state.config.feedFilter
  const items = getItems(state)
  const index = getIndex(state)
  const currentItem = (items && items.length > 1) ? items[index] : null
  const prevItem = (items && index > 0) ? items[index - 1] : null
  const nextItem = (items && index < items.length - 1) ? items[index + 1] : null
  const hasCachedIcon = (feedId) => state.feedsLocal.feeds.find(f => f._id === feedId) &&
    state.feedsLocal.feeds.find(f => f._id === feedId).hasCachedIcon
  const iconDimensions = (feedId) => state.feedsLocal.feeds.find(f => f._id === feedId) &&
    state.feedsLocal.feeds.find(f => f._id === feedId).cachedIconDimensions
  const feedColor = (feedId) => state.feeds.feeds.find(f => f._id === feedId) &&
  state.feeds.feeds.find(f => f._id === feedId).color
  return {
    prevItem: prevItem && {
      ...prevItem,
      hasCachedFeedIcon: hasCachedIcon(prevItem.feed_id),
      feedIconDimensions: iconDimensions(prevItem.feed_id),
      feed_color: feedColor(prevItem.feed_id)
    },
    currentItem: currentItem && {
      ...currentItem,
      hasCachedFeedIcon: hasCachedIcon(currentItem.feed_id),
      feedIconDimensions: iconDimensions(currentItem.feed_id),
      feed_color: feedColor(currentItem.feed_id)
    },
    nextItem: nextItem && {
      ...nextItem,
      hasCachedFeedIcon: hasCachedIcon(nextItem.feed_id),
      feedIconDimensions: iconDimensions(nextItem.feed_id),
      feed_color: feedColor(nextItem.feed_id)
    },
    toolbar: state.toolbar,
    displayMode: state.itemsMeta.display,
    isDarkBackground: state.webView.isDarkBackground,
    feedFilter,
    isOnboarding: state.config.isOnboarding,
    ...ownProps
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    toggleViewButtons: () => dispatch({
      type: 'UI_TOGGLE_VIEW_BUTTONS'
    }),
    showItemButtons: () => dispatch({
      type: 'UI_SHOW_ITEM_BUTTONS'
    }),
    hideAllButtons: () => dispatch({
      type: 'UI_HIDE_ALL_BUTTONS'
    }),
    markAllRead: (id) => dispatch({
      type: 'FEED_MARK_READ',
      id
    }),
    unsubscribe: (id) => dispatch({
      type: 'FEEDS_REMOVE_FEED',
      id
    })
  }
}

let TopBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TopBar)

export default TopBarContainer
