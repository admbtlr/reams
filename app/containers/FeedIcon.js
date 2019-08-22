import { connect } from 'react-redux'
import FeedIcon from '../components/FeedIcon.js'

const mapStateToProps = (state, ownProps) => {
  const feedLocal = state.feedsLocal.feeds.find(f => f._id === ownProps.id)
  return {
    ...ownProps,
    hasRenderedIcon: feedLocal && feedLocal.hasRenderedIcon
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setRenderedFeedIcon: (id) => dispatch({
      type: 'FEED_HAS_RENDERED_ICON',
      id
    })
  }
}

let FeedIconContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedIcon)

export default FeedIconContainer
