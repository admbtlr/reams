import { connect } from 'react-redux'
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
  const feedLocal = state.feedsLocal.feeds.find(f => f._id === ownProps.feed._id)
  const feed = state.feeds.feeds.find(f => f._id === ownProps.feed._id)
  return {
    ...ownProps,
    hasRenderedIcon: feedLocal && feedLocal.hasRenderedIcon,
    hasCachedIcon: feedLocal && feedLocal.hasCachedIcon,
    shouldInvert: feedsWithInvertedIcons.indexOf(feed.title) !== -1
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
