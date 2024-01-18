import React, { useState, Fragment } from 'react'
import { useDispatch } from 'react-redux'
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Svg, {Path} from 'react-native-svg'
import { ADD_FEED, ADD_FEEDS } from '../store/feeds/types'
import OPMLImport from './OPMLImport'
import TextButton from './TextButton'
import XButton from './XButton'
import { fontSizeMultiplier, getMargin } from '../utils'
import { hslString } from '../utils/colors'
import {feeds} from '../utils/feeds/feeds'
import { textInfoBoldStyle } from '../utils/styles'
import { rgba } from 'react-native-image-filter-kit'
import { useModal } from './ModalProvider'
import { findFeeds } from '../backends/reams'

const textStyles = () => ({
  fontFamily: 'IBMPlexSans',
  fontSize: 18 * fontSizeMultiplier(),
  lineHeight: 24 * fontSizeMultiplier(),
  marginTop: 9 * fontSizeMultiplier(),
  textAlign: 'left',
  color: hslString('rizzleText')
})
const boldStyles = {
  fontFamily: 'IBMPlexSans-Bold'
}
const headerStyles = () => ({
  ...textStyles(),
  fontFamily: 'IBMPlexSerif',
  marginTop: 18 * fontSizeMultiplier()
})

const screenWidth = Dimensions.get('window').width
const margin = getMargin()

const buttonAnim = new Animated.Value(margin * 4)

const sortByTitle = (a, b) => {
  aTitle = a.title.toUpperCase()
  bTitle = b.title.toUpperCase()
  if (aTitle < bTitle) return -1
  if (aTitle > bTitle) return 1
  return 0
}

const art = {
  title: 'Art',
  feeds: feeds.filter(f => f.category === 'art').sort(sortByTitle)
}
const business = {
  title: 'Business',
  name: 'business',
  feeds: feeds.filter(f => f.category === 'business').sort(sortByTitle)
}
const culture = {
  title: 'Culture',
  name: 'culture',
  feeds: feeds.filter(f => f.category === 'culture').sort(sortByTitle)
}
const design = {
  title: 'Design',
  name: 'design',
  feeds: feeds.filter(f => f.category === 'design').sort(sortByTitle)
}
const future = {
  title: 'Future',
  name: 'future',
  feeds: feeds.filter(f => f.category === 'future').sort(sortByTitle)
}
const politics = {
  title: 'Politics',
  name: 'politics',
  feeds: feeds.filter(f => f.category === 'politics').sort(sortByTitle)
}
const technology = {
  title: 'Technology',
  name: 'technology',
  feeds: feeds.filter(f => f.category === 'technology').sort(sortByTitle)
}

const scrollY = new Animated.Value(0)

