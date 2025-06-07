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
import SourceDetails, { SourceStats } from './SourceDetails'
import XButton from './XButton'
import { getMargin } from '../utils/dimensions'
import { fontSizeMultiplier } from '../utils/dimensions'
import { textInfoStyle } from '../utils/styles'
import { RootState } from '../store/reducers'

import {
  Source
} from '../store/feeds/types'

interface SourceExpandedProps {
  route: {
    params: {
      source?: Source
      sourceId?: string
      navigation: any
    }
  }
}

export interface ExtendedSource extends Source {
  numUnread: number
  numRead: number
  readingTime: number
  readingRate: number
  coverImageId: string | undefined
  coverImageDimensions: any
  cachedCoverImageId?: string
  iconDimensions?: {
    width: number
    height: number
  }
}

const SourceExpanded: React.FC<SourceExpandedProps> = ({ route }) => {
  const navigation = useNavigation()

  const sourceId = route?.params?.source?._id || route?.params?.sourceId
  const source = useSelector((state: RootState) => {
    const baseSource = state.feeds.feeds.find(f => f._id === sourceId) ??
    {
      ...state.newsletters.newsletters.find(n => n._id === sourceId),
      isNewsletter: true
    }

    const items = state.itemsUnread.items
    // const feedLocal = state.feedsLocal.feeds.find(f => f._id === feedId)
    const sourceItems = items.filter(i => i.feed_id === sourceId)
    const coverImageItem = sourceItems.find(item => item.coverImageUrl)

    if (baseSource) {
      return {
        ...baseSource,
        numUnread: sourceItems.length,
        numRead: baseSource.readCount || 0,
        readingTime: baseSource.readingTime || 0,
        readingRate: baseSource.readingRate || 0,
        coverImageId: coverImageItem ? coverImageItem._id : null,
        coverImageDimensions: coverImageItem ? coverImageItem.imageDimensions : null,
        // cachedCoverImageId: feedLocal?.cachedCoverImageId,
        // iconDimensions: feedLocal?.cachedIconDimensions
      } as ExtendedSource
    }
    return null
  })

  const isSourceOnboardingDone = useSelector((state: RootState) => state.config.isFeedOnboardingDone)

  if (!source) return null

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
          backgroundColor: hslString(source.color, 'desaturated'),
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
            itemId={source.coverImageId}
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
            }}>{source.title}</Text>
            {source.description != null && source.description.length > 0 && <Text style={{
              ...textStyles,
              fontFamily: 'IBMPlexSans',
              fontSize: (source.description.length > 100 ? 18 : 20) *
                fontSizeMultiplier(),
              textAlign: 'left',
              marginBottom: 16 * fontSizeMultiplier()
            }}>{source.description}</Text>}
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
            }}>{source.numUnread} unread stor{source.numUnread === 1 ? 'y' : 'ies'}<SourceStats source={source} /></Text>
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
        <SourceDetails
          source={source}
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
