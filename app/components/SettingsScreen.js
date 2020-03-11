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
import { Header } from 'react-navigation-stack'
import Heading from './Heading'
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


export default function SettingsScreen (props) {
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

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: hslString('rizzleBG')
      }}
      testID='settings-screen'
    >
      <Heading />
    </View>
)
}
