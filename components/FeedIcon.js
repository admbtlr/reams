import React from 'react'
import * as FileSystem from 'expo-file-system'
import {
  Image,
  Platform,
  View
} from 'react-native'
import {fileExists, getCachedFeedIconPath} from '../utils/'
import { Sepia } from 'react-native-image-filter-kit'

function FeedIcon ({
  feed,
  dimensions,
  iconDimensions,
  hasCachedIcon,
  isBW,
  isSmall,
  isSmaller
}) {
  const [ isCached, setIsCached ] = React.useState()

  React.useEffect(() => {
    if (feed && Platform.OS !== 'web') {
      const path = getCachedFeedIconPath(feed._id)
      fileExists(path).
        then(setIsCached).
        catch(() => setIsCached(false))
    }
  }, [])

  React.useEffect(() => {
    if (!isCached && feed && feed.favicon?.url) {
      FileSystem.
        downloadAsync(feed.favicon.url, getCachedFeedIconPath(feed._id)).
        then(() => setIsCached(true)).
        catch(() => setIsCached(false))
    }
  }, [ isCached ])

  if (isCached === undefined) {
    return null
  }

  const width = isSmaller ? 18 : isSmall ? 24 : 32
  const height = isSmaller ? 18 : isSmall ? 24 : 32
  let dim = dimensions || iconDimensions
  let image = feed ? <Image
    width={width}
    height={height}
    // source={{ uri: Platform.OS === 'web' ? feed.favicon?.url : getCachedFeedIconPath(feed._id) }}
    source={{ uri: isCached ? getCachedFeedIconPath(feed._id) : feed.favicon?.url }}
    style={{
      width,
      height,
    }}
  /> : null
  if (isBW) {
    image = <Sepia
      amount={1}
      image={image} />
  }
  return feed?.favicon?.url || (isCached && dim && dim.width > 0) ?
    <View style={{
      backgroundColor: 'transparent',//feed ? feed.color : 'white',
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
