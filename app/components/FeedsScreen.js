import React from 'react'
import {
  Dimensions,
  FlatList,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextBox,
  TouchableOpacity,
  View
} from 'react-native'
import SplashScreen from 'react-native-splash-screen'
import { NativeViewGestureHandler } from 'react-native-gesture-handler'
import FeedContracted from '../containers/FeedContracted'
import FeedExpanded from '../containers/FeedExpanded'
import TextButton from './TextButton'
import AddFeedForm from './AddFeedForm'
import Heading from './Heading'
import XButton from './XButton'
import ItemsDirectionRadiosContainer from './ItemsDirectionRadios'
import { hslString } from '../utils/colors'

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
          text: 'Mark old items read?',
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
    const screenWidth = Dimensions.get('window').width
    const margin = screenWidth * 0.05
    const buttonWidth = (screenWidth - margin * 3) / 2
    const textStyles = {
      fontFamily: 'IBMPlexSans',
      fontSize: 18,
      lineHeight: 27,
      marginTop: margin / 2 ,
      marginBottom: margin / 2,
      padding: 8,
      textAlign: 'left',
      color: hslString('rizzleText')
    }
    return (
      <View style={{
        marginTop: 55,
        marginBottom: 64,
        width: Dimensions.get('window').width * 0.9
      }}>
        <Heading
          title='Your Feeds'
          showClose={true}
          onClose={() => {
            this.props.clearFeedFilter()
            this.props.navigation.navigate('Items')
          }}
        />
        <Text style={{
          ...textStyles,
          marginBottom: 0
        }}>You are using <Text style={{ fontFamily: 'IBMPlexSans-Bold'}}>{ this.props.backend }</Text> to manage your feeds.</Text>
        <TextButton
          isCompact={true}
          isInverted={true}
          text="Change account"
          onPress={() => this.props.navigation.navigate('Account')}
          buttonStyle={{
            alignSelf: 'flex-end',
            marginBottom: margin / 2,
            width: buttonWidth
          }}
        />
        <Heading />
        { this.props.itemSort !== 'rizzlewards' &&
          <Text style={{
            ...textStyles,
            marginTop: 0,
            paddingTop: 0
          }}>You have <Text style={{ fontFamily: 'IBMPlexSans-Bold'}}>{ this.props.numItems } unread items</Text>.</Text>
        }
        <View style={{
          flexDirection: 'row',
          marginBottom: margin / 2,
          marginRight: 0 - margin
        }}>
          <TextButton
            buttonStyle={{
              marginRight: margin
            }}
            fgColor='#993030'
            isCompact={true}
            onPress={() => {
              this.props.markAllRead()
            }}
            text="Clear all items" />
          <TextButton
            buttonStyle={{
              marginRight: margin
            }}
            fgColor='#993030'
            isCompact={true}
            onPress={() => {
              this.showMarkOldReadModal(this)
            }}
            text="Clear old items" />
        </View>
        <ItemsDirectionRadiosContainer />
        <Heading title='' />
        <View style={{ height: margin*2 }} />
        <TextButton
          text="Add a new feed"
          buttonStyle={{ marginBottom: 0 }}
          isExpandable={true}
          renderExpandedView={() => <AddFeedForm />}
        />
      </View>
    )
  }
}

class FeedsScreen extends React.Component {

  constructor (props) {
    super(props)
    this.props = props
    this.state = {
      scrollEnabled: true,
      selectedFeedElement: null
    }

    this.disableScroll = this.disableScroll.bind(this)
    this.renderFeed = this.renderFeed.bind(this)
    this.clearFeedFilter = this.clearFeedFilter.bind(this)
    this.selectFeed = this.selectFeed.bind(this)
    this.onFeedPress = this.onFeedPress.bind(this)
  }

  componentDidMount = () => {
    SplashScreen.hide()

    // // set up deep linking
    // // https://medium.com/react-native-training/d87c39a1ad5e
    // if (Platform.OS === 'android') {
    //   Linking.getInitialURL().then(url => {
    //     this.navigate(url);
    //   })
    // } else {
    //   Linking.addEventListener('url', this.handleOpenURL)
    // }
  }

  // componentWillUnmount () {
  //   Linking.removeEventListener('url', this.handleOpenURL)
  // }

  // handleOpenURL = (event) => {
  //   this.navigate(event.url)
  // }

  clearFeedFilter = () => {
    this.props.clearFeedFilter()
    this.props.clearReadItems()
  }

  shouldComponentUpdate (nextProps, nextState) {
    // don't render while displaying an expanded feed
    if (this.state.showExpandingFeed && nextState.showExpandingFeed) {
      return false
    }
    return true
  }

  componentDidUpdate (prevProps, prevState) {
    // if we're deselecting a feed, wait for the animation to finish, then hide the animatable
    if (this.state.prevSelectedFeedElement !== null &&
      this.state.selectedFeedElement === null) {
      setTimeout(() => {
        // make sure that the user hasn't selected another feed in the meantime
        if (this.state.selectedFeedElement === null) {
          this.setState({
            ...this.state,
            showExpandingFeed: false,
            prevSelectedFeedElement: null,
            prevSelectedFeedElementXCoord: null,
            prevSelectedFeedElementYCoord: null
          })
        }
      }, 200)
    }
  }

