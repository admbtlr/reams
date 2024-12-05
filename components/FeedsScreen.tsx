import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import isEqual from 'lodash.isequal'
import { 
  Feed,
} from '../store/feeds/types'
import { 
  SHOW_HELPTIP
} from '../store/ui/types'
import { CREATE_CATEGORY, Category } from '../store/categories/types'
import { createCategory as createCategoryAction } from '../store/categories/categoriesSlice'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Animated,
  Dimensions,
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  SectionList,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import FeedContracted from './FeedContracted'
import FeedExpanded from '../containers/FeedExpanded'
import TextButton from './TextButton'
import NewFeedsList from './NewFeedsList'
import { hslString } from '../utils/colors'
import { id } from '../utils/'
import { getStatusBarHeight } from '../utils/dimensions'
import { getMargin } from '../utils/dimensions'
import { getInset } from '../utils/dimensions'
import { fontSizeMultiplier } from '../utils/dimensions'
import { textButtonStyle, textInfoStyle, textInputStyle } from '../utils/styles'
import { RootState } from 'store/reducers'
import { useIsFocused } from '@react-navigation/native'
import { ItemType } from '../store/items/types'
import { useModal } from './ModalProvider'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import SearchBar from './SearchBar'

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList)

interface FeedSkeleton {
  _id: string,
  title: string,
  unreadCount?: number,
  isLiked?: boolean
}

const selectFeedSkeletons = (state: RootState) => {
  const itemFeedIds = state.itemsUnread.items.map(i => i.feed_id)
  return state.feeds.feeds
    .map(f => ({
      _id: f._id,
      title: f.title
    }))
    .map(f => addUnreadCount(f, itemFeedIds))
    .sort(sortFeeds)
}

const selectNewsletterSkeletons = (state: RootState) => {
  const itemFeedIds = state.itemsUnread.items.map(i => i.feed_id)
  return state.newsletters.newsletters
    .map(n => ({
      _id: n._id,
      title: n.title
    }))
    .map(n => addUnreadCount(n, itemFeedIds))
    .sort(sortFeeds)
}

const sortFeeds = (a: FeedSkeleton, b: FeedSkeleton) => (a.isLiked && b.isLiked) || (a.unreadCount === 0 && b.unreadCount === 0) ?
  (normaliseTitle(a.title) < normaliseTitle(b.title) ? -1 : 1) :
  a.isLiked ? -1 :
    b.isLiked ? 1 :
      a.unreadCount === 0 ? 1 :
        b.unreadCount === 0 ? -1 :
          (normaliseTitle(a.title) < normaliseTitle(b.title) ? -1 : 1)

const addUnreadCount = (feed: FeedSkeleton, itemFeedIds: string[]) => {
  const unreadItems = itemFeedIds.filter(i => i === feed._id)
  feed.unreadCount = unreadItems.length
  return feed
}

const normaliseTitle = (title: string) => title.slice(0, 4).toUpperCase() === 'THE ' ?
  title.slice(4).toUpperCase() :
  title.toUpperCase()

