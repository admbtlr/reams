import { connect } from 'react-redux'
import { 
  MARK_FEED_READ,
  REMOVE_FEED
} from '../store/feeds/types'
import FeedInfoScreen from '../components/FeedInfoScreen.js'
// import { itemDidScroll } from '../redux/actions/item.js'

const mapStateToProps = (state, ownProps) => {
  return ownProps
}

const mapDispatchToProps = (dispatch) => {
  return {
    markAllRead: (id) => dispatch({
      type: MARK_FEED_READ,
      id
    }),
    unsubscribe: (id) => dispatch({
      type: REMOVE_FEED,
      id
    })
  }
}

let FeedInfoScreenContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedInfoScreen)

export default FeedInfoScreenContainer
