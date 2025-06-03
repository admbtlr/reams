import React, { useState } from 'react'
import {
  Dimensions,
  Text,
  View
} from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import TextButton from './TextButton'
import SwitchRow from './SwitchRow'
import { hslString } from '../utils/colors'
import { getMargin } from '../utils/dimensions'
import { fontSizeMultiplier } from '../utils/dimensions'
import { isIpad } from '../utils/dimensions'
import { hasNotchOrIsland } from '../utils/dimensions'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import { textInfoStyle } from '../utils/styles'
import { useDispatch } from 'react-redux'
import { dustbinIcon, xIcon } from '../utils/icons'
import CategoryToggles from './CategoryToggles'
import { CLEAR_READ_ITEMS, SORT_ITEMS } from '../store/items/types'
import { LIKE_FEED_TOGGLE, MARK_FEED_READ, MERCURY_FEED_TOGGLE, MUTE_FEED_TOGGLE, REMOVE_FEED } from '../store/feeds/types'
import { useNavigation } from '@react-navigation/native'
import type { NavigationProp } from '@react-navigation/native'

interface Feed {
  _id: string
  title: string
  color: string
  isLiked: boolean
  isMuted: boolean
  isMercury: boolean
  readingTime: number
  numRead: number
  iconDimensions?: {
    width: number
    height: number
  }
}

interface FeedStatsProps {
  feed: Feed
}

interface SourceDetailsProps {
  feed: Feed
}

const compactButtons = !hasNotchOrIsland() && !isIpad()

const createTimeString = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const hours = Math.floor(mins / 60)
  return (hours > 0 ?
    (hours + ' hour' + (hours === 1 ? ' ' : 's ')) : '') +
    (mins > 0 ?
      (hours > 0 ? mins % 60 : mins) + ' minute' + (mins === 1 ? '' : 's') :
      seconds + ' seconds')
}

export const FeedStats: React.FC<FeedStatsProps> = ({ feed }) => {
  const screenWidth = Dimensions.get('window').width
  const margin = screenWidth * 0.03
  const totalReadingTime = createTimeString(feed.readingTime)
  const avgReadingTime = createTimeString(Math.round(feed.readingTime / feed.numRead))

  const bold = {
    fontFamily: 'IBMPlexSans-Bold',
    // color: hslString(feed.color, 'darkmodable')
  }
  const italic = {
    fontFamily: 'IBMPlexSans-LightItalic'
  }

  if (feed.numRead === 0) return null

  return (
    <Text style={{
      ...textInfoStyle('white'),
      fontSize: 14 * fontSizeMultiplier(),
      opacity: 0.9
      // color: hslString('white'),
      // fontFamily: 'IBMPlexSans-Light',
      // marginBottom: margin,
      // textAlign: 'left'
    }}> • You've read {feed.numRead} {feed.numRead === 1 ? 'story' : 'stories'} from <Text style={{ fontFamily: 'IBMPlexSans-Bold' }}>{feed.title}</Text>
      {feed.numRead > 0 && avgReadingTime && avgReadingTime > 0 &&
        <Text>. It takes you an average of {avgReadingTime} to read each story
        </Text>
      }.
    </Text>)

}

