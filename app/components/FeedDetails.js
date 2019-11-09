import React, { Fragment } from 'react'
import {
  Dimensions,
  ScrollView,
  StatusBar,
  Text,
  View
} from 'react-native'
import Svg, {Circle, Polyline, Path, Line} from 'react-native-svg'
import Animated from 'react-native-reanimated'
import TextButton from './TextButton'
import { hslString } from '../utils/colors'



export default function FeedDetails ({ feed, markAllRead, unsubscribe, clearReadItems, filterItems, navigation, toggleMute, toggleLike }) {
  const screenWidth = Dimensions.get('window').width
  const margin = screenWidth * 0.03
  const bold = {
    fontFamily: 'IBMPlexMono-Bold',
    color: hslString(feed.color, 'desaturated')
  }
  const italic = {
    fontFamily: 'IBMPlexMono-LightItalic'
  }
  const readingTimeMins = Math.floor(feed.readingTime / 60)
  const readingTimeHours = Math.floor(readingTimeMins / 60)
  const readingTimeString = (readingTimeHours > 0 ?
    (readingTimeHours + ' hour' + (readingTimeHours === 1 ? ' ' : 's ')) : '') +
    (readingTimeMins > 0 ?
      (readingTimeHours > 0 ? readingTimeMins % 60 : readingTimeMins) + ' minute' + (readingTimeMins === 1 ? '' : 's') :
      feed.readingTime + ' seconds')
  const avgReadingTime = Math.round(feed.readingTime / feed.numRead)
  const feedStats = (
    <Text style={{
      color: '#666666',
      fontFamily: 'IBMPlexMono-Light',
      fontSize: 14,
      // marginTop: margin * 2,
      marginBottom: margin,
      textAlign: 'center'
    }}>You’ve read
      <Text style={bold}> {feed.numRead} </Text>
      {feed.numRead === 1 ? 'story' : 'stories'} from
      <Text style={italic}> {feed.title}</Text>
      {feed.numRead > 0 &&
        <Text> over the course of
          <Text style={bold}> {readingTimeString}</Text>.
          It takes you an average of
          <Text style={bold}> {avgReadingTime} seconds </Text>
          to read each story
        </Text>
      }.
      </Text>)

  const buttonStyle = {
    backgroundColor: hslString(feed.color, 'desaturated'),
    padding: margin*.5,
    color: 'white',
    // flex: 1,
    borderRadius: 8,
    // marginRight: margin,
    marginTop: margin,
    width: screenWidth / 2 - margin * 1.5
  }
  const buttonTextStyle = {
    color: 'white',
    fontFamily: 'IBMPlexMono-Light',
    fontSize: 16,
    textAlign: 'center'
  }

  const likeIcon = <Svg
      height='32'
      width='32'>
      <Path
        d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'
        strokeWidth={2}
        stroke={ feed.isLiked ? 'white' : hslString('rizzleText') }
        fill={ feed.isLiked ? 'white' : 'none' }
      />
    </Svg>

  const muteIcon = <Svg
      height='32'
      width='32'>
      <Path
        d='M11 5L6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6'
        strokeWidth={2}
        stroke={ feed.isMuted ? 'white' : hslString('rizzleText') }
        fill={ feed.isMuted ? 'white' : 'none' }
      />
    </Svg>

  const discardAllIcon = <Svg
      height='32'
      width='24'
      fill='none'
      stroke={hslString('rizzleText')}
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'>
      <Polyline
        points='3 6 5 6 21 6' />
      <Path
        d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
      <Line
        x1='10'
        y1='11'
        x2='10'
        y2='17' />
      <Line
        x1='14'
        y1='11'
        x2='14'
        y2='17' />
    </Svg>

  const unsubscribeIcon = <Svg
      width='32'
      height='32'
      fill='none'
      stroke={hslString('rizzleText')}
      strokeWidth='3'
      strokeLinecap='round'
      strokeLinejoin='round'>
      <Line x1='18' y1='6' x2='6' y2='18' />
      <Line x1='6' y1='6' x2='18' y2='18' />
    </Svg>

  const readIcon = <Svg
      height='32'
      width='32'>
      <Path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        strokeWidth={2}
        stroke={hslString('rizzleText')}
        fill="none"
      />
      <Circle
        cx="12"
        cy="12"
        r="3"
        strokeWidth={2}
        stroke={hslString('rizzleText')}
        fill='none'
      />
    </Svg>

  return (
  <ScrollView
    contentContainerStyle={{
      flex: 1,
      padding: margin
    }}>
    <Animated.View style={{
      flex: 1,
      justifyContent: 'space-between',
      // opacity: interpolate(this.expandAnim, {
      //   inputRange: [0, 0.8, 1],
      //   outputRange: [0, 0, 1]
      // }),
    }}>
      { feed.description && feed.description.length > 0 ?
        <Fragment>
          <Text style={{
            color: '#666666',
            fontFamily: 'IBMPlexSans-Bold',
            fontSize: 18,
            textAlign: 'center'
          }}>{ feed.description }</Text>
          <View style={{
            height: 1,
            backgroundColor: hslString('rizzleText'),
            opacity: 0.2,
            marginBottom: margin
          }} />
        </Fragment> : null
      }
      { feedStats }
      <View style={{
        alignItems: 'flex-end'
      }}>
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: 10
        }}>
          <TextButton
            buttonStyle={{
              minWidth: screenWidth / 2 - margin * 1.51,
              marginRight: margin,
              marginBottom: margin
            }}
            icon={discardAllIcon}
            onPress={() => {
              markAllRead(feed._id, feed.id, Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000))
            }}
            text="Discard old" />
          <TextButton
            buttonStyle={{
              minWidth: screenWidth / 2 - margin * 1.51,
              marginBottom: margin
            }}
            icon={discardAllIcon}
            onPress={() => {
              markAllRead(feed._id, feed.id)
            }}
            text="Discard all" />
          <TextButton
            buttonStyle={{
              minWidth: screenWidth / 2 - margin * 1.51,
              marginRight: margin,
              marginBottom: margin
            }}
            icon={unsubscribeIcon}
            onPress={() => {
              unsubscribe(feed._id)
            }}
            text="Unsubscribe" />
          <TextButton
            buttonStyle={{
              minWidth: screenWidth / 2 - margin * 1.51,
              marginBottom: margin
            }}
            icon={readIcon}
            onPress={() => {
              console.log('Pressed Go to items ' + feed._id)
              clearReadItems()
              filterItems(feed._id)
              navigation.navigate('Items')
              StatusBar.setHidden(false)
            }}
            text="Read items" />
          <TextButton
            buttonStyle={{
              minWidth: screenWidth / 2 - margin * 1.51,
              marginRight: margin
            }}
            icon={muteIcon}
            isInverted={feed.isMuted}
            onPress={() => {
              console.log('Mute')
              toggleMute(feed._id)
            }}
            text="Mute" />
          <TextButton
            buttonStyle={{
              minWidth: screenWidth / 2 - margin * 1.51
            }}
            icon={likeIcon}
            isInverted={feed.isLiked}
            onPress={() => {
              console.log('Like')
              toggleLike(feed._id)
            }}
            text="Like" />
        </View>
      </View>
    </Animated.View>
  </ScrollView>
  )
}