export default function NewFeedsList (props) {
  const [selectedFeeds, setFeeds] = useState([])
  const [expandedFeedSets, setExpandedFeedSets] = useState([])
  const [headerHeight, setHeaderHeight] = useState(100)
  const dispatch = useDispatch()
  const { openModal } = useModal()
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

  const addFeeds = (feeds) => {
    console.log(feeds)
    dispatch({
      type: ADD_FEEDS,
      feeds: feeds
    })
    props.close()
  }

  const showAddFeedModal = () => {
    const modalText = [{
      text: 'Add or search for a feed',
      style: ['title']
    }]
    openModal({
      modalText,
      modalHideCancel: false,
      modalShow: true,
      inputs: [
        {
          label: 'Feed or site URL',
          name: 'feedUrl',
          type: 'text',
        }
      ],
      modalOnOk: async (state) => {
        if (state.feedUrl) {
          const url = state.feedUrl.indexOf('http') === 0 ? state.feedUrl : 'https://' + state.feedUrl
          try {
            const feeds = await findFeeds(url)
            console.log(feeds)
            if (feeds.length > 0) {
              dispatch({
                type: ADD_FEED,
                feed: feeds[0]
              })
            }
          } catch(err) {
            console.log(err)
          }
        }
        console.log('modalOnOk')
      },
      showKeyboard: true
    })
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

  const screenWidth = Platform.OS === 'web' ? '600' : Dimensions.get('window').width
  const collapsedHeaderHeight = getMargin() + 32 * fontSizeMultiplier() // allow space for the TextButton


  return (
    <View>
      <XButton
        onPress={props.close}
        style={{
          top: getMargin() / 2,
          right: getMargin() / 2
        }}
      />
      <Animated.ScrollView
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'flex-start',
          backgroundColor: hslString('logo1'),
          paddingLeft: getMargin(),
          paddingRight: getMargin()
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
          marginTop: headerHeight + collapsedHeaderHeight + getMargin(),
          marginBottom: 64 * fontSizeMultiplier(),
          paddingHorizontal: props.isPortrait ? 0 : getMargin() * 2,
          width: screenWidth * (props.isPortrait ? 0.9 : 1)
        }}>
          <Text style={{
            ...textStyles(),
            ...boldStyles,
            marginBottom: 32 * fontSizeMultiplier()
          }}>There are four ways to add new feeds to Already:</Text>
          <Text style={{
            ...textStyles(),
            marginBottom: 32 * fontSizeMultiplier()
          }}>1. Use the Already Share Extension to add sites straight from Safari. Just tap the share button in your browser and look for the Already icon.</Text>
          <TouchableOpacity
            onPress={showAddFeedModal}
          >
            <Text style={{
                ...textStyles(),
                marginBottom: 32 * fontSizeMultiplier()
              }}
            >2. <Text style={{ 
              textDecorationLine: 'underline' 
              }}>Enter a feed URL or the URL of a site where you want to search for a feed</Text></Text>
          </TouchableOpacity>
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap'
          }}>
            <Text style={{
              ...textStyles(),
              marginBottom: 32 * fontSizeMultiplier()
            }}>2. </Text><OPMLImport 
              textStyles={{
                ...textStyles(),
                textDecorationLine: 'underline'
              }}
              addFeeds={addFeeds}
            />
          </View>
          <Text style={{
            ...textStyles(),
            marginBottom: 36 * fontSizeMultiplier()
          }}>3. Select your favourite topics to find new feeds:</Text>
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
                buttonStyle={{ marginBottom: 36 * fontSizeMultiplier() }}
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
                expandedView={<FeedList 
                  feeds={feedSet.feeds}
                  toggleFeedSelected={toggleFeedSelected}
                />}
              />
            </View>)
          }
        </View>
      </Animated.ScrollView>
      <Animated.View style={{
          position: 'absolute',
          left: getMargin(),
          top:  getMargin() /2,
          zIndex: 10,
          opacity: selectedFeeds.length === 0 ? 0 :
            scrollY.interpolate({ 
              inputRange: [0, headerHeight * 0.4, headerHeight * 0.5],
              outputRange: [0, 0, 1] 
            })
      }}>
        <TextButton 
          isDisabled={selectedFeeds.length === 0}
          isCompact={true}
          onPress={() => addFeeds(selectedFeeds) }
          text={`Add ${selectedFeeds.length > 0 ? selectedFeeds.length : ''} Site${selectedFeeds.length === 1 ? '' : 's'}`}
        />
      </Animated.View>
      <View 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 5,
        }}
      >
        <View style={{
          backgroundColor: hslString('logo1', '', 0.98),
          paddingTop: collapsedHeaderHeight
        }}>
        </View>
        <Animated.View 
          onLayout={(ne) => {
            setHeaderHeight(ne.nativeEvent.layout.height)
          }}
          style={{
            top: 0 - getMargin() / 2,
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
            paddingBottom: getMargin(),
            borderBottomColor: 'rgba(255, 255, 255, 0.5)',
          }}>
            <Animated.Text style={{
              fontFamily: 'PTSerif-Bold',
              color: 'white',
              fontSize: 40 * fontSizeMultiplier(),
              lineHeight: 48 * fontSizeMultiplier(),
              opacity: scrollY.interpolate({
                inputRange: [0, 50],
                outputRange: [1, 0]
              }),
              textAlign: 'center',        
            }}>Add Feeds</Animated.Text>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  )
}

const FeedList = ({feeds, toggleFeedSelected}) => {
  return (
  <View style={{
    marginTop: 16 * fontSizeMultiplier(),
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
    fontSize: 24 * fontSizeMultiplier(),
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
          paddingTop: 16 * fontSizeMultiplier(),
          paddingRight: 16 * fontSizeMultiplier()
          // height: 300
      }}>
        <View style={{
          width: 65,
          height: 70
        }}>
          {feed.favicon && <Image
            // resizeMode='contain'
            source={feed.favicon.source}
            style={{
              // flex: 1,
              marginLeft: 16 * fontSizeMultiplier(),
              marginTop: 8 * fontSizeMultiplier(),
              height: 32 * fontSizeMultiplier(),
              width: 32 * fontSizeMultiplier()
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
            fontSize: 20 * fontSizeMultiplier()
          }}>{feed.title}</Text>
          <Text style={{
            ...textStyles(),
            color: isSelected ? 'white' : hslString('rizzleText'),
            opacity: 0.7,
            fontSize: 16 * fontSizeMultiplier(),
            marginTop: 0,
            marginBottom: 24 * fontSizeMultiplier()
          }}>{feed.description}</Text>
        </View>
      </TouchableOpacity>
      <View style={{
        height: 1,
        paddingLeft: 16 * fontSizeMultiplier(),
        paddingRight: 16 * fontSizeMultiplier(),
        backgroundColor: isSelected || isLast ? 'transparent' : 'rgba(0,0,0,0.1)',
      }} />
    </Fragment>
  )
}