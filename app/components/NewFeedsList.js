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
import TextButton from './TextButton'
import { hslString } from '../utils/colors'
import { feeds } from '../utils/feeds'

const textStyles = {
  fontFamily: 'IBMPlexSans',
  fontSize: 18,
  lineHeight: 24,
  marginTop: 9,
  textAlign: 'left',
  color: hslString('rizzleText')
}
const boldStyles = {
  fontFamily: 'IBMPlexSans-Bold'
}
const headerStyles = {
  ...textStyles,
  fontFamily: 'IBMPlexSerif',
  marginTop: 18
}

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

  return (
    <Fragment>
      <ScrollView
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'flex-start',
          backgroundColor: hslString('rizzleBG'),
          paddingLeft: Dimensions.get('window').width * 0.05,
          paddingRight: Dimensions.get('window').width * 0.05
          // marginTop: margin
        }}
        style={{
          backgroundColor: hslString('rizzleBG'),
          flex: 1
        }}>
        <StatusBar
          animated={true}
          barStyle="dark-content"
          showHideTransition="slide"/>
        <View style={{
          marginTop: 55,
          marginBottom: 64,
          width: Dimensions.get('window').width * 0.9
        }}>
          <Heading
            title='Add Some Feeds'
            showClose={true}
            onClose={() => {
              props.close()
            }}
          />
          <Text style={textStyles}>To get you started, take a look at this list of our favourite feeds, and select any that look interesting.</Text>
          <Text style={{
            ...textStyles,
            marginBottom: 9
          }}>You can also add feeds from any compatible site in Safari by using the <Text style={boldStyles}>Rizzle share extension</Text>.</Text>
          {Object.keys(feeds).map((category, index) => (
            <View key={`category-${index}`}>
              <View style={{
                borderBottomColor: hslString('rizzleText'),
                borderBottomWidth: 1
              }}>
                <Text style={headerStyles}>{category}</Text>
              </View>
              { feeds[category].map((feed, index, feeds) => <FeedToggle
                  feed={feed}
                  toggleFeedSelected={toggleFeedSelected}
                  key={`feed-${index}`}
                  isLast={index === feeds.length - 1}
                />) }
            </View>
          ))}
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
              type: 'FEEDS_ADD_FEEDS',
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
    color: isSelected ? hslString('rizzleBG') : hslString('rizzleText')
  }
  const descriptionStyles = {
    ...textStyles,
    marginTop: 0,
    color: isSelected ? hslString('rizzleBG') : hslString('rizzleText')
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