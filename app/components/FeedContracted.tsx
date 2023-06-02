import React from 'react'
import {
  Animated,
  Dimensions,
  GestureResponderEvent,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { hslString } from '../utils/colors'
import FeedCoverImage from './FeedCoverImage'
import FeedLikedMuted from './FeedLikedMuted'
import FeedIconContainer from '../containers/FeedIcon'
import FeedExpandedContainer from '../containers/FeedExpanded'
import { fontSizeMultiplier, getMargin } from '../utils'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import { Feed, REMOVE_FEED_COVER_IMAGE, SET_CACHED_FEED_COVER_IMAGE } from '../store/feeds/types'
import { WrappedFeed } from 'containers/FeedContracted'
import LinearGradient from 'react-native-linear-gradient'
import { useDispatch } from 'react-redux'
import { SET_FILTER } from '../store/config/types'
import { CLEAR_READ_ITEMS, ItemType, UPDATE_CURRENT_INDEX } from '../store/items/types'
import { SHOW_MODAL } from '../store/ui/types'
import { Category, DELETE_CATEGORY, UPDATE_CATEGORY } from '../store/categories/types'

interface Props {
  category: Category
  count: number
  feed: Feed
  feeds: WrappedFeed[]
  index: number
  key: string
  navigation: any
  title: string
  type: string
  width: number
}

export default function FeedContracted ({ category, count, feed, feeds, index, key, navigation, title, type, width }: Props)  {
  const dispatch = useDispatch()
  const filterItems = (_id: string | null, title: string, type: string) => dispatch({
    type: SET_FILTER,
    filter: { _id, title, type }
  })
  const clearReadItems = () => dispatch({
    type: CLEAR_READ_ITEMS
  })
  const setIndex = (index: number) => dispatch({
    type: UPDATE_CURRENT_INDEX,
    index,
    displayMode: ItemType.unread
  })
  const setCachedCoverImage = (feedId: string, cachedCoverImageId: string) => {
    return dispatch({
      type: SET_CACHED_FEED_COVER_IMAGE,
      id: feedId,
      cachedCoverImageId
    })
  }
  const removeCoverImage = (feedId: string) => {
    return dispatch({
      type: REMOVE_FEED_COVER_IMAGE,
      id: feedId
    })
  }
  const showModal = (modalProps: any) => dispatch({
    type: SHOW_MODAL,
    modalProps
  })
  const updateCategory = (category: Category) => dispatch({
    type: UPDATE_CATEGORY,
    category
  })
  const deleteCategory = (category: Category) => dispatch({
    type: DELETE_CATEGORY,
    category
  })


  const opacityAnim: Animated.Value = new Animated.Value(1)
  let mainView: React.RefObject<View> = React.createRef<View>()
  let imageView: React.RefObject<View> = React.createRef<View>()

  const navigateToItems = (x: number, y: number, width: number, height: number) => {
    navigation.navigate('Items', { 
      feedCardX: Math.round(x),
      feedCardY: Math.round(y),
      feedCardWidth: Math.round(width),
      feedCardHeight: Math.round(height),
      toItems: true
    })
  }

  const onPress = (e: GestureResponderEvent) => {
    // fixes a bug when setting a filter with no feeds or items
    if (type === 'category' && feeds.length === 0) {
      return
    }
    
    opacityAnim.setValue(0.2)
    Animated.timing(opacityAnim, {
      toValue: 0,
      delay: 200,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      Animated.timing(opacityAnim, {
        toValue: 1,
        delay: 500,
        duration: 200,
        useNativeDriver: true
      }).start()
    })
    clearReadItems()
    const thing = type === 'feed' ? feed : category
    filterItems(type === 'all' ? null : thing._id,
      type === 'all' ? null : thing.title || thing.name,
      type === 'all' ? null : type
    )
    setIndex(0)
    mainView.measureInWindow(navigateToItems)
  }

  const onLongPress = (e: GestureResponderEvent) => {
    ReactNativeHapticFeedback.trigger("impactLight", {})
    if (type === 'feed') {
      navigation.push('ModalWithGesture', {
        childView: <FeedExpandedContainer
            feed={feeds[0].feed}
            close={() => navigation.navigate('Main')}
            navigation={navigation}
          />
      })
    } else if (type === 'category') {
      const modalText = [
        {
          text: 'Edit tag',
          style: ['title']
        }
      ]
      showModal({
        modalText,
        modalHideCancel: false,
        modalShow: true,
        inputs: [
          {
            label: 'Tag',
            name: 'categoryName',
            type: 'text',
            value: title
          }
        ],
        deletableRows: feeds.map((feed: WrappedFeed) => ({
          bgColor: feed.color ? hslString(feed.color) : hslString('rizzleText'),
          title: feed.feed.title,
          id: feed.feed._id
        })),
        deleteButton: true,
        deleteButtonText: 'Delete tag',
        modalOnDelete: () => {
          deleteCategory(category)
        },
        modalOnOk: (state: any) => {
          console.log(state)
          updateCategory({
            ...category,
            name: state.categoryName || category.name,
            feeds: state.deletableRows.map((dr: Feed) => dr.id)
          })
        }
      })
    }  
  }

  const textStyles = {
    color: 'white',
    fontFamily: 'IBMPlexMono-Light',
  }

  const shadowStyle = {
    shadowColor: 'black',
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: {
      width: 0,
      height: 5
    }
  }

  const dim = Dimensions.get('window')
  const screenWidth = dim.width
  const margin = getMargin()
  const cardWidth = width < 500 ?
    width :
    (width - margin) / 2
  const screenHeight = dim.height

  const cardHeight = screenWidth < 500 || screenHeight < 500 ?
    cardWidth / 2 :
    cardWidth

  const numUnread = feeds.reduce((acc: number, feed: WrappedFeed) => {
    if (!feed) {
      console.log('feed is null')
    }
    return acc + feed.feedItems.length
  }, 0)

  const iconDimensions = feeds.length === 1 ?
    feeds[0].feedLocal && feeds[0].feedLocal.cachedIconDimensions :
    null

  const cardSizeDivisor = screenWidth > 500 ? 
    (feeds.length > 15 ? 4 :
      feeds.length > 11 ? 3 :
      feeds.length > 3 ? 2 :
      feeds.length > 1 ? 1 :
      0) :
    (feeds.length > 18 ? 3 :
      feeds.length > 8 ? 2 :
      feeds.length > 1 ? 1 :
      0)

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <Animated.View
        ref={(c: React.RefObject<View>) => mainView = c}
        style={{
          flex: 1,
          height: cardHeight,
          width: cardWidth,
          marginBottom: margin * 2,
          marginRight: (index % 2 === 0 && screenWidth > 500 && count > 1) ?
            margin :
            0,
          opacity: opacityAnim,
          overflow: 'visible',
          ...shadowStyle
        }}
      >
        <View
          style={{
            height: cardHeight,
            width: cardWidth,
            borderRadius: 16,
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            backgroundColor: type !== 'feed' ? 'black' : hslString(feeds[0].feed.color, 'desaturated'),
            position: 'relative',
            overflow: 'hidden',
        }}>
          <View
            ref={(c: React.RefObject<View>) => { imageView = c}}
            style={{
              backgroundColor: 'white',
              height: '100%',
              width: '105%',
              borderRadius: 16,
              overflow: 'hidden',
              flex: 1,
              flexDirection: 'row',
              flexWrap: 'wrap'
          }}>
            { feeds.map((feed: WrappedFeed, index: number, feeds: WrappedFeed[]) => (
              <View 
                key={feed.feedId}
                style={{
                  backgroundColor: hslString(feed.color, 'desaturated'),
                  width: feeds.length > 1 ? Math.round(cardHeight / cardSizeDivisor) : cardWidth,
                  height: feeds.length > 1 ? Math.round(cardHeight / cardSizeDivisor) : cardHeight
                }}>
                <FeedCoverImage
                  feed={feed}
                  width={feeds.length > 1 ? cardHeight / cardSizeDivisor : cardWidth}
                  height={feeds.length > 1 ? cardHeight / cardSizeDivisor : cardHeight}
                  setCachedCoverImage={setCachedCoverImage}
                  removeCoverImage={removeCoverImage} />
              </View>
            )) }
          </View>
          <View style={{
            width: '100%',
            height: '100%',
            borderRadius: 16,
            paddingLeft: margin * 0.5,
            paddingRight: margin * 0.5,
            paddingBottom: margin * 0.5,
            position: 'absolute',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
          }}>
            <LinearGradient 
              colors={['rgba(0, 0, 0, 0.0)', 'rgba(100, 100, 100, 0.5)']}
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                bottom: 0,
                right: 0
              }}  
            />
              { type === 'feed' && <FeedLikedMuted feed={feeds[0]} /> }
              <View style={{
                paddingLeft: 4,
                paddingRight: 40,
                flexDirection: 'row'
              }}>
                <Text style={{
                  ...textStyles,
                  flexWrap: 'wrap',
                  fontFamily: 'IBMPlexSansCond-Bold',
                  fontSize: 24 * fontSizeMultiplier(),
                  lineHeight: 28 * fontSizeMultiplier()
                }}>{title}</Text>
              </View>
              <View style={{
                paddingLeft: 4,
                paddingRight: 4,
                paddingBottom: 2
              }}>
                <Text style={{
                  ...textStyles,
                  fontFamily: 'IBMPlexMono',
                  fontSize: 16 * fontSizeMultiplier()
                }}>{numUnread} unread</Text>
              </View>
          </View>
        </View>
        { type == 'feed' &&
          <View
            style={{
              height: cardHeight,
              width: cardWidth,
              borderRadius: 16,
              position: 'absolute',
              left: 0,
              top: 0,
              backgroundColor: 'transparent',
              overflow: 'hidden'
          }}>
            <View style={{
              backgroundColor: hslString(feeds[0].feed.color),
              position: 'absolute',
              bottom: -65,
              right: -65,
              zIndex: 5,
              width: 130,
              height: 130,
              transform: [{
                rotateZ: '45deg'
              }]
            }} />
            <View style={{
              position: 'absolute',
              bottom: 10,
              right: 5,
              zIndex: 10
            }}>
              <FeedIconContainer
                feed={feeds[0].feed}
                iconDimensions={iconDimensions}
              />
            </View>
          </View>
        }
      </Animated.View>
    </TouchableOpacity>
  )
}
