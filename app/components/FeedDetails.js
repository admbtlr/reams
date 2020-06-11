import React, { useState } from 'react'
import {
  Dimensions,
  ScrollView,
  Switch,
  Text,
  View
} from 'react-native'
import Svg, {Circle, Polyline, Path, Line} from 'react-native-svg'
import TextButton from './TextButton'
import NavButton from './NavButton'
import { hslString } from '../utils/colors'
import { isIphoneX, isIpad, fontSizeMultiplier } from '../utils'
import { textInfoStyle, textInfoBoldStyle } from '../utils/styles'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import autoMergeLevel1 from 'redux-persist/es/stateReconciler/autoMergeLevel1'

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

const SwitchRow = ({icon, label, value, onValueChange}) => <View style={{
  flex: 0,
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginBottom: margin,
  paddingTop: margin,
  borderTopColor: hslString('rizzleText', '', 0.2),
  borderTopWidth: 1
}}>
  <View style={{
    width: 16,
    marginLeft: 8 // the internal padding of a TextButton, to align icons
  }}>{ icon }</View>
  <Text style={{
    ...textInfoStyle(),
    flex: 1
  }}>{label}</Text>
  <Switch 
    onValueChange={onValueChange}
    trackColor={{
      false: hslString('rizzleText', '', 0.3),
      true: hslString('rizzleText')
    }}
    value={value}
  />
</View>



export default function FeedDetails ({ feed, markAllRead, unsubscribe, clearReadItems, close, filterItems, navigation, setIndex, toggleMute, toggleLike, toggleMercury }) {
  const [isLiked, setLiked] = useState(feed.isLiked)
  const [isMuted, setMuted] = useState(feed.isMuted)
  const [isFiltered, setFiltered] = useState(feed.isFiltered)
  const [isMercury, setMercury] = useState(feed.isMercury)

  const bold = {
    fontFamily: 'IBMPlexSans-Bold',
    // color: hslString(feed.color, 'darkmodable')
  }
  const italic = {
    fontFamily: 'IBMPlexSans-LightItalic'
  }
  const totalReadingTime = createTimeString(feed.readingTime)
  const avgReadingTime = createTimeString(Math.round(feed.readingTime / feed.numRead))
  const feedStats = (
    <Text style={{
      color: hslString('rizzleText'),
      fontFamily: 'IBMPlexSans-Light',
      fontSize: 16 * fontSizeMultiplier(),
      lineHeight: 24 * fontSizeMultiplier(),
      marginBottom: margin,
      textAlign: 'left'
    }}>You’ve read {feed.numRead} {feed.numRead === 1 ? 'story' : 'stories'} from
      <Text style={bold}> {feed.title}</Text>
      {feed.numRead > 0 &&
        <Text> over the course of {totalReadingTime}.
          It takes you an average of {avgReadingTime} to read each story
        </Text>
      }.
      </Text>)

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

  const filterIcon = <Svg
    viewBox='0 0 32 32'
    height={ 32 * fontSizeMultiplier() }
    width={ 32 * fontSizeMultiplier() }
    fill='none'
    stroke={hslString('rizzleText')}
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    style={{
      top: 3
    }}>
    <Line x1='4' y1='21' x2='4' y2='14' />
    <Line x1='4' y1='10' x2='4' y2='3' />
    <Line x1='12' y1='21' x2='12' y2='12' />
    <Line x1='12' y1='8' x2='12' y2='3' />
    <Line x1='20' y1='21' x2='20' y2='16' />
    <Line x1='20' y1='12' x2='20' y2='3' />
    <Line x1='1' y1='14' x2='7' y2='14' />
    <Line x1='9' y1='8' x2='15' y2='8' />
    <Line x1='17' y1='16' x2='23' y2='16' />
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

  return (
    <View style={{
      justifyContent: 'flex-start',
      margin: 0,
      padding: margin
    }}>
        <View style={{
          flex: -1,
          justifyContent: 'center'
        }}>
          { feedStats }
        </View>
      <View style={{
        flex: 0,
        // backgroundColor: 'red'
        // alignItems: 'flex-end'
      }}>
        <NavButton
          hasTopBorder={true}
          onPress={() => {
            clearReadItems()
            filterItems(feed._id)
            setIndex(0)
            navigation.navigate('Items')
          }}
          viewStyle={{ marginBottom: 0 }}
        >
          <Text 
            numberOfLines={1}
            style={{ 
              ...textInfoStyle(),
              marginLeft: 6,
              flex: 1,
            }}>Read stories from <Text style={textInfoBoldStyle()}>{feed.title}</Text></Text>
        </NavButton>
        <View style={{
            flexDirection: 'column',
            flex: 0,
            width: '100%'
          }}>
          <SwitchRow
            label='Always show full text view'
            icon={mercuryIcon}
            onValueChange={() => {
              setMercury(!isMercury)
              toggleMercury(feed._id)
            }}
            value={isMercury} />
          {/*<SwitchRow
            label='Only show stories from this feed'
            icon={filterIcon}
            onValueChange={() => {
              clearReadItems()
              setFiltered(!isFiltered)
              filterItems(isFiltered ? null : feed._id)
              setIndex(0)
            }}
          value={isFiltered} />*/}
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
            icon={unsubscribeIcon}
            noResize={true}
            onPress={() => {
              close()
              unsubscribe(feed)
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
          {/*}
          <TextButton
            isCompact={compactButtons}
            buttonStyle={{
              minWidth: '48%',
              marginRight: margin
            }}
            icon={mercuryIcon}
            isInverted={isMercury}
            noResize={true}
            onPress={() => {
              setMercury(!isMercury)
              toggleMercury(feed._id)
            }}
            text='Show full' />
          <TextButton
            isCompact={compactButtons}
            buttonStyle={{
              minWidth: '48%',
              marginBottom: margin
            }}
            icon={filterIcon}
            isInverted={isFiltered}
            noResize={true}
            onPress={() => {
              clearReadItems()
              setFiltered(!isFiltered)
              filterItems(isFiltered ? null : feed._id)
              setIndex(0)
            }}
            text='Filter stories' />
          <TextButton
            isCompact={compactButtons}
            buttonStyle={{
              minWidth: '48%',
              marginRight: margin,
              marginBottom: margin
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
          {*/}
        </View>
      </View>
    </View>
  )
}
