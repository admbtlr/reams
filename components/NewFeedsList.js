import React, { useState, Fragment, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
  Animated,
  Dimensions,
  Image,
  Platform,
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
import { getMargin } from '../utils/dimensions'
import { fontSizeMultiplier } from '../utils/dimensions'
import { hslString } from '../utils/colors'
import {feeds} from '../utils/feeds/feeds'
import { textInfoBoldStyle } from '../utils/styles'
import { rgba } from 'react-native-image-filter-kit'
import { useModal } from './ModalProvider'
import { findFeeds } from '../backends/reams'
import { ADD_MESSAGE } from '../store/ui/types'
import { getFeedsById, supabase } from '@/storage/supabase'
import reamsFavourites from '@/utils/reams-favouries'
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry'

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

const margin = getMargin()

const sortByTitle = (a, b) => {
  aTitle = a.title.toUpperCase()
  bTitle = b.title.toUpperCase()
  if (aTitle < bTitle) return -1
  if (aTitle > bTitle) return 1
  return 0
}

const scrollY = new Animated.Value(0)

export default function NewFeedsList (props) {
  const [selectedFeeds, setFeeds] = useState([])
  const [expandedFeedSets, setExpandedFeedSets] = useState([])
  const [headerHeight, setHeaderHeight] = useState(100)
  const [favourites, setFavourites] = useState([])
  const dispatch = useDispatch()
  const { openModal } = useModal()
  const favouriteIds = reamsFavourites.feeds 

  useEffect(() => {
    const fetchFavourites = async () => {
      console.log('fetching favourites: ', favouriteIds) 
      const feeds = await getFeedsById(favouriteIds)
      console.log('favourites: ', feeds)
      setFavourites(feeds)
    }
    fetchFavourites()
  }, [])

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
      hideButtonsOnOk: true,
      hiddenButtonsText: 'Searching for feeds',
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
              dispatch({
                type: ADD_MESSAGE,
                message: {
                  messageString: `Added feed ${feeds[0].title}`,
                  isSelfDestruct: true
                }
              })
            } else {
              dispatch({
                type: ADD_MESSAGE,
                message: {
                  messageString: `Couldn't find a feed`,
                  isSelfDestruct: true
                }
              })
            }
          } catch(err) {
            dispatch({
              type: ADD_MESSAGE,
              message: {
                messageString: `Couldn't find a feed`,
                isSelfDestruct: true
              }
            })
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

  const screenWidth = Platform.OS === 'web' ? 600 : Dimensions.get('window').width
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
          }}>There are three ways to add new websites to Reams:</Text>
          <Text style={{
            ...textStyles(),
            marginBottom: 32 * fontSizeMultiplier()
          }}>1. Use the Reams Share Extension to add sites straight from Safari. Just tap the share button in your browser and look for the Reams icon.</Text>
          <TouchableOpacity
            onPress={showAddFeedModal}
          >
            <Text style={{
                ...textStyles(),
                marginBottom: 32 * fontSizeMultiplier()
              }}
            >2. <Text style={{ 
              textDecorationLine: 'underline' 
              }}>Enter the URL of an RSS feed, or the URL of a site where you want to search for an RSS feed</Text></Text>
          </TouchableOpacity>
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap'
          }}>
            <Text style={{
              ...textStyles(),
              marginBottom: 32 * fontSizeMultiplier()
            }}>3. </Text><OPMLImport 
              textStyles={{
                ...textStyles(),
                textDecorationLine: 'underline'
              }}
              addFeeds={addFeeds}
            />
          </View>
          { favourites.length > 0 && (
            <>
              <Text style={{
                ...textStyles(),
                marginBottom: 36 * fontSizeMultiplier()
              }}>4. Add some of Reams’ favourite websites:</Text>
              <FeedList feeds={favourites.sort((a, b) => a.title < b.title ? -1 : 1)} toggleFeedSelected={toggleFeedSelected} />
            </>
          )}
        </View>
      </Animated.ScrollView>
      <Animated.View style={{
          position: 'absolute',
          left: getMargin(),
          top:  getMargin() / 2 + 5,
          zIndex: 10,
          opacity: selectedFeeds.length === 0 ? 0 : 1
      }}>
        <TextButton 
          isDisabled={selectedFeeds.length === 0}
          isCompact
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
            }}>Add Websites</Animated.Text>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  )
}

const FeedList = ({feeds, toggleFeedSelected}) => {
  return (
  <View style={{
    marginTop: 0, //getMargin(),
    paddingTop: 0,
    backgroundColor: hslString('white'),
    borderRadius: getMargin(),
  }}>
    { feeds.map((feed, index) => <FeedToggle 
        key={`feed-toggle-${index}`}
        feed={feed}
        index={index}
        toggleFeedSelected={toggleFeedSelected}
        total={feeds.length}
      />)}
  </View>
)}

const FeedToggle = (props) => {
  const [isSelected, setSelected] = useState(false)
  const { feed, index, isLast, toggleFeedSelected, total } = props
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
          backgroundColor: isSelected ? hslString('rizzleText') : 'transparent',
          paddingTop: 16 * fontSizeMultiplier(),
          paddingRight: 16 * fontSizeMultiplier(),
          borderTopLeftRadius: index === 0 ? getMargin() : 0,
          borderTopRightRadius: index === 0 ? getMargin() : 0,
          borderBottomLeftRadius: index === total - 1 ? getMargin() : 0,
          borderBottomRightRadius: index === total - 1 ? getMargin() : 0,
      }}>
        <View style={{
          width: 65,
          height: 70
        }}>
          {<Image
            // resizeMode='contain'
            source={{uri: feed.favicon_url}}
            style={{
              // flex: 1,
              marginLeft: 16 * fontSizeMultiplier(),
              marginTop: 8 * fontSizeMultiplier(),
              height: 32 * fontSizeMultiplier(),
              width: 32 * fontSizeMultiplier(),
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
            fontSize: 14 * fontSizeMultiplier(),
            lineHeight: 20 * fontSizeMultiplier(),
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