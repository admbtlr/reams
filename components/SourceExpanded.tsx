import React from 'react'
import {
  Dimensions,
  Text,
  View
} from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { hslString } from '../utils/colors'
import CardCoverImage from './CardCoverImage'
import FeedDetails, { FeedStats } from './FeedDetails'
import XButton from './XButton'
import { getMargin } from '../utils/dimensions'
import { fontSizeMultiplier } from '../utils/dimensions'
import { textInfoStyle } from '../utils/styles'
import { RootState } from '../store/reducers'

import {
  Feed
} from '../store/feeds/types'

interface SourceExpandedProps {
  route: {
    params: {
      feed?: Feed
      feedId?: string
      navigation: any
    }
  }
}

interface ExtendedFeed extends Feed {
  numUnread: number
  numRead: number
  readingTime: number
  readingRate: number
  coverImageId: string | null
  coverImageDimensions: any
  cachedCoverImageId?: string
  iconDimensions?: {
    width: number
    height: number
  }
}

const SourceExpanded: React.FC<SourceExpandedProps> = ({ route }) => {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  
  const feedId = route?.params?.feed?._id || route?.params?.feedId
  const feed = useSelector((state: RootState) => {
    const baseFeed = state.feeds.feeds.find(f => f._id === feedId)
    const items = state.itemsUnread.items
    const feedLocal = state.feedsLocal.feeds.find(f => f._id === feedId)
    const feedItems = items.filter(i => i.feed_id === feedId)
    const coverImageItem = feedItems.find(item => item.coverImageUrl)
    
    if (baseFeed) {
      return {
        ...baseFeed,
        numUnread: feedItems.length,
        numRead: baseFeed.readCount || 0,
        readingTime: baseFeed.readingTime || 0,
        readingRate: baseFeed.readingRate || 0,
        coverImageId: coverImageItem ? coverImageItem._id : null,
        coverImageDimensions: coverImageItem ? coverImageItem.imageDimensions : null,
        cachedCoverImageId: feedLocal?.cachedCoverImageId,
        iconDimensions: feedLocal?.cachedIconDimensions
      } as ExtendedFeed
    }
    return null
  })
  
  const isFeedOnboardingDone = useSelector((state: RootState) => state.config.isFeedOnboardingDone)





  if (!feed) return null

  const textStyles = {
    color: 'white',
    fontFamily: 'IBMPlexSans-Light',
    textAlign: 'left' as const
  }

  const dim = Dimensions.get('window')
  const screenWidth = dim.width
  const margin = getMargin()
  const screenHeight = dim.height

  const EnclosingView = screenWidth < 500 ? View : View

  return (
    <EnclosingView
      style={{
        padding: 0,
        margin: 0,
        minHeight: '100%',
        flex: 1
      }}>
      <View
        style={{
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          backgroundColor: hslString(feed.color, 'desaturated'),
          overflow: 'hidden',
          flex: 0,
          flexGrow: 1,
          width: screenWidth,
        }}>
        <View
          style={{
            width: '100%',
            minHeight: 200,
            overflow: 'hidden',
            flex: 1
          }}>
          <CardCoverImage
            itemId={feed.coverImageId}
            width={screenWidth}
            height={screenHeight * 0.6}
            feedId={undefined} />
          <View style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.4)'
          }} />
        </View>
        <View style={{
          width: '100%',
          paddingLeft: screenWidth < 500 ? margin * 0.5 : screenWidth * 0.04,
          paddingRight: 40,
          paddingBottom: margin * 0.5,
          position: 'absolute',
          bottom: 0,
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
        }}>
          <View style={{
            paddingLeft: 4,
            paddingRight: 4,
            paddingBottom: 2
          }}>
            <Text style={{
              ...textStyles,
              flexWrap: 'wrap',
              fontFamily: 'IBMPlexSansCond-Bold',
              fontSize: 32 * fontSizeMultiplier(),
              lineHeight: 32 * fontSizeMultiplier()
            }}>{feed.title}</Text>
            {feed.description != null && feed.description.length > 0 && <Text style={{
              ...textStyles,
              fontFamily: 'IBMPlexSans',
              fontSize: (feed.description.length > 100 ? 18 : 20) *
                fontSizeMultiplier(),
              textAlign: 'left',
              marginBottom: 16 * fontSizeMultiplier()
            }}>{feed.description}</Text>}
          </View>
          <View style={{
            paddingBottom: 5,
            paddingLeft: 4,
            paddingRight: 10
          }}>
            <Text style={{
              ...textInfoStyle('white'),
              marginLeft: 0,
              fontSize: 14 * fontSizeMultiplier()
            }}>{feed.numUnread} unread stor{feed.numUnread === 1 ? 'y' : 'ies'}<FeedStats feed={feed} /></Text>
          </View>
        </View>
      </View>
      <View style={{
        backgroundColor: hslString('rizzleBG'),
        flex: 0,
        padding: 0,
        margin: 0,
        flexGrow: 0
      }}>
        <FeedDetails 
          feed={feed}
          close={() => navigation.goBack()}
        />
      </View>
      <View style={{
        position: 'absolute',
        right: 10 * fontSizeMultiplier(),
        top: 10 * fontSizeMultiplier()
      }}>
        <XButton
          isLight={true}
          onPress={() => navigation.goBack()} />
      </View>
    </EnclosingView>
  )
}

export default SourceExpanded