  render = () => {
    // console.log('Render feeds screen!')
    const width = Dimensions.get('window').width
    const margin = width * 0.04
    const extraFeedProps = this.state.selectedFeedElement ?
      this.state.selectedFeedElement.props :
      (this.state.prevSelectedFeedElement ?
        this.state.prevSelectedFeedElement.props :
        {})

    return (
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: hslString('rizzleBG')
        // marginTop: margin
      }}>
        <StatusBar
          animated={true}
          barStyle="dark-content"
          showHideTransition="slide"/>
        <FlatList
          data={this.props.feeds}
          keyExtractor={feed => feed._id}
          contentContainerStyle={{
            marginLeft: margin,
            marginRight: margin
          }}
          ListHeaderComponent={<ListHeaderComponent
            backend={this.props.backend}
            clearFeedFilter={this.clearFeedFilter}
            itemSort={this.props.itemSort}
            navigation={this.props.navigation}
            numItems={this.props.numItems}
            numFeeds={this.props.feeds.length}
            markAllRead={this.props.markAllRead}
            showModal={this.props.showModal}
          />}
          numColumns={width > 500 ? 2 : 1}
          renderItem={this.renderFeed}
          scrollEnabled={this.state.scrollEnabled}
          onScrollBeginDrag={() => { this.isScrolling = true }}
          onScrollEndDrag={() => { this.isScrolling = false }}
        />
        { this.state.showExpandingFeed &&
          (this.state.selectedFeedElement ?
            !this.state.selectedFeedElement.props.isDeleted :
            true) &&
          <FeedExpanded {...extraFeedProps}
            deselectFeed={this.deselectFeed}
            extraStyle={{
              position: 'absolute',
              top: this.state.selectedFeedElementYCoord || this.state.prevSelectedFeedElementYCoord,
              left: this.state.selectedFeedElementXCoord || this.state.prevSelectedFeedElementXCoord
            }}
            growMe={this.state.selectedFeedElement !== null}
            xCoord={this.state.selectedFeedElementXCoord || this.state.prevSelectedFeedElementXCoord}
            yCoord={this.state.selectedFeedElementYCoord || this.state.prevSelectedFeedElementYCoord}
            scaleAnim={this.state.selectedFeedElementScaleAnim}
            gestureState={this.state.selectedFeedElementGestureState}
          />
        }
    </View>
    )
  }

  disableScroll = (disable) => {
    if (this.state.scrollEnabled !== !disable) {
      this.setState({
        ...this.state,
        scrollEnabled: !disable
      })
    }
  }

  onFeedPress = (feed) => {
    const testForScrolling = () => {
      if (!this.isScrolling) {
        this.selectFeed(feed)
      }
    }
    setTimeout(testForScrolling.bind(this), 200)
  }

  selectFeed = (feed) => {
    if (this.state.selectedFeedElement !== feed) {
      const prevSelectedFeedElement = feed === null ?
        this.state.selectedFeedElement :
        null
      const prevSelectedFeedElementXCoord = (feed === null || feed.currentX === null) ?
        this.state.selectedFeedElementXCoord :
        null
      const prevSelectedFeedElementYCoord = (feed === null || feed.currentY === null) ?
        this.state.selectedFeedElementYCoord :
        null
      let nextState = {
        ...this.state,
        selectedFeedElement: feed,
        selectedFeedElementXCoord: feed && feed.currentX,
        selectedFeedElementYCoord: feed && feed.currentY,
        selectedFeedElementScaleAnim: feed && feed._scale,
        selectedFeedElementGestureState: feed && feed.gestureState,
        prevSelectedFeedElement,
        prevSelectedFeedElementXCoord,
        prevSelectedFeedElementYCoord
      }
      if (feed !== null || this.state.selectedFeedElement !== null) {
        nextState.showExpandingFeed = true
      }
      this.setState(nextState)
    }
  }

  deselectFeed = () => {
    const prevSelectedFeedElement = this.state.selectedFeedElement
    const prevSelectedFeedElementXCoord = this.state.selectedFeedElementXCoord
    const prevSelectedFeedElementYCoord = this.state.selectedFeedElementYCoord
    this.setState({
      ...this.state,
      selectedFeedElement: null,
      selectedFeedElementXCoord: null,
      selectedFeedElementYCoord: null,
      selectedFeedElementScaleAnim: null,
      selectedFeedElementGestureState: null,
      prevSelectedFeedElement,
      prevSelectedFeedElementXCoord,
      prevSelectedFeedElementYCoord,
      showExpandingFeed: false
    })
  }

  renderFeed = ({item, index}) => {
    const isSelected = this.state.selectedFeedElement !== null &&
      this.state.selectedFeedElement.props.feedId === item._id
    return item && <FeedContracted
      feedTitle={item.title}
      feedDescription={item.description}
      feedColor={item.color}
      feedId={item._id}
      feedIsLiked={item.isLiked}
      feedIsMuted={item.isMuted}
      feedOriginalId={item.id}
      feedNumRead={item.number_read}
      feedReadingTime={item.reading_time}
      index={index}
      navigation={this.props.navigation}
      disableScroll={this.disableScroll}
      selectFeed={this.onFeedPress}
      isSelected={isSelected}
      preDeselectFeed={this.preDeselectFeed}
    />
  }
}

export default FeedsScreen
