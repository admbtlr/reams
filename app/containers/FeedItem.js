import { connect } from 'react-redux'
import FeedItem from '../components/FeedItem.js'
import { getCurrentItem, getIndex, getItems } from '../utils/get-item'

import { SET_SCROLL_OFFSET } from '../store/items/types'
import { SHOW_IMAGE_VIEWER } from '../store/ui/types'

const mapStateToProps = (state, ownProps) => {
  const items = getItems(state)
  const index = getIndex(state)
  const itemIndex = items.findIndex(item => item._id === ownProps._id)
  const item = items[itemIndex]
  const feed = item && state.feeds.feeds.find(f => f._id === item.feed_id)
  const feed_color = feed &&
    state.feeds.feeds.find(f => f._id === item.feed_id).color
  const showMercuryContent = item.showMercuryContent !== undefined ? 
    item.showMercuryContent :
    feed && feed.isMercury
  return {
    item: {
      ...item,
      feed_color
    },
    showMercuryContent,
    isDarkMode: state.ui.isDarkMode,
    orientation: state.config.orientation,
    fontSize: state.ui.fontSize,
    isImageViewerVisible: state.ui.imageViewerVisible,
    coverImageComponent: ownProps.coverImageComponent,
    setTimerFunction: ownProps.setTimerFunction,
    displayMode: state.itemsMeta.display,
    isVisible: index === itemIndex
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    // scrollHandlerAttached: (owner) => dispatch({
    //   type: 'SCROLL_HANDLER_ATTACHED',
    //   owner: owner
    // }),
    showImageViewer: (url) => dispatch({
      type: SHOW_IMAGE_VIEWER,
      url
    }),
    setScrollOffset: (item, offset, totalHeight) => dispatch({
      type: SET_SCROLL_OFFSET,
      item,
      offset,
      scrollRatio: Number(Number.parseFloat(offset / totalHeight).toPrecision(4))
    })
  }
}

let FeedItemContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedItem)

export default FeedItemContainer
