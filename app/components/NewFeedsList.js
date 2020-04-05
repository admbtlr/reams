import React, { useEffect, useState, Fragment } from 'react'
import { useDispatch } from 'react-redux'
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Svg, {Path} from 'react-native-svg'
import { ADD_FEEDS } from '../store/feeds/types'
import TextButton from './TextButton'
import XButton from './XButton'
import { fontSizeMultiplier } from '../utils'
import { hslString } from '../utils/colors'
import {feeds} from '../utils/feeds/feeds'
import { textInfoBoldStyle } from '../utils/styles'
import { rgba } from 'react-native-image-filter-kit'
// import {culture} from '../utils/feeds/culture'

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

const art = {
  title: 'Art',
  feeds: feeds.filter(f => f.category === 'art')
}
const business = {
  title: 'Business',
  name: 'business',
  feeds: feeds.filter(f => f.category === 'business')
}
const culture = {
  title: 'Culture',
  name: 'culture',
  feeds: feeds.filter(f => f.category === 'culture')
}
const design = {
  title: 'Design',
  name: 'design',
  feeds: feeds.filter(f => f.category === 'design')
}
const future = {
  title: 'Future',
  name: 'future',
  feeds: feeds.filter(f => f.category === 'future')
}
const politics = {
  title: 'Politics',
  name: 'politics',
  feeds: feeds.filter(f => f.category === 'politics')
}
const technology = {
  title: 'Technology',
  name: 'technology',
  feeds: feeds.filter(f => f.category === 'technology')
}

const scrollY = new Animated.Value(0)

export default function NewFeedsList (props) {
  const [selectedFeeds, setFeeds] = useState([])
  const [expandedFeedSets, setExpandedFeedSets] = useState([])
  const [headerHeight, setHeaderHeight] = useState(100)
  const dispatch = useDispatch()
  // let headerExpanded = 

  const toggleFeedSelected = (feed, isSelected) => {
    if (isSelected) {
      let sf = selectedFeeds.map(f => f)
      sf.push(feed)
      setFeeds(sf)
    } else {
      setFeeds(selectedFeeds.filter(f => f.url !== feed.url))
    }
  }

  const toggleExpandedFeedSet = (feedSetName) => {
    let feedSets = [ ...expandedFeedSets ]
    if (feedSets.indexOf(feedSetName) !== -1) {
      feedSets = feedSets.filter(fs => fs !== feedSetName)
    } else {
      feedSets.push(feedSetName)        
    }
    return setExpandedFeedSets(feedSets)
  }

  const addFeeds = () => {
    console.log(selectedFeeds)
    dispatch({
      type: ADD_FEEDS,
      feeds: selectedFeeds
    })
    props.close()
  }

  // useEffect(() => {
  //   if (selectedFeeds.length > 0) {
  //     Animated.spring(buttonAnim, {
  //       toValue: 0,
  //       duration: 300,
  //       useNative: true
  //     }).start()
  //   } else {
  //     Animated.spring(buttonAnim, {
  //       toValue: margin * 4,
  //       duration: 300,
  //       useNative: true
  //     }).start()
  //   }
  // })

  const hashtag = <Svg
    width={32 * fontSizeMultiplier()}
    height={32 * fontSizeMultiplier()}
    viewBox='0 0 32 32'
    style={{
      top: -2,
      left: -2
    }}>
      <Path d="M11.791,19.538 L9.307,19.538 L9.307,17.008 L12.251,17.008 L12.596,14.938 L10.181,14.938 L10.181,12.408 L13.056,12.408 L13.838,7.946 L16.529,7.946 L13.7,24 L11.009,24 L11.791,19.538 Z M18.3,7.946 L20.991,7.946 L20.209,12.408 L22.693,12.408 L22.693,14.938 L19.749,14.938 L19.404,17.008 L21.819,17.008 L21.819,19.538 L18.944,19.538 L18.162,24 L15.471,24 L18.3,7.946 Z" 
        fill={ hslString('rizzleBG')}
        fill-rule="nonzero" />
    </Svg>

  const screenWidth = Dimensions.get('window').width

  return (
    <View>
      <XButton
        onPress={props.close}
        style={{
          top: screenWidth * 0.025,
          right: screenWidth * 0.05 + 1
        }}
      />
      <Animated.ScrollView
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'flex-start',
          backgroundColor: hslString('logo1'),
          paddingLeft: screenWidth * 0.05,
          paddingRight: screenWidth * 0.05
          // marginTop: margin
        }}
        onScroll={Animated.event(
          [{ nativeEvent: {
            contentOffset: {
              y: scrollY
            }
          }}],
          { useNativeDriver: true }
        )}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        style={{
          backgroundColor: hslString('logo1'),
          flex: 1
        }}>
        <StatusBar
          animated={true}
          barStyle="dark-content"
          showHideTransition="slide"/>
        <View style={{
          marginTop: 200,
          marginBottom: 64,
          width: screenWidth * 0.9
        }}>
          <Text style={{
            ...textStyles(),
            ...boldStyles,
            marginBottom: 32
          }}>1. Use the Rizzle Share Extension to add sites straight from Safari. Just tap the share button in your browser and look for the Rizzle icon.</Text>
          <Text style={{
            ...textStyles(),
            ...boldStyles,
            marginBottom: 36
          }}>2. Select your favourite topics to find more sites to add:</Text>
          {
            [
              technology,
              politics, 
              culture, 
              art, 
              business, 
              design, 
              future
            ].map((feedSet, i) => <View key={`feedSet-${i}`}>
              <TextButton
                buttonStyle={{ marginBottom: 36 }}
                iconBg={true}
                iconCollapsed={hashtag}
                iconExpanded={hashtag}
                key={feedSet.name}
                name={feedSet.name}
                text={feedSet.title}
                isExpandable={true}
                isExpanded={expandedFeedSets.indexOf(feedSet.name) !== -1}
                isGroup={true}
                onExpand={() => toggleExpandedFeedSet(feedSet.name)}
                renderExpandedView={() => <FeedList 
                  feeds={feedSet.feeds}
                  toggleFeedSelected={toggleFeedSelected}
                />} />
            </View>)
          }
          <TextButton
            isDisabled={ selectedFeeds.length === 0 }
            isInverted={true}
            onPress={addFeeds}
            text={`Add ${selectedFeeds.length > 0 ? selectedFeeds.length : ''} site${selectedFeeds.length !== 1 ? 's' : ''} to my feed`}
          />
        </View>
      </Animated.ScrollView>
      <Animated.View style={{
          position: 'absolute',
          left: screenWidth * 0.05,
          top: screenWidth * 0.025,
          zIndex: 10,
          opacity: scrollY.interpolate({ 
            inputRange: [0, headerHeight * 0.9, headerHeight],
            outputRange: [0, 0, 1] 
          })
      }}>
        <TextButton 
          disabled={selectedFeeds.length === 0}
          onPress={addFeeds}
          text={`Add ${selectedFeeds.length} Sites`}
        />
      </Animated.View>
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 5,
      }}>
        <View style={{
          backgroundColor: hslString('logo1', '', 0.98),
          paddingTop: screenWidth * 0.1
        }}>
        </View>
        <Animated.View 
          onLayout={(ne) => {
            setHeaderHeight(ne.nativeEvent.layout.height)
          }}
          style={{
            top: -screenWidth * 0.025,
            backgroundColor: hslString('logo1'),
            transform: [{
              translateY: scrollY.interpolate({
                inputRange: [0, headerHeight],
                outputRange: [0, -(headerHeight * 0.5)],
                extrapolate: 'clamp'
              })
            }, {
              scaleY: scrollY.interpolate({
                inputRange: [0, headerHeight],
                outputRange: [1, 0],
                extrapolate: 'clamp'
              })
            }]
        }}>
          <Animated.View style={{
            width: '90%',
            marginLeft: '5%',
            borderBottomWidth: 1,
            paddingBottom: screenWidth * 0.05,
            borderBottomColor: 'rgba(255, 255, 255, 0.5)',
          }}>
            <Animated.Text style={{
              fontFamily: 'PTSerif-Bold',
              color: 'white',
              fontSize: 40,
              lineHeight: 40,
              opacity: scrollY.interpolate({
                inputRange: [0, 50],
                outputRange: [1, 0]
              }),
              textAlign: 'center',        
            }}>Read More About Stuff You Love</Animated.Text>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  )
}

