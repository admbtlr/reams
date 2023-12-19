import React from 'react'
import {
  Image,
  Platform,
  View
} from 'react-native'
import {getCachedFeedIconPath} from '../utils/'

function FeedIcon ({
  feed,
  dimensions,
  iconDimensions,
  hasCachedIcon,
  isSmall,
  isSmaller
}) {
  const width = isSmaller ? 18 : isSmall ? 24 : 32
  const height = isSmaller ? 18 : isSmall ? 24 : 32
  let dim = dimensions || iconDimensions
  const image = feed ? <Image
    width={width}
    height={height}
    source={{ uri: Platform.OS === 'web' ? feed.favicon?.url : getCachedFeedIconPath(feed._id) }}
    style={{
      width,
      height,
    }}
  /> : null
  return (Platform.OS === 'web' && feed?.favicon?.url) || (hasCachedIcon && dim && dim.width > 0) ?
    <View style={{
      backgroundColor: feed ? feed.color : 'white',
      // margin: 10,
      width,
      height,
      marginRight: 5
    }}>
      { image }
    </View> :
    null
}

export default FeedIcon