function FeedsScreen({ navigation }: { navigation: any, isSaved: boolean }) {

  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true)
  const [modal, setModal] = useState<{ feed: Feed, position: number } | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  let isScrolling = false

  const scrollAnim = new Animated.Value(0)

  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)
  const isSaved = displayMode === ItemType.saved

  const feedSkeletons: FeedSkeleton[] = useSelector(selectFeedSkeletons, isEqual)
  const newsletterSkeletons: FeedSkeleton[] = useSelector(selectNewsletterSkeletons, isEqual)

  const categories = useSelector((state: RootState) => state.categories.categories
    .filter(c => !c.isSystem), isEqual)
  const isPortrait = useSelector((state: RootState) => state.config.orientation === 'portrait')

  const isFocused = useIsFocused()
  const dispatch = useDispatch()

  const { openModal } = useModal()

  const createCategory = (name: string) => {
    const category: Category = {
      _id: id() as string,
      name,
      isSystem: false,
      feedIds: [],
      itemIds: []
    }
    return dispatch(createCategoryAction(category))
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
    openModal({
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
        state.categoryName && createCategory(state.categoryName)
      },
      showKeyboard: true
    })
  }

  const getSections = (categories: Category[], feedSkeletons: FeedSkeleton[]) => {
    const feedCards = feedSkeletons ? 
      feedSkeletons.map((feed) => ({
        _id: feed._id,
        type: 'feed',
        title: feed.title
      })) :
      []

    const newsletterCards = newsletterSkeletons ?
      newsletterSkeletons.map((newsletter) => ({
        _id: newsletter._id,
        type: 'newsletter',
        title: newsletter.title
      })) :
      []

    const catCards = categories ?
      categories.filter((c: Category) => (isSaved && c.itemIds?.length > 0) || (!isSaved && c.feedIds?.length > 0))
        .sort((a, b) => a.name < b.name ? -1 : 1).map(category => ({
        _id: category._id,
        type: 'category',
        title: category.name,
        category
      })) :
      []

    const allCards = feedSkeletons?.length > 0 || newsletterSkeletons?.length > 0 ? [{
      _id: '9999999',
      type: 'all',
      title: `All ${isSaved ? 'Saved' : 'Unread'}`
    }] : []

    let sections = [
      {
        title: '',
        data: allCards
      },
      {
        title: 'Tags',
        data: catCards
      },
    ]
    if (!isSaved) {
      sections.push({
        title: 'Feeds',
        data: feedCards
      })
      sections.push({
        title: 'Newsletters',
        data: newsletterCards
      })
    }

    return sections
  }

  const screenWidth = Dimensions.get('window').width
  const width = Math.round(screenWidth - getInset() * (isPortrait ? 2 : 4))
  const margin = getMargin()
  const numCols = Math.floor(screenWidth / 300) // 250 + 50 margin

  const sections = getSections(categories, feedSkeletons)

  const renderSectionHeader = ({ section: { title } }: { section: { title?: string }}) => {
    if (!title) return null
    const margin = getMargin()
    return (
      <View style={{ 
        maxWidth: Platform.OS === 'web' ? 10000 : 1000,
        width: '100%'
      }}>
        <View style={{
          borderTopColor: hslString('rizzleText', '', 0.2),
          borderTopWidth: 1,
          marginTop: margin,
          marginHorizontal: Platform.OS === 'web' ? margin * 2 : margin,
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
            // marginTop: margin,
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
    // console.log('RENDER FEED', item._id, item.title)
    return item && <View 
      key={item._id}
      style={{ 
        marginLeft: Platform.OS !== 'web' && index === 0 ? margin : 0,
        marginRight: Platform.OS === 'web' ? margin * 2 : margin
      }}>
      <FeedContracted
        _id={item._id}
        count={count}
        title={item.title || item.name}
        type={item.type}
        index={index}
        navigation={navigation}
        isSaved={isSaved}        
        {...{ modal, width }}
      />
    </View>
  }

  const renderSection = ({ section }: { section: { data: any[] }}) => {
    const count = section.data.length
    return (
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: Platform.OS === 'web' ? 'flex-begin' : 'space-between',
        marginHorizontal: Platform.OS === 'web' ? margin * 2 : 0,        
        marginTop: margin
        // width: '100%',
        // maxWidth: 1000,
        // paddingHorizontal: getMargin(),
      }}>
        { Platform.OS === 'web' ?
          section.data.map((item, index) => renderFeed({ item, index, count })) :
          (<ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={{
              width: '100%',
              maxWidth: 1000,
            }}>
              { section.data.map((item, index) => renderFeed({ item, index, count })) }
          </ScrollView>)
        }
      </View>
    )
  }

  console.log('RENDER FEEDS SCREEN')

  return (
    <>
      <View style={{
        position: 'absolute',
        zIndex: 500,
        flex: 0,
        height: 40,
        width: 40,
        top: getStatusBarHeight() - 45,
        right: 0,
        // backgroundColor: 'yellow'
      }}>
        <TouchableOpacity onPress={() => {
          LayoutAnimation.configureNext({ 
            duration: 500, 
            create: { type: 'linear', property: 'opacity' }, 
            update: { type: 'spring', springDamping: 0.6 }, 
            delete: { duration: 100, type: 'linear', property: 'opacity' } 
          })
          setShowSearch(!showSearch) 
        }}>
          { getRizzleButtonIcon('search', hslString('rizzleText'))}
        </TouchableOpacity>
      </View>
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
        { feedSkeletons.length === 0 && newsletterSkeletons.length === 0 ? 
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
          <ScrollView
            style={{
              flex: 1,
              width: '100%'
            }}
            // onScroll={Animated.event(
            //   [{ nativeEvent: {
            //     contentOffset: { y: scrollAnim }
            //   }}],
            //   {
            //     useNativeDriver: true
            //   }
            // )}
            // scrollEventThrottle={1}
          >
            { showSearch &&
              <SearchBar navigation={navigation}/>
            }
            { sections.map((section, index) => {
              if (section.data.length === 0) return null
              return (
                <View key={index} style={{ width: '100%' }}>
                  { renderSectionHeader({ section }) }
                  { renderSection({ section }) }
                </View>
              )
            })
            }
          </ScrollView>

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