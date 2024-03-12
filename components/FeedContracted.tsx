import React, { memo, useRef } from 'react'
import {
  Animated,
  Dimensions,
  GestureResponderEvent,
  Platform,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { hslString } from '../utils/colors'
import CardCoverImage from './CardCoverImage'
import FeedLikedMuted from './FeedLikedMuted'
import FeedIconContainer from '../containers/FeedIcon'
import FeedExpandedContainer from '../containers/FeedExpanded'
import { fontSizeMultiplier, getMargin } from '../utils'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import { Feed, REMOVE_CACHED_COVER_IMAGE, SET_CACHED_COVER_IMAGE } from '../store/feeds/types'
import { LinearGradient } from 'expo-linear-gradient'
import { useDispatch, useSelector } from 'react-redux'
import { SET_FILTER } from '../store/config/types'
import { CLEAR_READ_ITEMS, Item, ItemType, UPDATE_CURRENT_INDEX } from '../store/items/types'
import { Category, DELETE_CATEGORY, UPDATE_CATEGORY } from '../store/categories/types'
import { RootState } from 'store/reducers'
import isEqual from 'lodash.isequal'
import { useModal } from './ModalProvider'
import { BlurView } from 'expo-blur'

interface Props {
  _id: string | number
  count: number
  index: number
  isSaved: boolean
  title: string
  navigation: any
  type: string
  width: number
}

function FeedContracted ({ _id, count, index, isSaved, title, navigation, type, width }: Props)  {
  let feed: Feed | undefined, 
    category: Category | undefined, 
    numItems: number | undefined, 
    categoryFeeds: (Feed | undefined)[] = [],
    categoryItems: (Item | undefined)[] = [],
    cachedIconDimensions: { width: number, height: number } | undefined
  if (type === 'feed') {
    feed = useSelector((state: RootState) => state.feeds.feeds.find(f => f._id === _id), isEqual)
    numItems = useSelector((state: RootState) => state.itemsUnread.items.filter(i => i.feed_id === _id).filter(i => !i.readAt).length)
    cachedIconDimensions = useSelector((state: RootState) => state.feedsLocal.feeds.find(fl => fl._id === _id)?.cachedIconDimensions)
  } else if (type === 'all') {
    if (isSaved) {
      categoryItems = useSelector((state: RootState) => state.itemsSaved.items)
      numItems = useSelector((state: RootState) => state.itemsSaved.items.length)
    } else {
      numItems = useSelector((state: RootState) => state.itemsUnread.items.filter(i => !i.readAt).length)
      categoryFeeds = useSelector((state: RootState) => state.feeds.feeds.filter(f => !f.isMuted), isEqual)  
    }
  } else {
    category = useSelector((state: RootState) => state.categories.categories.find(c => c._id === _id), isEqual)
    if (isSaved) {
      categoryItems = category ? 
        category.itemIds
          .map(itemId => useSelector((state: RootState) => state.itemsSaved.items.find(i => i._id === itemId)))
          .filter(i => i !== undefined) : 
        []
      numItems = categoryItems.length
    } else {
      const categoryFeedIds: string[] = category ? category.feeds : [] // note that these are feed_ids
      numItems = useSelector((state: RootState) => state.itemsUnread.items
        .filter(i => categoryFeedIds.find(cf => cf === i.feed_id) !== undefined)
        .filter(i => !i.readAt).length)
      categoryFeeds = useSelector((state: RootState) => categoryFeedIds.map(cfi => state.feeds.feeds.find(f => f._id === cfi)), isEqual)
      cachedIconDimensions = useSelector((state: RootState) => state.feedsLocal.feeds.find(fl => fl._id === categoryFeeds[0]?._id)?.cachedIconDimensions)
    }
  }

  const { openModal } = useModal()

  const dispatch = useDispatch()
  const filterItems = (_id: string | null, title: string | null, type: string | null) => dispatch({
    type: SET_FILTER,
    filter: { _id, title, type }
  })
  const clearReadItems = () => dispatch({
    type: CLEAR_READ_ITEMS
  })
  const setIndex = (index: number) => dispatch({
    type: UPDATE_CURRENT_INDEX,
    index,
    displayMode: isSaved ? ItemType.saved : ItemType.unread
  })
  const updateCategory = (category: Category) => category && dispatch({
    type: UPDATE_CATEGORY,
    category
  })
  const deleteCategory = (category?: Category) => category && dispatch({
    type: DELETE_CATEGORY,
    category
  })

  const opacityAnim = new Animated.Value(1)
  let mainViewRef = useRef<View>(null)

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
    if (type === 'category' && categoryFeeds.length === 0 && categoryItems.length === 0) {
      return
    }
    
    opacityAnim.setValue(0.2)
    Animated.timing(opacityAnim, {
      toValue: 0,
      delay: 200,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      console.log('starting animation')
      Animated.timing(opacityAnim, {
        toValue: 1,
        delay: 500,
        duration: 200,
        useNativeDriver: true
      }).start()
    })
    clearReadItems()
    switch (type) {
      case 'all':
        filterItems(null, null, null)
        break
      case 'feed':
        filterItems(feed?._id || null, feed?.title || '', type)
        break
      case 'category':
        filterItems(category?._id || null, category?.name || '', type)
        break
    }
    setIndex(0)
    if (mainViewRef.current) {
      mainViewRef.current.measureInWindow(navigateToItems)
    }
  }

  const onLongPress = (e: GestureResponderEvent) => {
    ReactNativeHapticFeedback.trigger("impactLight", {})
    if (type === 'feed') {
      navigation.push('ModalWithGesture', {
        childView: <FeedExpandedContainer
            feed={feed}
            close={() => navigation.navigate('Main')}
            navigation={navigation}
          />
      })
    } else if (type === 'category') {
      if (isSaved) {
        const modalText = [
          {
            text: 'Edit tag',
            style: ['title']
          }
        ]
        openModal({
          modalText,
          showModal: true,
        })
      } else {
        const modalText = [
          {
            text: 'Edit tag',
            style: ['title']
          },
          {
            text: 'Add feeds to this tag by editing each feed individually',
            style: ['hint']
          }
    
        ]
        openModal({
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
          deletableRows: categoryFeeds.map((feed?: Feed) => ({
            bgColor: feed?.color ? hslString(feed.color) : hslString('rizzleText'),
            title: feed?.title,
            id: feed?._id
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
              _id: category?._id || '',
              itemIds: category?.itemIds || [],
              name: state.categoryName || category?.name,
              feeds: state.deletableRows.map((dr: Feed) => dr.id)
            })
          }
        })
      }
    }  
  }

  const textStyles = {
    color: hslString('rizzleText'),
    fontFamily: 'IBMPlexMono-Light',
  }

  const shadowStyle = {
    shadowColor: 'black',
    shadowRadius: 5,
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 0,
      height: 5
    }
  }

  const dim = Dimensions.get('window')
  const screenWidth = dim.width
  const margin = getMargin()
  // const cardWidth = width < 500 ?
  //   width :
  //   200
  const cardWidth = 200 * fontSizeMultiplier()
  const screenHeight = dim.height

  // const cardHeight = screenWidth < 500 || screenHeight < 500 ?
  //   Math.round(cardWidth / 2) :
  //   cardWidth
  const cardHeight = 200 * fontSizeMultiplier()

  const numElemsWithCover = isSaved ?
    categoryItems.filter(i => i?.hasCoverImage).length :
    categoryFeeds.length
  const cardSizeDivisor = (type === 'feed') ? 1 :
    screenWidth > 500 ? 
      (numElemsWithCover > 15 ? 4 :
        numElemsWithCover > 11 ? 3 :
        numElemsWithCover > 3 ? 2 :
        numElemsWithCover > 1 ? 1 :
        0) :
      (numElemsWithCover > 18 ? 3 :
        numElemsWithCover > 8 ? 2 :
        numElemsWithCover > 1 ? 1 :
        0)

  const coverImageSources = isSaved ? 
    categoryItems.filter(i => i?.hasCoverImage) : 
    type === 'feed' ? [feed] : categoryFeeds

  const marginRight = Platform.OS === 'web' ?
    50 :
    ((index % 2 === 0 && screenWidth > 500 && count > 1) ?
      margin :
      0)

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <Animated.View
        ref={mainViewRef}
        style={{
          flex: 0,
          // height: cardHeight,
          width: cardWidth,
          marginBottom: margin,
          // marginRight,
          opacity: opacityAnim,
          // overflow: 'hidden',
          borderRadius: 8,
        }}
      >
        <View
          style={{
            height: cardHeight,
            width: cardWidth,
            borderRadius: 8,
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            backgroundColor: type !== 'feed' ? 'black' : hslString(feed?.color, 'desaturated'),
            position: 'relative',
            overflow: 'visible',
            ...shadowStyle
        }}>
          <View style={{
            width: cardWidth,
            borderRadius: 8,
            flex: 1,
            overflow: 'hidden',
          }}>
            <View
              style={{
                backgroundColor: 'white',
                height: '100%',
                width: '105%',
                borderRadius: 8,
                overflow: 'hidden',
                flex: 1,
                flexDirection: 'row',
                flexWrap: 'wrap'
            }}>
              { coverImageSources && coverImageSources.map((source: Feed | Item | undefined, index: number, sources: (Feed | Item | undefined)[]) => (
                  source && (
                    <View 
                      key={source._id}
                      style={{
                        backgroundColor: hslString(source.color || 'black', 'desaturated'),
                        width: sources.length > 1 ? Math.ceil(cardHeight / cardSizeDivisor) : cardWidth,
                        height: sources.length > 1 ? Math.ceil(cardHeight / cardSizeDivisor) : cardHeight
                      }}>
                      <CardCoverImage
                        feedId={isSaved ? undefined : source._id}
                        itemId={isSaved ? source._id : undefined }
                        width={sources.length > 1 ? Math.ceil(cardHeight / cardSizeDivisor) : cardWidth}
                        height={sources.length > 1 ? Math.ceil(cardHeight / cardSizeDivisor) : cardHeight}
                      />
                    </View>
                  )
                )) 
              }
            </View>

          </View>
          { type == 'feed' &&
            <View
              style={{
                height: cardHeight,
                width: cardWidth,
                borderRadius: 8,
                position: 'absolute',
                left: 0,
                top: 0,
                backgroundColor: 'transparent',
                overflow: 'hidden'
            }}>
              <View style={{
                position: 'absolute',
                bottom: margin,
                right: margin/2,
                zIndex: 10
              }}>
                <FeedIconContainer
                  feed={feed}
                  iconDimensions={cachedIconDimensions}
                />
              </View>
            </View>
          }
          </View>
          { type === 'feed' && <FeedLikedMuted feed_id={feed?._id || ''} /> }
          <View style={{
            paddingLeft: 4,
            paddingRight: 40,
            paddingTop: 8,
            flexDirection: 'row'
          }}>
            <Text style={{
              ...textStyles,
              flexWrap: 'wrap',
              fontFamily: 'IBMPlexSans-Bold',
              fontSize: (Platform.OS === 'web' ? 16 : 18) * fontSizeMultiplier(),
              lineHeight: (Platform.OS === 'web' ? 18 : 20) * fontSizeMultiplier()
            }}>{title}</Text>
          </View>
          <View style={{
            paddingLeft: 4,
            paddingRight: 4,
            paddingBottom: 4
          }}>
            <Text style={{
              ...textStyles,
              fontFamily: 'IBMPlexSans',
              fontSize: (Platform.OS === 'web' ? 12 : 14) * fontSizeMultiplier(),
              opacity: 0.5
            }}>{numItems} {isSaved ? `article${numItems > 1 ? 's' : ''}` : 'unread'}</Text>
          </View>
      </Animated.View>
    </TouchableOpacity>
  )
}

export default React.memo(FeedContracted, isEqual)