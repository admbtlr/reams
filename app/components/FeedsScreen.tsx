import { useSelector, useDispatch } from 'react-redux'
import { SET_FILTER } from '../store/config/types'
import { 
  Feed,
  MARK_FEED_READ,
  REMOVE_FEED
} from '../store/feeds/types'
import { 
  CLEAR_READ_ITEMS,
  UPDATE_CURRENT_INDEX,
  ItemType, 
  Item
} from '../store/items/types'
import { 
  HIDE_HELPTIP,
  SHOW_HELPTIP,
  SHOW_MODAL
} from '../store/ui/types'
import { CREATE_CATEGORY, Category } from '../store/categories/types'
import React, { Fragment, useEffect, useState } from 'react'
import {
  Animated,
  Dimensions,
  Image,
  SectionList,
  StatusBar,
  Text,
  View
} from 'react-native'
import FeedContracted from '../containers/FeedContracted'
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

const addUnreadCount = (feed: Feed, items: Item[]) => {
  const unreadItems = items.filter(i => i.feed_id === feed._id)
  feed.number_unread = unreadItems.length
  return feed
}

const normaliseTitle = (title: string) => title.slice(0, 4).toUpperCase() === 'THE ' ?
  title.slice(4).toUpperCase() :
  title.toUpperCase()

export default function FeedsScreen({ navigation, isSaved }: { navigation: any, isSaved: boolean }) {

  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true)
  const [modal, setModal] = useState<{ feed: Feed, position: number } | null>(null)
  let isScrolling = false

  const scrollAnim = new Animated.Value(0)

  const items: Item[] = useSelector((state: RootState) => state.itemsUnread.items)
  const feeds: Feed[] = useSelector((state: RootState) => state.feeds.feeds.slice())
    .map(f => addUnreadCount(f, items))
    .sort(sortFeeds)
  const categories = useSelector((state: RootState) => state.categories.categories.filter(c => !c.isSystem))
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

  const markAllRead = (olderThan: number) => dispatch({
    type: MARK_FEED_READ,
    id: null,
    originalId: null,
    olderThan: olderThan || Math.floor(Date.now() / 1000)
  })
  const setIndex = (index: number) => dispatch({
    type: UPDATE_CURRENT_INDEX,
    index,
    displayMode: ItemType.unread
  })
  const showModal = (modalProps: {}) => dispatch({
    type: SHOW_MODAL,
    modalProps
  })
  const unsubscribe = (id: string) => dispatch({
    type: REMOVE_FEED,
    id
  })
  const clearReadItems = () => dispatch({
    type: CLEAR_READ_ITEMS
  })
  const clearFilter = () => dispatch({
    type: SET_FILTER,
    filter: null
  })
  const createCategory = (name: string) => dispatch({
    type: CREATE_CATEGORY,
    name
  })


  // shouldComponentUpdate (nextProps, nextState) {
  //   // don't render while displaying an expanded feed
  //   if (this.state.modal !== nextState.modal) {
  //     return true
  //   } else if (this.props.backend === nextProps.backend &&
  //     deepEqual(this.props.feeds, nextProps.feeds) &&
  //     deepEqual(this.props.categories, nextProps.categories) &&
  //     this.props.numItems === nextProps.numItems &&
  //     this.props.isPortrait === nextProps.isPortrait) {
  //     return false
  //   }
  //   return true
  // }

  const open = (feed: Feed, index: number, position: number) => {
    setModal({ feed, position })
  }

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

  const getSections = (isSaved: boolean, categories: Category[], feeds: Feed[]) => {
    const feedCards = feeds ? 
      feeds.map((feed) => ({
        key: feed._id,
        type: 'feed',
        feed,
        title: feed.title
      })) :
      []

    const catCards = categories ?
      categories.sort((a, b) => a.name < b.name ? -1 : 1).map(cat => ({
        key: cat._id,
        type: 'category',
        title: cat.name,
        feeds: cat.feeds.map(feedId => feeds.find(feed => feed._id === feedId)),
        category: cat
      })) :
      []

    const allCards = feeds?.length > 0 ? [{
      key: '9999999',
      type: 'all',
      feeds,
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

  const sections = getSections(isSaved, categories, feeds)

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
      category={item.category}
      count={count}
      key={item.key}
      feed={item.feed}
      feeds={item.feeds}
      title={item.title || item.name}
      type={item.type}
      index={index}
      navigation={navigation}
      {...{ modal, open, width }}
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
                borderRadius: 25
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
            keyExtractor={(card: any) => card.key}
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
