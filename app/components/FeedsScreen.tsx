import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import isEqual from 'lodash.isequal'
import { 
  Feed,
} from '../store/feeds/types'
import { 
  SHOW_HELPTIP,
  SHOW_MODAL
} from '../store/ui/types'
import { CREATE_CATEGORY, Category } from '../store/categories/types'
import React, { useEffect, useState } from 'react'
import {
  Animated,
  Dimensions,
  Image,
  SectionList,
  StatusBar,
  Text,
  View
} from 'react-native'
import FeedContracted from './FeedContracted'
import FeedExpanded from '../containers/FeedExpanded'
import TextButton from './TextButton'
import NewFeedsList from './NewFeedsList'
import { hslString } from '../utils/colors'
import { getInset, getMargin, getStatusBarHeight } from '../utils/'
import { fontSizeMultiplier } from '../utils'
import { textInfoStyle } from '../utils/styles'
import { RootState } from 'store/reducers'
import { useIsFocused } from '@react-navigation/native'

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList)

const sortFeeds = (a: Feed, b: Feed) => (a.isLiked && b.isLiked) || (a.number_unread === 0 && b.number_unread === 0) ?
  (normaliseTitle(a.title) < normaliseTitle(b.title) ? -1 : 1) :
  a.isLiked ? -1 :
    b.isLiked ? 1 :
      a.number_unread === 0 ? 1 :
        b.number_unread === 0 ? -1 :
          (normaliseTitle(a.title) < normaliseTitle(b.title) ? -1 : 1)

const addUnreadCount = (feed: Feed, itemFeedIds: string[]) => {
  const unreadItems = itemFeedIds.filter(i => i === feed._id)
  feed.number_unread = unreadItems.length
  return feed
}

const normaliseTitle = (title: string) => title.slice(0, 4).toUpperCase() === 'THE ' ?
  title.slice(4).toUpperCase() :
  title.toUpperCase()

