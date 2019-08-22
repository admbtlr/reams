import { connect } from 'react-redux'
import FeedItem from '../components/FeedItem.js'
import { getCurrentItem, getIndex, getItems } from '../utils/get-item'

const mapStateToProps = (state, ownProps) => {
  const items = getItems(state)
  const item = items[ownProps.index]
  return {
    item,
    showMercuryContent: items[ownProps.index].showMercuryContent,
    ...state.webView,
    isImageViewerVisible: state.ui.imageViewerVisible,
    coverImageComponent: ownProps.coverImageComponent,
    setTimerFunction: ownProps.setTimerFunction,
    displayMode: state.itemsMeta.display
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
    setScrollOffset: (item, offset, totalHeight) => dispatch({
      type: 'ITEM_SET_SCROLL_OFFSET',
      item,
      offset,
      scrollRatio: Number(Number.parseFloat(offset / totalHeight).toPrecision(4))
    })
    // scrollHandler: (e) => dispatch(itemDidScroll(e.nativeEvent.contentOffset.y))
  }
}

let FeedItemContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedItem)

export default FeedItemContainer
