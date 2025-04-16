import React from 'react'
import * as FileSystem from 'expo-file-system'
import {
  Image,
  Platform,
  Text,
  View
} from 'react-native'
import {fileExists, getCachedFeedIconPath} from '../utils'
import type { Feed } from '../store/feeds/types'
import { useSelector } from 'react-redux'
import type { RootState } from '../store/reducers'
import type { Newsletter } from '../store/newsletters/types'

interface props {
  feedId: string | undefined
  isBW?: boolean | undefined
  isSmall?: boolean | undefined
  isSmaller?: boolean | undefined
  testID?: string
}

function FeedIcon ({
  feedId,
  isBW,
  isSmall,
  isSmaller,
  testID
}: props) {
  const [ isCached, setIsCached ] = React.useState<boolean>()
  const [ feed, setFeed ] = React.useState<Feed | Newsletter | undefined>()

  const f = useSelector((state: RootState) => state.feeds.feeds.find(f => f._id === feedId))
  const n = useSelector((state: RootState) => state.newsletters.newsletters.find(n => n._id === feedId))

  React.useEffect(() => {
    if (feed === undefined && feedId !== undefined) {
      if (f) setFeed(f)
      else if (n) setFeed(n)
    }
  }, [feed])

  React.useEffect(() => {
    if (feed && Platform.OS !== 'web') {
      const path = getCachedFeedIconPath(feed._id)
      fileExists(path).
        then(setIsCached).
        catch(() => setIsCached(false))
    }
  }, [feed])

  React.useEffect(() => {
    if (!isCached && feed && feed.favicon?.url) {
      FileSystem.
        downloadAsync(feed.favicon.url, getCachedFeedIconPath(feed._id)).
        then(() => setIsCached(true)).
        catch(() => setIsCached(false))
    }
  }, [ isCached ])

  if (Platform.OS !== 'web' && isCached === undefined) {
    return null
  }

  const width = isSmaller ? 18 : isSmall ? 24 : 32
  const height = isSmaller ? 18 : isSmall ? 24 : 32
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
  return feed?.favicon?.url ?
    <View 
      testID={testID}
      style={{
        backgroundColor: 'transparent',//feed ? feed.color : 'white',
        // margin: 10,
        width,
        height,
        marginRight: 3
      }}
    >
      { image }
    </View> :
    null
}

export default FeedIcon
