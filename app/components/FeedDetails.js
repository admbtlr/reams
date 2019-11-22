import React, { useState } from 'react'
import {
  Dimensions,
  StatusBar,
  Text,
  View
} from 'react-native'
import Svg, {Circle, Polyline, Path, Line} from 'react-native-svg'
import TextButton from './TextButton'
import { hslString } from '../utils/colors'
import { isIphoneX, isIpad, fontSizeMultiplier } from '../utils'

const screenWidth = Dimensions.get('window').width
const margin = screenWidth * 0.03
const compactButtons = !isIphoneX() && !isIpad()

const createTimeString = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const hours = Math.floor(mins / 60)
  return (hours > 0 ?
    (hours + ' hour' + (hours === 1 ? ' ' : 's ')) : '') +
    (mins > 0 ?
      (hours > 0 ? mins % 60 : mins) + ' minute' + (mins === 1 ? '' : 's') :
      seconds + ' seconds')
}

export default function FeedDetails ({ feed, markAllRead, unsubscribe, clearReadItems, filterItems, navigation, toggleMute, toggleLike }) {
  const [isLiked, setLiked] = useState(feed.isLiked)
  const [isMuted, setMuted] = useState(feed.isMuted)

  const bold = {
    fontFamily: 'IBMPlexMono-Bold',
    color: hslString(feed.color, 'desaturated')
  }
  const italic = {
    fontFamily: 'IBMPlexMono-LightItalic'
  }
  const totalReadingTime = createTimeString(feed.readingTime)
  const avgReadingTime = createTimeString(Math.round(feed.readingTime / feed.numRead))
  const feedStats = (
    <Text style={{
      color: '#666666',
      fontFamily: 'IBMPlexMono-Light',
      fontSize: 16 * fontSizeMultiplier(),
      // marginTop: margin * 2,
      marginBottom: margin,
      textAlign: 'center'
    }}>You’ve read
      <Text style={bold}> {feed.numRead} </Text>
      {feed.numRead === 1 ? 'story' : 'stories'} from
      <Text style={italic}> {feed.title}</Text>
      {feed.numRead > 0 &&
        <Text> over the course of
          <Text style={bold}> {totalReadingTime}</Text>.
          It takes you an average of
          <Text style={bold}> {avgReadingTime} </Text>
          to read each story
        </Text>
      }.
      </Text>)

  const likeIcon = <Svg
      viewBox='0 0 32 32'
      height={ 32 * fontSizeMultiplier() }
      width={ 32 * fontSizeMultiplier() }>
      <Path
        d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'
        strokeWidth={2}
        stroke={ isLiked ? 'white' : hslString('rizzleText') }
        fill={ isLiked ? 'white' : 'none' }
      />
    </Svg>

  const muteIcon = <Svg
      viewBox='0 0 32 32'
      height={ 32 * fontSizeMultiplier() }
      width={ 32 * fontSizeMultiplier() }>
      <Path
        d='M11 5L6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6'
        strokeWidth={2}
        stroke={ isMuted ? 'white' : hslString('rizzleText') }
        fill={ isMuted ? 'white' : 'none' }
      />
    </Svg>

  const discardAllIcon = <Svg
      viewBox='0 0 24 32'
      height={ 32 * fontSizeMultiplier() }
      width={ 24 * fontSizeMultiplier() }
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
      viewBox='0 0 32 32'
      height={ 32 * fontSizeMultiplier() }
      width={ 32 * fontSizeMultiplier() }
      fill='none'
      stroke={hslString('rizzleText')}
      strokeWidth='3'
      strokeLinecap='round'
      strokeLinejoin='round'>
      <Line x1='18' y1='6' x2='6' y2='18' />
      <Line x1='6' y1='6' x2='18' y2='18' />
    </Svg>

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

  return (
    <View style={{
      flex: 1,
      justifyContent: 'space-between',
      margin: 0,
      padding: margin
    }}>
      <View style={{
        flex: 1,
        flexDirection: 'column'
      }}>
        { feed.description && feed.description.length > 0 ?
          <View style={{
            flex: 1,
            justifyContent: 'space-around'
          }}>
            <Text style={{
              color: '#666666',
              fontFamily: 'IBMPlexSans-Bold',
              fontSize: feed.description.length > 100 ? 18 : 20,
              fontSize: (feed.description.length > 100 ? 18 : 20) *
                fontSizeMultiplier(),
              textAlign: 'center'
            }}>{ feed.description }</Text>
            <View style={{
              height: 1,
              backgroundColor: hslString('rizzleText'),
              opacity: 0.2,
              marginBottom: margin
            }} />
          </View> : null
        }
        <View style={{
          flex: 1,
          justifyContent: 'center'
        }}>
          { feedStats }
        </View>
      </View>
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
            isCompact={compactButtons}
            buttonStyle={{
              minWidth: '48%',
              marginRight: margin,
              marginBottom: margin
            }}
            icon={discardAllIcon}
            noResize={true}
            onPress={() => {
              setTimeout(() => {
                markAllRead(feed._id, feed.id, Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000))
              }, 100)
            }}
            text='Discard old' />
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
            text='Discard all' />
          <TextButton
            isCompact={compactButtons}
            buttonStyle={{
              minWidth: '48%',
              marginRight: margin,
              marginBottom: margin
            }}
            icon={unsubscribeIcon}
            noResize={true}
            onPress={() => {
              unsubscribe(feed._id)
            }}
            text='Unsubscribe' />
          <TextButton
            isCompact={compactButtons}
            buttonStyle={{
              minWidth: '48%',
              marginBottom: margin
            }}
            icon={readIcon}
            noResize={true}
            onPress={() => {
              console.log('Pressed Go to items ' + feed._id)
              clearReadItems()
              filterItems(feed._id)
              navigation.navigate('Items')
              StatusBar.setHidden(false)
            }}
            text='Read stories' />
          <TextButton
            isCompact={compactButtons}
            buttonStyle={{
              minWidth: '48%',
              marginRight: margin
            }}
            icon={muteIcon}
            isInverted={isMuted}
            noResize={true}
            onPress={() => {
              setMuted(!isMuted)
              setTimeout(() => {
                toggleMute(feed._id)
              }, 100)
            }}
            text='Mute' />
          <TextButton
            isCompact={compactButtons}
            buttonStyle={{
              minWidth: '48%'
            }}
            icon={likeIcon}
            isInverted={isLiked}
            noResize={true}
            onPress={() => {
              setLiked(!isLiked)
              setTimeout(() => {
                toggleLike(feed._id)
              }, 100)
            }}
            text='Like' />
        </View>
      </View>
    </View>
  )
}
