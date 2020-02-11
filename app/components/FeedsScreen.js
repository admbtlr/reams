import React, { Fragment } from 'react'
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
import { VibrancyView } from 'react-native-blur'
import FeedContracted from '../containers/FeedContracted'
import FeedExpanded from '../containers/FeedExpanded'
import TextButton from './TextButton'
import AddFeedForm from './AddFeedForm'
import Heading from './Heading'
import XButton from './XButton'
import ItemsDirectionRadiosContainer from './ItemsDirectionRadios'
import NewFeedsList from './NewFeedsList'
import { hslString } from '../utils/colors'
import { deepEqual } from '../utils/'
import Animated from 'react-native-reanimated'
import { fontSizeMultiplier } from '../utils'

const { Value } = Animated

class FeedsScreen extends React.Component {

  constructor (props) {
    super(props)
    this.props = props
    this.state = {
      scrollEnabled: true,
      modal: null
    }
    this.activeFeedId = new Value(-1)

    this.open = this.open.bind(this)
    this.close = this.close.bind(this)

    const { feeds, navigation } = this.props
    this.props.navigation.addListener('didFocus', () => {
      if (feeds.length === 0) {
        // navigation.push('Modal', {
        //   childView: <NewFeedsList
        //     close={() => {
        //       navigation.goBack(null)
        //     }}
        //     navigation={navigation}
        //   />
        // })
      }
    })
  }

  shouldComponentUpdate (nextProps, nextState) {
    // don't render while displaying an expanded feed
    if (this.state.modal !== nextState.modal) {
      return true
    } else if (this.props.backend === nextProps.backend &&
      deepEqual(this.props.feeds, nextProps.feeds) &&
      this.props.numItems === nextProps.numItems) {
      return false
    }
    return true
  }

  // componentDidUpdate (prevProps, prevState) {
  //   // if we're deselecting a feed, wait for the animation to finish, then hide the animatable
  //   if (this.state.prevSelectedFeedElement !== null &&
  //     this.state.selectedFeedElement === null) {
  //     setTimeout(() => {
  //       // make sure that the user hasn't selected another feed in the meantime
  //       if (this.state.selectedFeedElement === null) {
  //         this.setState({
  //           ...this.state,
  //           showExpandingFeed: false,
  //           prevSelectedFeedElement: null,
  //           prevSelectedFeedElementXCoord: null,
  //           prevSelectedFeedElementYCoord: null
  //         })
  //       }
  //     }, 200)
  //   }
  // }

  // componentDidMount = () => {
  //   SplashScreen.hide()
  // }

  open = (feed, index, position) => {
    this.activeFeedId.setValue(feed._id)
    this.setState({
      modal: { feed, position }
    })
  }

  close = () => {
    this.activeFeedId.setValue(-1)
    this.setState({
      modal: null
    })
  }