function FeedsScreen({ navigation, isSaved }: { navigation: any, isSaved: boolean }) {

  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true)
  const [modal, setModal] = useState<{ feed: Feed, position: number } | null>(null)
  let isScrolling = false

  const scrollAnim = new Animated.Value(0)

  // const feedsDeepEqual = (a: Feed[], b: Feed[]) => {
  //   return isEqual(a, b)
  // }

  const sortedFeedsSelector = (state: RootState) => state.feeds.feeds.slice()
    .map(f => addUnreadCount(f, itemFeedIds))
    .sort(sortFeeds)
  const itemFeedIdsSelector = (state: RootState) => state.itemsUnread.items.map(i => i.feed_id)

  const itemFeedIds = useSelector(itemFeedIdsSelector, isEqual)

  const feeds: Feed[] = useSelector(sortedFeedsSelector, isEqual)
  const categories = useSelector((state: RootState) => state.categories.categories
    .filter(c => !c.isSystem && (isSaved ? c.isItems : c.isFeeds)), isEqual)
  const isPortrait = useSelector((state: RootState) => state.config.orientation === 'portrait')

  const isFocused = useIsFocused()
  const dispatch = useDispatch()

  useEffect(() => {
    if (isFocused && feeds.length > 0) {
      dispatch({
        type: SHOW_HELPTIP,
        key: 'feedsScreen',
      })
    } else {
      dispatch({
        type: SHOW_HELPTIP,
        key: null,
      })
    }
  }, [isFocused])

  const showModal = (modalProps: {}) => dispatch({
    type: SHOW_MODAL,
    modalProps
  })
  const createCategory = (name: string) => dispatch({
    type: CREATE_CATEGORY,
    name
  })

  const close = () => {
    setModal(null)
  }

  const showAddFeeds = () => {
    navigation.push('ModalWithGesture', {
      childView: <NewFeedsList
        close={() => {
          navigation.navigate('Main')
        }}
        isPortrait={isPortrait}
        navigation={navigation}
      />
    })
  }

  const showAddCategory = () => {
    const modalText = [
      {
        text: 'Create a new tag',
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
        }
      ],
      modalOnOk: (state: {categoryName: string}) => {
        console.log(state)
        state.categoryName && createCategory(state.categoryName)
      },
      showKeyboard: true
    })
  }

  const getSections = (categories: Category[], feeds: Feed[]) => {
    const feedCards = feeds ? 
      feeds.map((feed) => ({
        _id: feed._id,
        type: 'feed',
        feed,
        title: feed.title
      })) :
      []

    const catCards = categories ?
      categories.sort((a, b) => a.name < b.name ? -1 : 1).map(category => ({
        _id: category._id,
        type: 'category',
        title: category.name,
        category
      })) :
      []

    const allCards = feeds?.length > 0 ? [{
      _id: '9999999',
      type: 'all',
      title: 'All Unread Stories'
    }] : []

    const sections = [
      {
        title: '',
        data: allCards
      },
      {
        title: 'Tags',
        data: catCards
      },
      {
        title: 'Feeds',
        data: feedCards
      }
    ]

    return sections
  }

  const screenWidth = Dimensions.get('window').width
  const width = screenWidth - getInset() * (isPortrait ? 2 : 4)
  const margin = getMargin()
  const numCols = screenWidth > 500 ? 2 : 1

  const sections = getSections(categories, feeds)

  const renderSectionHeader = ({ section: { title } }: { section: { title?: string }}) => {
    if (!title) return null
    const margin = getMargin()
    return (
      <View style={{ width }}>
        <View style={{
          borderTopColor: hslString('rizzleText', '', 0.3),
          borderTopWidth: 1,
          marginVertical: margin,
          paddingTop: margin / 2,
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
          <Text style={{
            ...textInfoStyle(),
            fontFamily: 'IBMPlexSans-Bold',
            fontSize: 22 * fontSizeMultiplier(),
            padding: 0,
            marginLeft: 0,
            flex: 4
          }}>{title}</Text> 
          { title === 'Feeds' && (
            <TextButton
              text="Add"
              isCompact={true}
              onPress={showAddFeeds}
              buttonStyle={{
                flex: 0
              }}
            />
          )}
          { title === 'Tags' && (
            <TextButton
              text="Add"
              isCompact={true}
              onPress={showAddCategory}
              buttonStyle={{
                flex: 0
              }}
            />
          )}
        </View>
      </View>
    )
  }

  const renderFeed = ({item, index, count}: {item: any, index: number, count: number}) => {
    // const isSelected = this.state.selectedFeedElement !== null &&
    //   this.state.selectedFeedElement.props.feedId === item._id
    return item && <FeedContracted
      _id={item._id}
      key={item._id}
      count={count}
      title={item.title || item.name}
      type={item.type}
      index={index}
      navigation={navigation}
      {...{ modal, width }}
    />
  }

  console.log('RENDER FEEDS SCREEN')

  return (
    <>
      <Animated.View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: getStatusBarHeight(),
        backgroundColor: hslString('rizzleBG', '', 0.98),
        zIndex: 100,
        shadowColor: 'black',
        shadowRadius: 1,
        shadowOpacity: scrollAnim.interpolate({
          inputRange: [0, 20],
          outputRange: [0, 0.1],
          extrapolate: 'clamp'
        }),
        shadowOffset: {
          height: 1,
          width: 1
        },
        overflow: 'visible',
      }} />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: hslString('rizzleBG'),
          paddingTop: getStatusBarHeight(),
        }}
        testID='feeds-screen'
      >
        <StatusBar
          animated={true}
          barStyle="dark-content"
          showHideTransition="slide"/>
        { feeds.length === 0 ? 
          (<View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',

          }}>
            <Text style={{
              ...textInfoStyle(),
              margin: getMargin(),
              lineHeight: 24,  
            }}>Add feeds from your favourite websites with the Reams Share Extension. New articles will then automatically show up here.</Text>
            {<Image 
              source={require('../assets/images/reams-extension.webp')} 
              style={{
                backgroundColor: 'white',
                borderColor: 'rgba(0,0,0,0.8)',
                borderWidth: 2,
                width: 150,
                height: 328,
                margin: getMargin(),
                borderRadius: 18
              }}
            />}
            <Text style={{
              ...textInfoStyle(),
              margin: getMargin(),
              lineHeight: 24,  
            }}>You can also add feeds from an OPML file, or the built-in library:</Text>
            <TextButton text='Add Feeds' onPress={showAddFeeds} />
          </View>) :
          <AnimatedSectionList
            sections={sections}
            key={screenWidth}
            keyExtractor={(card: any) => card._id}
            initialNumToRender={3}
            numColumns={numCols}
            onScroll={Animated.event(
              [{ nativeEvent: {
                contentOffset: { y: scrollAnim }
              }}],
              {
                useNativeDriver: true
              }
            )}
            scrollEventThrottle={1}
            stickySectionHeadersEnabled={false}
            // renderItem={this.renderFeed}
            renderItem={({section, index}) => {
              if (index % numCols) { // items are already consumed 
                return null
              }
              // grab all items for the row
              const rowItems = section.data?.slice(index, index+numCols)
                .map((item, i, array) => ({ 
                  item, 
                  index: index+i,
                  count: array.length
                }))
              // wrap selected items in a "row" View 

              return rowItems ? <View 
                  style={{
                    flexDirection:"row",
                    justifyContent:"center"
                  }}
                >{rowItems.map(renderFeed)}</View> :
                null
            }}
            renderSectionHeader={renderSectionHeader}
            scrollEnabled={scrollEnabled}
            style={{ overflow: 'visible' }}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={() => { isScrolling = true }}
            onScrollEndDrag={() => { isScrolling = false }}
            windowSize={6}
            ListHeaderComponent={<View style={{height: margin}}/>}
          />
        }
        { modal !== null && (
            <FeedExpanded {...modal} {...{ close }} />
          )
        }
      </View>
    </>
  )

}

// FeedsScreen.whyDidYouRender = true

export default React.memo(FeedsScreen, isEqual)