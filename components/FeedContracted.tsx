import React, { memo, useEffect, useRef } from 'react'
import {
  Dimensions,
  GestureResponderEvent,
  Platform,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Animated, { useSharedValue, withTiming, withDelay, runOnUI, measure, useAnimatedRef, runOnJS } from 'react-native-reanimated'
import { hslString } from '../utils/colors'
import CardCoverImage from './CardCoverImage'
import FeedLikedMuted from './FeedLikedMuted'
import { getMargin } from '../utils/dimensions'
import { fontSizeMultiplier } from '../utils/dimensions'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import {
  Feed
} from '../store/feeds/types'
import { useDispatch, useSelector } from 'react-redux'
import { SET_FILTER } from '../store/config/types'
import {
  Item,
  ItemType,
  UPDATE_CURRENT_INDEX,
} from '../store/items/types'
import {
  Category,
  DELETE_CATEGORY,
  UPDATE_CATEGORY,
} from '../store/categories/types'
import { RootState } from 'store/reducers'
import isEqual from 'lodash.isequal'
import { useModal } from './ModalProvider'
import { createSelector } from '@reduxjs/toolkit'
import Favicon from './Favicon'
import { deepEqual } from '../utils'
import { useNavigation } from '@react-navigation/native'

const entities = require('entities')

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

interface ThinItem {
  _id: string
  color?: number[]
  feed_id?: string
  hasCoverImage?: boolean
  readAt: number | undefined
}

const unreadThinItemsSelector = createSelector(
  [(state: RootState) => state.itemsUnread.items],
  (items) =>
    items.map((i) => ({
      _id: i._id,
      feed_id: i.feed_id,
      hasCoverImage: i.hasCoverImage,
      readAt: i.readAt,
    }))
)

const savedThinItemsSelector = createSelector(
  [(state: RootState) => state.itemsSaved.items],
  (items) =>
    items.map((i) => ({
      _id: i._id,
      hasCoverImage: i.hasCoverImage,
      readAt: i.readAt,
    }))
)

function FeedContracted({
  _id,
  count,
  index,
  isSaved,
  title,
  // navigation,
  type,
  width,
}: Props) {
  const navigation = useNavigation()
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode)
  const feeds = useSelector((state: RootState) => state.feeds.feeds)
  const newsletters = useSelector(
    (state: RootState) => state.newsletters.newsletters
  )
  const feedsLocal = useSelector((state: RootState) => state.feedsLocal.feeds)
  const unreadThinItems = useSelector(unreadThinItemsSelector, deepEqual)
  const savedThinItems = useSelector(savedThinItemsSelector, deepEqual)
  const category = useSelector(
    (state: RootState) =>
      state.categories.categories.find((c) => c._id === _id),
    isEqual
  )
  let feed: Feed | undefined,
    numItems: number | undefined,
    categoryFeeds: (Feed | undefined)[] = [],
    categoryItems: (ThinItem | undefined)[] = [],
    cachedIconDimensions: { width: number, height: number } | undefined
  if (type === 'feed') {
    feed = feeds.find((f) => f._id === _id)
    numItems = unreadThinItems
      .filter((i) => i.feed_id === _id)
      .filter((i) => !i.readAt).length
    cachedIconDimensions = feedsLocal.find(
      (fl) => fl._id === _id
    )?.cachedIconDimensions
    categoryItems = unreadThinItems.filter((i) => i.feed_id === _id)
  } else if (type === 'newsletter') {
    feed = newsletters.find((n) => n._id === _id) as Feed
    numItems = unreadThinItems
      .filter((i) => i.feed_id === _id)
      .filter((i) => !i.readAt).length
    cachedIconDimensions = feedsLocal.find(
      (fl) => fl._id === _id
    )?.cachedIconDimensions
    categoryItems = unreadThinItems.filter((i) => i.feed_id === _id)
  } else if (type === 'all') {
    if (isSaved) {
      categoryItems = savedThinItems
      numItems = savedThinItems.length
    } else {
      numItems = unreadThinItems.length
      categoryFeeds = feeds.filter((f) => !f.isMuted)
    }
  } else {
    // category
    if (isSaved) {
      categoryItems = category
        ? category.itemIds
          .map((itemId) => savedThinItems.find((i) => i._id === itemId))
          .filter((i) => i !== undefined)
        : []
      numItems = categoryItems.length
    } else {
      const categoryFeedIds: string[] = category ? category.feedIds : [] // note that these are feed_ids
      categoryItems = unreadThinItems
        .filter(
          (i) => categoryFeedIds.find((cf) => cf === i.feed_id) !== undefined
        )
        .filter((i) => !i.readAt)
      numItems = categoryItems.length
      categoryFeeds = categoryFeedIds.map((cfi) =>
        feeds.find((f) => f._id === cfi)
      )
      cachedIconDimensions = feedsLocal.find(
        (fl) => fl._id === categoryFeeds[0]?._id
      )?.cachedIconDimensions
    }
  }

  const { openModal } = useModal()

  const dispatch = useDispatch()
  const filterItems = (
    _id: string | null,
    title: string | null,
    type: string | null
  ) =>
    dispatch({
      type: SET_FILTER,
      filter: { _id, title, type },
    })
  const setIndex = (index: number) =>
    dispatch({
      type: UPDATE_CURRENT_INDEX,
      index,
      displayMode: isSaved ? ItemType.saved : ItemType.unread,
    })
  const updateCategory = (category: Category) =>
    category &&
    dispatch({
      type: UPDATE_CATEGORY,
      category,
    })
  const deleteCategory = (category?: Category) =>
    category &&
    dispatch({
      type: DELETE_CATEGORY,
      category,
    })

  const opacityAnim = useSharedValue(1)
  const mainViewRef = useAnimatedRef<Animated.View>()

  const navigateToItems = (
    x: number,
    y: number,
    width: number,
    height: number,
    pageX: number,
    pageY: number
  ) => {
    navigation.navigate('Items', {
      feedCardX: Math.round(pageX),
      feedCardY: Math.round(pageY),
      feedCardWidth: Math.round(width),
      feedCardHeight: Math.round(height),
      toItems: true,
    })
  }

  const onPress = () => {
    // fixes a bug when setting a filter with no feeds or items
    if (
      type === 'category' &&
      categoryFeeds.length === 0 &&
      categoryItems.length === 0
    ) {
      return
    }

    opacityAnim.value = 0.2
    opacityAnim.value = withTiming(0, { duration: 200 })
    const now = Date.now()
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
      case 'newsletter':
        filterItems(feed?._id || null, feed?.title || '', type)
        break
    }
    setIndex(0)
    console.log(`Filtering items took ${Date.now() - now}ms`)
    opacityAnim.value = withTiming(1, { duration: 500 })
    if (mainViewRef !== null) {
      console.log('trying to runOnUI')
      runOnUI(() => {
        const measurement = measure(mainViewRef)
        if (measurement === null) return
        const { x, y, width, height, pageX, pageY } = measurement
        runOnJS(navigateToItems)(x, y, width, height, pageX, pageY)
      })()
    }
  }

  const showDetails = (e: GestureResponderEvent) => {
    ReactNativeHapticFeedback.trigger('impactLight', {})
    if (type === 'feed') {
      navigation.navigate('FeedExpanded', { feed, navigation })
    } else if (type === 'category') {
      if (isSaved) {
        const modalText = [
          {
            text: 'Edit tag',
            style: ['title'],
          },
        ]
        openModal({
          modalText
        })
      } else {
        const modalText = [
          {
            text: 'Edit tag',
            style: ['title'],
          },
          {
            text: 'Add feeds to this tag by editing each feed individually',
            style: ['hint'],
          },
        ]
        openModal({
          modalText,
          modalHideCancel: false,
          inputs: [
            {
              label: 'Tag',
              name: 'categoryName',
              type: 'text',
              value: title,
            },
          ],
          deletableRows: categoryFeeds.map((feed?: Feed) => ({
            bgColor: feed?.color
              ? hslString(feed.color)
              : hslString('rizzleText'),
            title: feed?.title,
            id: feed?._id,
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
              feedIds: state.deletableRows.map((dr: Feed) => dr._id),
            })
          },
        })
      }
    }
  }

  const textStyles = {
    color: hslString('rizzleText'),
    fontFamily: 'IBMPlexMono-Light',
  }

  const shadowStyle = {
    shadowColor: isDarkMode ? 'rgb(0,0,0)' : 'rgb(80, 80, 50)',
    shadowRadius: 3,
    shadowOpacity: 0.3,
    shadowOffset: {
      width: 0,
      height: 3,
    },
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

  let coverImageSources = isSaved
    ? categoryItems.filter((i) => i?.hasCoverImage)
    : type === 'all'
      ? unreadThinItems.filter((i) => i.hasCoverImage)
      : categoryItems.filter((i) => i?.hasCoverImage)
  const numElemsWithCover = coverImageSources.length
  const cardSizeDivisor =
    numElemsWithCover > 15
      ? 4
      : numElemsWithCover > 11
        ? 3
        : numElemsWithCover > 3
          ? 2
          : numElemsWithCover > 0
            ? 1
            : 0
  coverImageSources = coverImageSources.slice(
    0,
    cardSizeDivisor * cardSizeDivisor
  )

  const marginRight =
    Platform.OS === 'web'
      ? 50
      : index % 2 === 0 && screenWidth > 500 && count > 1
        ? margin
        : 0

  const getInitials = (title: string) => {
    let words = title
      .split(' ')
      .filter((w) => !['the', 'of', 'and'].includes(w.toLowerCase()))
    return words
      .map((w) => w.substring(0, 1).toUpperCase())
      .join(' ')
      .split(/[^A-Z]/)[0]
  }

  return (
    <View>
      <TouchableOpacity onPress={onPress}>
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
              backgroundColor: !['feed', 'newsletter'].includes(type)
                ? 'black'
                : hslString(feed?.color, 'desaturated'),
              position: 'relative',
              overflow: 'visible',
              ...shadowStyle,
            }}
          >
            {coverImageSources && coverImageSources.length > 0 && (
              <View
                style={{
                  width: cardWidth,
                  borderRadius: 8,
                  flex: 1,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    backgroundColor: 'white',
                    height: '100%',
                    width: '105%',
                    borderRadius: 8,
                    overflow: 'hidden',
                    flex: 1,
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                  }}
                >
                  {coverImageSources.map(
                    (
                      source: Feed | Item | ThinItem | undefined,
                      index: number,
                      sources: (Feed | Item | ThinItem | undefined)[]
                    ) =>
                      source && (
                        <View
                          key={source._id}
                          style={{
                            backgroundColor: hslString(
                              source.color || 'black',
                              'desaturated'
                            ),
                            width:
                              sources.length > 1
                                ? Math.ceil(cardHeight / cardSizeDivisor)
                                : cardWidth,
                            height:
                              sources.length > 1
                                ? Math.ceil(cardHeight / cardSizeDivisor)
                                : cardHeight,
                          }}
                        >
                          <CardCoverImage
                            feedId={undefined} //isSaved || type === 'all' ? undefined : source._id}
                            itemId={source._id} //isSaved || type === 'all' ? source._id : undefined }
                            width={
                              sources.length > 1
                                ? Math.ceil(cardHeight / cardSizeDivisor)
                                : cardWidth
                            }
                            height={
                              sources.length > 1
                                ? Math.ceil(cardHeight / cardSizeDivisor)
                                : cardHeight
                            }
                          />
                        </View>
                      )
                  )}
                </View>
              </View>
            )}
            {['feed', 'newsletter'].includes(type) && (
              <View
                style={{
                  height: cardHeight,
                  width: cardWidth,
                  borderRadius: 8,
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  overflow: 'hidden',
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                  backgroundColor: 'transparent',
                }}
              >
                <View
                  style={{
                    position: 'absolute',
                    bottom: margin / 2,
                    left: margin / 2,
                    zIndex: 10,
                  }}
                >
                  <Favicon url={feed?.rootUrl || feed?.url} />
                </View>
                {(coverImageSources === undefined ||
                  coverImageSources.length == 0) && (
                    <Text
                      style={{
                        ...textStyles,
                        fontFamily: 'IBMPlexSans',
                        fontSize: 100 * fontSizeMultiplier(),
                        color: 'rgb(120, 120, 120)',
                        opacity: 0.2,
                        // position: 'absolute',
                        // bottom: margin,
                        // left: margin,
                        alignSelf: 'center',
                        textAlign: 'center',
                        flex: 1,
                      }}
                    >
                      {getInitials(feed?.title || 'what the fuck')}
                    </Text>
                  )}
              </View>
            )}
            <View
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                zIndex: 20,
                borderRadius: 8,
                backgroundColor: 'rgba(0,0,0,0.1)',
              }}
            />
          </View>
          {type === 'feed' && <FeedLikedMuted feed_id={feed?._id || ''} />}
          <View
            style={{
              paddingLeft: 4,
              paddingRight: 40,
              paddingTop: 8,
              flexDirection: 'row',
            }}
          >
            <Text
              style={{
                ...textStyles,
                flexWrap: 'wrap',
                fontFamily: 'IBMPlexSans-Bold',
                fontSize:
                  (Platform.OS === 'web' ? 16 : 18) * fontSizeMultiplier(),
                lineHeight:
                  (Platform.OS === 'web' ? 18 : 20) * fontSizeMultiplier(),
              }}
            >
              {!!title ? entities.decodeHTML(title) : ''}
            </Text>
          </View>
          <View
            style={{
              paddingLeft: 4,
              paddingRight: 4,
              paddingBottom: 4,
            }}
          >
            <Text
              style={{
                ...textStyles,
                fontFamily: 'IBMPlexSans',
                fontSize:
                  (Platform.OS === 'web' ? 12 : 14) * fontSizeMultiplier(),
                opacity: 0.5,
              }}
            >
              {numItems}{' '}
              {isSaved ? `article${numItems > 1 ? 's' : ''}` : 'unread'}
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
      {type !== 'all' && (
        <View
          style={{
            position: 'absolute',
            backgroundColor: 'rgba(0,0,0,0.5)',
            top: cardWidth - margin / 2 - 32 * fontSizeMultiplier(),
            right: margin / 2,
            width: 32 * fontSizeMultiplier(),
            height: 32 * fontSizeMultiplier(),
            borderRadius: 16 * fontSizeMultiplier(),
            zIndex: 100,
          }}
        >
          <TouchableOpacity
            onPress={showDetails}
            style={{
              width: 32 * fontSizeMultiplier(),
              height: 32 * fontSizeMultiplier(),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 20,
                fontFamily: 'IBMPlexSans-Bold',
                marginTop: -10,
              }}
            >
              ...
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

FeedContracted.whyDidYouRender = true

export default React.memo(FeedContracted, isEqual)