const SourceDetails: React.FC<SourceDetailsProps> = ({ feed }) => {
  const [isLiked, setLiked] = useState<boolean>(feed.isLiked)
  const [isMuted, setMuted] = useState<boolean>(feed.isMuted)
  const [isMercury, setMercury] = useState<boolean>(feed.isMercury)

  const navigation = useNavigation<NavigationProp<any>>()
  const dispatch = useDispatch()

  const markAllRead = (feed: Feed, olderThan?: number) => dispatch({
    type: MARK_FEED_READ,
    feed,
    olderThan: olderThan || Date.now()
  })
  const clearReadItems = () => dispatch({
    type: CLEAR_READ_ITEMS
  })
  const unsubscribe = (feed: Feed) => dispatch({
    type: REMOVE_FEED,
    feed
  })
  const toggleMute = (feed: Feed) => {
    dispatch({
      type: MUTE_FEED_TOGGLE,
      feed
    })
    dispatch({
      type: CLEAR_READ_ITEMS
    })
  }
  const toggleLike = (feed: Feed) => {
    dispatch({
      type: LIKE_FEED_TOGGLE,
      feed
    })
    dispatch({
      type: SORT_ITEMS
    })
  }
  const toggleMercury = (feed: Feed) => dispatch({
    type: MERCURY_FEED_TOGGLE,
    feed
  })

  const screenWidth = Dimensions.get('window').width
  const margin = screenWidth * 0.03

  const likeIcon = <Svg
    viewBox='0 0 32 32'
    height={32 * fontSizeMultiplier()}
    width={32 * fontSizeMultiplier()}
    style={{
      top: 3
    }}>
    <Path
      d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'
      strokeWidth={2}
      stroke={hslString('rizzleText')}
      fill={isLiked ? hslString('rizzleText') : 'none'}
    />
  </Svg>

  const muteIcon = <Svg
    viewBox='0 0 32 32'
    height={32 * fontSizeMultiplier()}
    width={32 * fontSizeMultiplier()}
    style={{
      top: 3
    }}>
    <Path
      d='M11 5L6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6'
      strokeWidth={2}
      stroke={hslString('rizzleText')}
      fill={isMuted ? hslString('rizzleText') : 'none'}
    />
  </Svg>

  const discardAllIcon = dustbinIcon()

  const readIcon = <Svg
    viewBox='0 0 32 32'
    height={32 * fontSizeMultiplier()}
    width={32 * fontSizeMultiplier()}>
    <Path
      d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'
      strokeWidth={2}
      stroke={hslString('rizzleText')}
      fill='none'
    />
    <Circle
      cx='12'
      cy='12'
      r='3'
      strokeWidth={2}
      stroke={hslString('rizzleText')}
      fill='none'
    />
  </Svg>

  const mercuryIcon = <View style={{
    width: 28 * fontSizeMultiplier(),
    top: 22 * fontSizeMultiplier(),
    left: 8 * fontSizeMultiplier(),
    transform: [{ rotateZ: '180deg' }, { scale: 0.9 }]
  }}>
    {getRizzleButtonIcon(
      'showMercuryIconOn', hslString('rizzleText'), hslString('rizzleBG'),
      true)}
  </View>

  const { iconDimensions } = feed

  return (
    <View style={{
      justifyContent: 'flex-start',
      margin: 0,
      paddingBottom: margin,
    }}>
      <View style={{
        flex: 0,
        paddingHorizontal: screenWidth < 500 ? margin : screenWidth * 0.04
        // backgroundColor: 'red'
        // alignItems: 'flex-end'
      }}>
        <View style={{
          paddingTop: getMargin(),
          height: 60 * fontSizeMultiplier()

        }}>
          <CategoryToggles feed={feed} />
          {/* <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
              }}
            >

            </View>
          </ScrollView> */}
        </View>
        <View style={{
          flexDirection: 'column',
          flex: 0,
          width: '100%'
        }}>
          <SwitchRow
            label='Always show full text view'
            help='Show the full text of the story instead of the (possibly truncated) RSS version'
            icon={mercuryIcon}
            onValueChange={() => {
              setMercury(!isMercury)
              toggleMercury(feed)
            }}
            value={isMercury} />
          <SwitchRow
            label='Mute this feed'
            icon={muteIcon}
            onValueChange={() => {
              setMuted(!isMuted)
              setTimeout(() => {
                toggleMute(feed)
              }, 100)
            }}
            value={isMuted} />
          <SwitchRow
            icon={likeIcon}
            label='Like this feed'
            onValueChange={() => {
              setLiked(!isLiked)
              setTimeout(() => {
                toggleLike(feed)
              }, 100)
            }}
            help='Stories will always appear at the front of your unread list'
            value={isLiked} />
        </View>
        <View style={{
          flex: 0,
          flexDirection: 'row',
          flexWrap: 'wrap',
          // minHeight: 100,
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: margin,
          marginTop: margin
        }}>
          <TextButton
            isCompact={compactButtons}
            buttonStyle={{
              minWidth: '48%',
              marginRight: margin,
              marginBottom: margin
            }}
            icon={xIcon()}
            noResize={true}
            onPress={() => {
              navigation.goBack()
              unsubscribe(feed)
              clearReadItems()
            }}
            text='Unsubscribe' />
          <TextButton
            isCompact={compactButtons}
            buttonStyle={{
              minWidth: '48%',
              marginBottom: margin
            }}
            icon={discardAllIcon}
            noResize={true}
            onPress={() => {
              setTimeout(() => {
                markAllRead(feed)
              }, 100)
            }}
            text='Discard stories' />
        </View>
      </View>
    </View>
  )
}

export default SourceDetails
