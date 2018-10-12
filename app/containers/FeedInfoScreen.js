import { connect } from 'react-redux'
import FeedInfoScreen from '../components/FeedInfoScreen.js'
// import { itemDidScroll } from '../redux/actions/item.js'

const mapStateToProps = (state, ownProps) => {
  return ownProps
}

const mapDispatchToProps = (dispatch) => {
  return {
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

let FeedInfoScreenContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedInfoScreen)

export default FeedInfoScreenContainer
