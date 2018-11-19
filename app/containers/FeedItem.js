import { connect } from 'react-redux'
import FeedItem from '../components/FeedItem.js'
import { getCurrentItem, getIndex, getItems } from '../utils/get-item'

const mapStateToProps = (state, ownProps) => {
  const items = getItems(state)
  const index = getIndex(state)
  const item = items[ownProps.index]
  return {
    item,
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
