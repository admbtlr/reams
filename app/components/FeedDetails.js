import React, { useState } from 'react'
import {
  Dimensions,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import Svg, {Circle, Polyline, Path, Line} from 'react-native-svg'
import TextButton from './TextButton'
import NavButton from './NavButton'
import SwitchRow from './SwitchRow'
import { hslString } from '../utils/colors'
import { hasNotchOrIsland, isIpad, fontSizeMultiplier, getMargin } from '../utils'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import { textInfoStyle, textInfoBoldStyle } from '../utils/styles'
import FeedIconContainer from '../containers/FeedIcon'
import { useDispatch, useSelector } from 'react-redux'
import { REMOVE_FEED_FROM_CATEGORY, ADD_FEED_TO_CATEGORY } from '../store/categories/types'
import { dustbinIcon, xIcon } from '../utils/icons'

const compactButtons = !hasNotchOrIsland() && !isIpad()

const createTimeString = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const hours = Math.floor(mins / 60)
  return (hours > 0 ?
    (hours + ' hour' + (hours === 1 ? ' ' : 's ')) : '') +
    (mins > 0 ?
      (hours > 0 ? mins % 60 : mins) + ' minute' + (mins === 1 ? '' : 's') :
      seconds + ' seconds')
}

export const FeedStats = ({ feed }) => {
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

  return (
    <Text style={{
      ...textInfoStyle('white'),
      opacity: 0.8
      // color: hslString('white'),
      // fontFamily: 'IBMPlexSans-Light',
      // marginBottom: margin,
      // textAlign: 'left'
    }}>You’ve read {feed.numRead} {feed.numRead === 1 ? 'story' : 'stories'} from {feed.title}
      {feed.numRead > 0 &&
        <Text> It takes you an average of {avgReadingTime} to read each story
        </Text>
      }.
      </Text>)

}

export default function FeedDetails ({ feed, markAllRead, unsubscribe, clearReadItems, close, filterItems, navigation, setIndex, toggleMute, toggleLike, toggleMercury }) {
  const [isLiked, setLiked] = useState(feed.isLiked)
  const [isMuted, setMuted] = useState(feed.isMuted)
  const [isMercury, setMercury] = useState(feed.isMercury)

  const categories = useSelector(state => state.categories.categories)
  const dispatch = useDispatch()

  const screenWidth = Dimensions.get('window').width
  const margin = screenWidth * 0.03

  const likeIcon = <Svg
      viewBox='0 0 32 32'
      height={ 32 * fontSizeMultiplier() }
      width={ 32 * fontSizeMultiplier() }
      style={{
        top: 3
      }}>
      <Path
        d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'
        strokeWidth={2}
        stroke={ hslString('rizzleText') }
        fill={ isLiked ? hslString('rizzleText') : 'none' }
      />
    </Svg>

  const muteIcon = <Svg
      viewBox='0 0 32 32'
      height={ 32 * fontSizeMultiplier() }
      width={ 32 * fontSizeMultiplier() }
      style={{
        top: 3
      }}>
      <Path
        d='M11 5L6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6'
        strokeWidth={2}
        stroke={ hslString('rizzleText') }
        fill={ isMuted ? hslString('rizzleText') : 'none' }
      />
    </Svg>

  const discardAllIcon = dustbinIcon()

  const readIcon = <Svg
      viewBox='0 0 32 32'
      height={ 32 * fontSizeMultiplier() }
      width={ 32 * fontSizeMultiplier() }>
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
    { getRizzleButtonIcon(
        'showMercuryIconOn', hslString('rizzleText'), hslString('rizzleBG'), 
        true) }
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
          paddingBottom: getMargin() - 8,
        }}>
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}>
          { categories.map((category, index) => (
              <TouchableOpacity 
                key={index}
                onPress={() => {
                  category.feeds.find(f => f === feed._id) ?
                    dispatch({
                      type: REMOVE_FEED_FROM_CATEGORY, 
                      feedId: feed._id, 
                      categoryId: category._id
                    }) :
                    dispatch({
                      type: ADD_FEED_TO_CATEGORY, 
                      feedId: feed._id, 
                      categoryId: category._id
                    })
                }}
              >
                <View style={{
                  backgroundColor: category.feeds.indexOf(feed._id) > -1 ? hslString('rizzleText') : 'rgba(0,0,0,0.1)',
                  borderRadius: 16,
                  padding: 4,
                  height: 32,
                  marginRight: 8,
                  marginBottom: 8,
                  borderColor: hslString('rizzleText'),
                  // borderWidth: category.feeds.indexOf(feed._id) > -1 ? 1 : 0
                }}>
                  <Text style={{ 
                    ...textInfoStyle(),
                    color: category.feeds.indexOf(feed._id) > -1 ? hslString('white') : hslString('rizzleText'),
                    margin: 0,
                    padding: 0
                  }}>{ category.name }</Text>
                </View>
              </TouchableOpacity>
            ))
          }
          </View>
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
              toggleMercury(feed._id)
            }}
            value={isMercury} />
          <SwitchRow
            label='Mute this feed'
            icon={muteIcon}
            onValueChange={() => {
              setMuted(!isMuted)
              setTimeout(() => {
                toggleMute(feed._id)
              }, 100)
            }}
            value={isMuted} />
          <SwitchRow
            icon={likeIcon}
            label='Like this feed'
            onValueChange={() => {
              setLiked(!isLiked)
              setTimeout(() => {
                toggleLike(feed._id)
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
              close()
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
                markAllRead(feed._id, feed.id)
              }, 100)
            }}
            text='Discard stories' />
        </View>
      </View>
    </View>
  )
}