const FeedList = ({feeds, toggleFeedSelected}) => {
  return (
  <View style={{
    marginTop: 16,
    paddingTop: 0
  }}>
    { feeds.map((feed, index) => <FeedToggle 
        key={`feed-toggle-${index}`}
        feed={feed}
        toggleFeedSelected={toggleFeedSelected}
      />)}
  </View>
)}

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
      style={{
          flexDirection: 'row',
          backgroundColor: isSelected ? feed.color || hslString('rizzleText') : 'transparent',
          paddingTop: 16,
          paddingRight: 16
          // height: 300
      }}>
        <View style={{
          width: 65 * fontSizeMultiplier(),
          height: 70
        }}>
          {feed.favicon && <Image
            // resizeMode='contain'
            source={feed.favicon.source}
            style={{
              // flex: 1,
              marginLeft: 16,
              marginTop: 8,
              height: 32,
              width: 32
            }}
          />}
        </View>
        <View style={{
          flexDirection: 'column',
          flex: 1
        }}>
          <Text style={{
            ...textStyles(),
            ...boldStyles,
            color: isSelected ? 'white' : hslString('rizzleText'),
            fontSize: 20
          }}>{feed.title}</Text>
          <Text style={{
            ...textStyles(),
            color: isSelected ? 'white' : hslString('rizzleText'),
            opacity: 0.7,
            fontSize: 16,
            marginTop: 0,
            marginBottom: 24
          }}>{feed.description}</Text>
        </View>
      </TouchableOpacity>
      <View style={{
        height: 1,
        paddingLeft: 16,
        paddingRight: 16,
        backgroundColor: isSelected || isLast ? 'transparent' : 'rgba(0,0,0,0.1)',
      }} />
    </Fragment>
  )
}