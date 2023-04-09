import React, { Fragment } from 'react'
import {
  Animated,
  Dimensions,
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
import { deepEqual, getInset, getMargin, getStatusBarHeight } from '../utils/'
import { fontSizeMultiplier } from '../utils'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import { textInfoBoldStyle, textInfoStyle } from '../utils/styles'

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList)

class FeedsScreen extends React.Component {

  // static whyDidYouRender = true

  constructor (props) {
    super(props)
    this.props = props
    this.state = {
      scrollEnabled: true,
      modal: null
    }
    this.scrollAnim = new Animated.Value(0)

    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
  }

  shouldComponentUpdate (nextProps, nextState) {
    // don't render while displaying an expanded feed
    if (this.state.modal !== nextState.modal) {
      return true
    } else if (this.props.backend === nextProps.backend &&
      deepEqual(this.props.feeds, nextProps.feeds) &&
      deepEqual(this.props.categories, nextProps.categories) &&
      this.props.numItems === nextProps.numItems &&
      this.props.isPortrait === nextProps.isPortrait) {
      return false
    }
    return true
  }

  open = (feed, index, position) => {
    this.setState({
      modal: { feed, position }
    })
  }

  close = () => {
    this.setState({
      modal: null
    })
  }

  showAddFeeds = () => {
    const { navigation } = this.props
    navigation.push('ModalWithGesture', {
      childView: <NewFeedsList
        close={() => {
          navigation.navigate('Main')
        }}
        isPortrait={this.props.isPortrait}
        navigation={navigation}
      />
    })
  }

  showAddCategory = () => {
    const modalText = [
      {
        text: 'Create a new tag',
        style: ['title']
      }
    ]
    this.props.showModal({
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
      modalOnOk: (state) => {
        console.log(state)
        state.categoryName && this.props.createCategory(state.categoryName)
      },
      showKeyboard: true
    })
  }

  componentDidMount = () => {
    // if (this.props.feeds.length === 0) {
    //   setTimeout(this.showAddFeeds.bind(this), 500)
    // }
  }

  componentDidUpdate = () => {
  }

  getSections = (isSaved, categories, feeds) => {
    const feedCards = feeds ? 
      feeds.map((feed) => ({
        key: feed._id,
        type: 'feed',
        feed,
        title: feed.title
      })) :
      null

    const catCards = categories ?
      categories.sort((a, b) => a.name < b.name ? -1 : 1).map(cat => ({
        key: cat._id,
        type: 'category',
        title: cat.name,
        feeds: cat.feeds.map(feedId => feeds.find(feed => feed._id === feedId)),
        category: cat
      })) :
      null

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

  render = () => {
    const { categories, feeds, isPortrait, isSaved } = this.props

    const { close } = this
    const { modal } = this.state

    const screenWidth = Dimensions.get('window').width
    this.width = screenWidth - getInset() * (isPortrait ? 2 : 4)
    const margin = getMargin()
    const numCols = screenWidth > 500 ? 2 : 1

    const sections = this.getSections(isSaved, categories, feeds)

    console.log('RENDER FEEDS SCREEN')

    return (
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
            }}>Add feeds from your favourite websites. New articles will then automatically show up here.</Text>
            <TextButton text='Add Feeds' onPress={this.showAddFeeds.bind(this)} />
          </View>) :
          <AnimatedSectionList
            sections={sections}
            key={screenWidth}
            keyExtractor={card => card.key}
            initialNumToRender={3}
            numColumns={numCols}
            onScroll={Animated.event(
              [{ nativeEvent: {
                contentOffset: { y: this.scrollAnim }
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
                >{rowItems.map(this.renderFeed)}</View> :
                null
            }}
            renderSectionHeader={this.renderSectionHeader.bind(this)}
            scrollEnabled={this.state.scrollEnabled}
            style={{ overflow: 'visible' }}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={() => { this.isScrolling = true }}
            onScrollEndDrag={() => { this.isScrolling = false }}
            windowSize={6}
            ListHeaderComponent={<View style={{height: margin}}/>}
          />
        }
        { modal !== null && (
            <FeedExpanded {...modal} {...{ close }} />
          )
        }
    </View>
    )
  }

  renderSectionHeader = ({ section: { title, data } }) => {
    if (!title) return null
    const margin = getMargin()
    const screenWidth = Dimensions.get('window').width
    return (
      <View style={{ width: screenWidth - margin * 2 }}>
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
              onPress={this.showAddFeeds}
              buttonStyle={{
                flex: 0
              }}
            />
          )}
          { title === 'Tags' && (
            <TextButton
              text="Add"
              isCompact={true}
              onPress={this.showAddCategory}
              buttonStyle={{
                flex: 0
              }}
            />
          )}
        </View>
      </View>
    )
  }

  renderFeed = ({item, index, count}) => {
    // const isSelected = this.state.selectedFeedElement !== null &&
    //   this.state.selectedFeedElement.props.feedId === item._id
    const { open, width } = this;
    const { modal } = this.state;
    return item && <FeedContracted
      category={item.category}
      count={count}
      key={item.key}
      feed={item.feed}
      feeds={item.feeds}
      title={item.title || item.name}
      type={item.type}
      index={index}
      navigation={this.props.navigation}
      disableScroll={this.disableScroll}
      {...{ modal, open, width }}
    />
  }
}

class ListHeaderComponent extends React.Component {
  constructor (props) {
    super(props)
    this.props = props
    this.showMarkOldReadModal = this.showMarkOldReadModal.bind(this)
  }

  showMarkOldReadModal (scope) {
    this.props.showModal({
      modalText: [
        {
          text: 'Remove old items?',
          style: ['title']
        },
        {
          text: 'This will remove all items that are more than one week old',
          style: ['text']
        }
      ],
      modalHideCancel: false,
      modalShow: true,
      modalOnOk: () => {
        scope.props.markAllRead(Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000))
      }
    })
  }

  render = () => {
    const margin = getMargin()
    const { navigation, scrollAnim, showAddFeeds, width } = this.props
    return (
      <View style={{
        marginBottom: 40,
        width
      }}>
        <NavButton
          text="Unread stories"
          hasBottomBorder={true}
          hasTopBorder={true}
          icon={ getRizzleButtonIcon('unread', hslString('rizzleText')) }
          index={0}
          onPress={() => {
            navigation.navigate('Items')
          }}
          scrollAnim={scrollAnim}
        />
        <Animated.View style={{
          transform: [{
            translateY: scrollAnim.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: [-.5, 0, 0]
            })
          }]
        }}>
          <TextButton
            text="Add feeds"
            buttonStyle={{ 
              marginTop: 40,
              marginBottom: 0,
            }}
            onPress={showAddFeeds}
          />
        </Animated.View>
      </View>
    )
  }
}

export default FeedsScreen
