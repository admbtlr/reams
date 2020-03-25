import { connect } from 'react-redux'
import { FEED_HAS_RENDERED_ICON } from '../store/feeds/types'
import FeedIcon from '../components/FeedIcon.js'

const feedsWithInvertedIcons = [
  'The Guardian',
  'Vox -  All',
  'Brand New',
  'The Millions',
  'The New Republic',
  'Six Colors',
  'NYT > Top Stories',
  'Lifehacker'
]

const mapStateToProps = (state, ownProps) => {
  let feed, feedLocal
  if (ownProps.feed) {
    feed = ownProps.feed
    feedLocal = state.feedsLocal.feeds.find(f => f._id === feed._id)
  } else {
    feedLocal = state.feedsLocal.feeds.find(f => f._id === ownProps.id)
    feed = state.feeds.feeds.find(f => f._id === ownProps.id)
  }
  return {
    ...ownProps,
    feed,
    hasRenderedIcon: feedLocal && feedLocal.hasRenderedIcon,
    hasCachedIcon: feedLocal && feedLocal.hasCachedIcon,
    shouldInvert: feed && feedsWithInvertedIcons.indexOf(feed.title) !== -1
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setRenderedFeedIcon: (id) => dispatch({
      type: FEED_HAS_RENDERED_ICON,
      id
    })
  }
}

let FeedIconContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedIcon)

export default FeedIconContainer
