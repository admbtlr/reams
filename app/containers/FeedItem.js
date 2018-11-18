import { connect } from 'react-redux'
import FeedItem from '../components/FeedItem.js'

const mapStateToProps = (state, ownProps) => {
  const feedFilter = state.config.feedFilter
  const items = state.itemsMeta.display === 'unread' ?
    (feedFilter ?
      state.itemsUnread.items.filter(item => item.feed_id === feedFilter) :
      state.itemsUnread.items) :
    state.itemsSaved.items
  const index = state.itemsMeta.display === 'unread' ?
    state.itemsMeta.index :
    state.itemsMeta.savedIndex
  return {
    item: items[ownProps.index],
    isVisible: ownProps.index === index,
    showMercuryContent: items[ownProps.index].showMercuryContent,
    ...state.webView,
    isImageViewerVisible: state.ui.imageViewerVisible
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    scrollHandlerAttached: (owner) => dispatch({
      type: 'SCROLL_HANDLER_ATTACHED',
      owner: owner
    }),
    showImageViewer: (url) => dispatch({
      type: 'UI_SHOW_IMAGE_VIEWER',
      url
    }),
    setScrollOffset: (item, offset) => dispatch({
      type: 'ITEM_SET_SCROLL_OFFSET',
      item,
      offset
    })
    // scrollHandler: (e) => dispatch(itemDidScroll(e.nativeEvent.contentOffset.y))
  }
}

let FeedItemContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedItem)

export default FeedItemContainer
