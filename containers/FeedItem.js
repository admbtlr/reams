import { connect } from 'react-redux'
import FeedItem from '../components/FeedItem.js'
// import { itemDidScroll } from '../redux/actions/item.js'

const mapStateToProps = (state, ownProps) => {
  const items = state.items.display === 'unread' ? state.items.items : state.items.saved
  const index = state.items.display === 'unread' ? state.items.index : state.items.savedIndex
  return {
    item: items[ownProps.index],
    isVisible: ownProps.index === index,
    showMercury: !!items[ownProps.index].content_mercury
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    // scrollHandler: (e) => dispatch(itemDidScroll(e.nativeEvent.contentOffset.y))
  }
}

let FeedItemContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedItem)

export default FeedItemContainer