  render = () => {
    const { navigation } = this.props

    const isShowingExpandedFeed = this.state.showExpandingFeed &&
      (this.state.selectedFeedElement ?
        !this.state.selectedFeedElement.props.isDeleted :
        true)

    const { open, close, activeFeedId } = this;
    const { modal } = this.state;

    console.log('Render feeds screen!')
    console.log((isShowingExpandedFeed ? 'S' : 'Not s') + 'howing expanded feed')
    console.log(this.state)
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
          initialNumToRender={3}
          ListHeaderComponent={<ListHeaderComponent
            backend={this.props.backend}
            clearReadItems={this.props.clearReadItems}
            itemSort={this.props.itemSort}
            navigation={navigation}
            numItems={this.props.numItems}
            numFeeds={this.props.feeds.length}
            markAllRead={this.props.markAllRead}
            setIndex={this.props.setIndex}
            showModal={this.props.showModal}
          />}
          numColumns={width > 500 ? 2 : 1}
          renderItem={this.renderFeed}
          scrollEnabled={this.state.scrollEnabled}
          onScrollBeginDrag={() => { this.isScrolling = true }}
          onScrollEndDrag={() => { this.isScrolling = false }}
          windowSize={6}
        />
        { modal !== null && (
            <FeedExpanded {...modal} {...{ close }} />
          )
        }
    </View>
    )
  }

  // setExpandAnim = (expandAnim) => {
  //   this.setState({
  //     expandAnim
  //   })
  // }

  // disableScroll = (disable) => {
  //   if (this.state.scrollEnabled !== !disable) {
  //     this.setState({
  //       ...this.state,
  //       scrollEnabled: !disable
  //     })
  //   }
  // }

  // onFeedPress = (feed) => {
  //   const testForScrolling = () => {
  //     if (!this.isScrolling) {
  //       this.selectFeed(feed)
  //     }
  //   }
  //   setTimeout(testForScrolling.bind(this), 200)
  // }

  // selectFeed = (feed) => {
  //   if (this.state.selectedFeedElement !== feed) {
  //     const prevSelectedFeedElement = feed === null ?
  //       this.state.selectedFeedElement :
  //       null
  //     const prevSelectedFeedElementXCoord = (feed === null || feed.currentX === null) ?
  //       this.state.selectedFeedElementXCoord :
  //       null
  //     const prevSelectedFeedElementYCoord = (feed === null || feed.currentY === null) ?
  //       this.state.selectedFeedElementYCoord :
  //       null
  //     let nextState = {
  //       ...this.state,
  //       selectedFeedElement: feed,
  //       selectedFeedElementXCoord: feed && feed.currentX,
  //       selectedFeedElementYCoord: feed && feed.currentY,
  //       selectedFeedElementScaleAnim: feed && feed._scale,
  //       selectedFeedElementGestureState: feed && feed.gestureState,
  //       prevSelectedFeedElement,
  //       prevSelectedFeedElementXCoord,
  //       prevSelectedFeedElementYCoord
  //     }
  //     if (feed !== null || this.state.selectedFeedElement !== null) {
  //       nextState.showExpandingFeed = true
  //     }
  //     this.setState(nextState)
  //   }
  // }

  // deselectFeed = () => {
  //   const prevSelectedFeedElement = this.state.selectedFeedElement
  //   const prevSelectedFeedElementXCoord = this.state.selectedFeedElementXCoord
  //   const prevSelectedFeedElementYCoord = this.state.selectedFeedElementYCoord
  //   this.setState({
  //     ...this.state,
  //     modalElement: null,
  //     selectedFeedElementXCoord: null,
  //     selectedFeedElementYCoord: null,
  //     selectedFeedElementScaleAnim: null,
  //     selectedFeedElementGestureState: null,
  //     prevSelectedFeedElement,
  //     prevSelectedFeedElementXCoord,
  //     prevSelectedFeedElementYCoord,
  //     showExpandingFeed: false,
  //     scrollEnabled: true
  //   })
  // }

  renderFeed = ({item, index}) => {
    // const isSelected = this.state.selectedFeedElement !== null &&
    //   this.state.selectedFeedElement.props.feedId === item._id
    const { open, close, activeFeedId } = this;
    const { modal } = this.state;
    return item && <FeedContracted
      key={item._id}
      feed={item}
      index={index}
      navigation={this.props.navigation}
      disableScroll={this.disableScroll}
      {...{ modal, open, activeFeedId }}
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
    const screenWidth = Dimensions.get('window').width
    const margin = screenWidth * 0.05
    const buttonWidth = (screenWidth - margin * 3) / 2
    const { navigation } = this.props
    const textStyles = {
      fontFamily: 'IBMPlexSans',
      fontSize: 18 * fontSizeMultiplier(),
      lineHeight: 27 * fontSizeMultiplier(),
      marginTop: margin / 2 ,
      marginBottom: margin / 2,
      padding: 8 * fontSizeMultiplier(),
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
          showBack={true}
          onBack={() => {
            this.props.clearReadItems()
            this.props.setIndex(0)
            navigation.navigate('Items')
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
          onPress={() => navigation.navigate('Account')}
          buttonStyle={{
            alignSelf: 'flex-end',
            marginBottom: margin / 2,
            minWidth: buttonWidth
          }}
        />
        <Heading />
        <Text style={{
          ...textStyles,
          marginTop: 0,
          paddingTop: 0
        }}>You have <Text style={{ fontFamily: 'IBMPlexSans-Bold'}}>{ this.props.numItems } unread items</Text>.</Text>
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
            text="Discard all" />
          <TextButton
            buttonStyle={{
              marginRight: margin
            }}
            fgColor='#993030'
            isCompact={true}
            onPress={() => {
              this.showMarkOldReadModal(this)
            }}
            text="Discard old" />
        </View>
        <ItemsDirectionRadiosContainer />
        <Heading title='' />
        <View style={{ height: margin*2 }} />
        <TextButton
          text="Add some feeds"
          buttonStyle={{ marginBottom: 0 }}
          onPress={() => {
            navigation.push('Modal', {
              childView: <NewFeedsList
                close={() => {
                  navigation.goBack(null)
                }}
                navigation={navigation}
              />
            })
          }}
        />
      </View>
    )
  }
}

export default FeedsScreen
