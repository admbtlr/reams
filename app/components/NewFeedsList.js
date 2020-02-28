import React, { useEffect, useState, Fragment } from 'react'
import { useDispatch } from 'react-redux'
import {
  Animated,
  Dimensions,
  Image,
  InteractionManager,
  ScrollView,
  StatusBar,
  StatusBarAnimation,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Svg, {Circle, Group, Path} from 'react-native-svg'
import { ADD_FEEDS } from '../store/feeds/types'
import TextButton from './TextButton'
import { fontSizeMultiplier } from '../utils'
import { hslString } from '../utils/colors'
// import {technology} from '../utils/feeds/technology'

const textStyles = () => ({
  fontFamily: 'IBMPlexSans',
  fontSize: 18,
  lineHeight: 24,
  marginTop: 9,
  textAlign: 'left',
  color: hslString('rizzleText')
})
const boldStyles = {
  fontFamily: 'IBMPlexSans-Bold'
}
const headerStyles = () => ({
  ...textStyles(),
  fontFamily: 'IBMPlexSerif',
  marginTop: 18
})

const screenWidth = Dimensions.get('window').width
const margin = screenWidth * 0.05

const buttonAnim = new Animated.Value(margin * 4)


export default function NewFeedsList (props) {
  const [selectedFeeds, setFeeds] = useState([])
  const dispatch = useDispatch()

  const toggleFeedSelected = (feed, isSelected) => {
    if (isSelected) {
      let sf = selectedFeeds.map(f => f)
      sf.push(feed)
      setFeeds(sf)
    } else {
      setFeeds(selectedFeeds.filter(f => f.url !== feed.url))
    }
  }

  useEffect(() => {
    if (selectedFeeds.length > 0) {
      Animated.spring(buttonAnim, {
        toValue: 0,
        duration: 300,
        useNative: true
      }).start()
    } else {
      Animated.spring(buttonAnim, {
        toValue: margin * 4,
        duration: 300,
        useNative: true
      }).start()
    }
  })

  const hashtag = <Svg
    width='32'
    height='32'
    viewBox='0 0 32 32'
    style={{
      top: -4,
      left: -4
    }}>
      <Circle
        fill="#000000" cx="16" cy="16" r="16" />
      <Path d="M11.791,19.538 L9.307,19.538 L9.307,17.008 L12.251,17.008 L12.596,14.938 L10.181,14.938 L10.181,12.408 L13.056,12.408 L13.838,7.946 L16.529,7.946 L13.7,24 L11.009,24 L11.791,19.538 Z M18.3,7.946 L20.991,7.946 L20.209,12.408 L22.693,12.408 L22.693,14.938 L19.749,14.938 L19.404,17.008 L21.819,17.008 L21.819,19.538 L18.944,19.538 L18.162,24 L15.471,24 L18.3,7.946 Z" fill="#F0F0F0" fill-rule="nonzero" />
    </Svg>

  const feedList = (feeds) => (
    <View style={{
      marginTop: 16,
      paddingTop: 16,
      paddingRight: 16
    }}>
      { feeds.map(feed => (
        <View style={{
          flexDirection: 'row'
        }}>
          <View style={{
            width: 70 * fontSizeMultiplier(),
            height: 70
          }}>
            { /* icon goes here */ }
          </View>
          <View style={{
            flexDirection: 'column',
            flex: 1
          }}>
            <Text style={{
              ...textStyles(),
              ...boldStyles,
              fontSize: 20
            }}>{feed.title}</Text>
            <Text style={{
              ...textStyles(),
              fontSize: 16,
              marginTop: 0,
              marginBottom: 24
            }}>{feed.description}</Text>
          </View>
        </View>
      ))}
    </View>
  )


  return (
    <Fragment>
      <ScrollView
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'flex-start',
          backgroundColor: hslString('logo1'),
          paddingLeft: Dimensions.get('window').width * 0.05,
          paddingRight: Dimensions.get('window').width * 0.05
          // marginTop: margin
        }}
        style={{
          backgroundColor: hslString('logo1'),
          flex: 1
        }}>
        <StatusBar
          animated={true}
          barStyle="dark-content"
          showHideTransition="slide"/>
        <View style={{
          marginTop: 30,
          marginBottom: 64,
          width: Dimensions.get('window').width * 0.9
        }}>
          <Heading
            title='Read More About Stuff You Love'
            showClose={true}
            isBigger={true}
            isWhite={true}
            onClose={() => {
              props.close()
            }}
          />
          <Text style={{
            ...textStyles(),
            ...boldStyles
          }}>1. Use the Rizzle Share Extension to add sites straight from Safari. Just tap the share button in your browser and look for the Rizzle icon.</Text>
          <Text style={{
            ...textStyles(),
            ...boldStyles
          }}>2. Select your favourite topics to find more sites to add:</Text>
            <View>
              <TextButton
                iconCollapsed={hashtag}
                iconExpanded={hashtag}
                text='Technology'
                isExpandable={true}
                renderExpandedView={() => <View />} />
            </View>
        </View>
      </ScrollView>
      <Animated.View style={{
        position: 'absolute',
        bottom: margin * 2,
        left: margin,
        width: screenWidth - margin * 2,
        justifyContent: 'center',
        transform: [
          { translateY: buttonAnim }
        ]
      }}>
        <TextButton
          text="Show me the stories"
          onPress={() => {
            dispatch({
              type: ADD_FEEDS,
              feeds: selectedFeeds
            })
            props.navigation.navigate('Items')
          }}
          buttonStyle={{
            marginLeft: margin,
            marginRight: margin
          }}
        />
      </Animated.View>
    </Fragment>
  )
}

const FeedToggle = (props) => {
  const [isSelected, setSelected] = useState(false)
  const { feed, isLast, toggleFeedSelected } = props
  const buttonStyles = {
    paddingTop: 9,
    paddingBottom: 18,
    backgroundColor: isSelected ? hslString('rizzleText') : 'transparent',
    marginLeft: 0 - margin,
    marginRight: 0 - margin,
    paddingLeft: margin,
    paddingRight: margin
  }
  const titleStyles = {
    fontFamily: 'IBMPlexSans-Bold',
    fontSize: 24,
    color: isSelected ? hslString('bodyBG') : hslString('rizzleText')
  }
  const descriptionStyles = {
    ...textStyles(),
    marginTop: 0,
    color: isSelected ? hslString('bodyBG') : hslString('rizzleText')
  }
  return (
    <Fragment>
      <TouchableOpacity
        onPress={() => {
          toggleFeedSelected(feed, !isSelected)
          return setSelected(!isSelected)
        }}
        style={buttonStyles}>
        <Text style={titleStyles}>{feed.title}</Text>
        <Text style={descriptionStyles}>{feed.description}</Text>
      </TouchableOpacity>
      <View style={{
        height: 1,
        backgroundColor: isSelected || isLast ? 'transparent' : 'rgba(0,0,0,0.1)'
      }} />
    </Fragment>
  )
}