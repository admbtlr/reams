import React, { Fragment } from 'react'
import {
  Animated,
  Dimensions,
  FlatList,
  StatusBar,
  TouchableOpacity,
  Text,
  View
} from 'react-native'
import FeedContracted from '../containers/FeedContracted'
import FeedExpanded from '../containers/FeedExpanded'
import TextButton from './TextButton'
import Heading from './Heading'
import ItemsDirectionRadiosContainer from './ItemsDirectionRadios'
import NewFeedsList from './NewFeedsList'
import { hslString } from '../utils/colors'
import { deepEqual, getInset, getMargin } from '../utils/'
import { fontSizeMultiplier } from '../utils'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import { useStore } from 'react-redux'
import FeedFilterIndicator from './FeedFilterIndicator'

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)

class FeedsScreen extends React.Component {

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
        navigation={navigation}
      />
    })
  }

  componentDidMount = () => {
    if (this.props.feeds.length === 0) {
      setTimeout(this.showAddFeeds.bind(this), 500)
    }
  }

  componentDidUpdate = () => {
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
    const margin = getMargin()
    const extraFeedProps = this.state.selectedFeedElement ?
      this.state.selectedFeedElement.props :
      (this.state.prevSelectedFeedElement ?
        this.state.prevSelectedFeedElement.props :
        {})

    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: hslString('rizzleBG')
          // marginTop: margin
        }}
        testID='feeds-screen'
      >
        <StatusBar
          animated={true}
          barStyle="dark-content"
          showHideTransition="slide"/>
        <AnimatedFlatList
          data={this.props.feeds}
          key={width}
          keyExtractor={feed => feed._id}
          contentContainerStyle={{
            marginLeft: margin,
            marginRight: margin
          }}
          initialNumToRender={3}
          ListHeaderComponent={<ListHeaderComponent
            backend={this.props.backend}
            clearFeedFilter={this.props.clearFeedFilter}
            clearReadItems={this.props.clearReadItems}
            navigation={navigation}
            numItems={this.props.numItems}
            numFeeds={this.props.feeds.length}
            markAllRead={this.props.markAllRead}
            scrollAnim={this.scrollAnim}
            setIndex={this.props.setIndex}
            showAddFeeds={this.showAddFeeds.bind(this)}
            showModal={this.props.showModal}
          />}
          numColumns={width > 500 ? 2 : 1}
          onScroll={Animated.event(
            [{ nativeEvent: {
              contentOffset: { y: this.scrollAnim }
            }}],
            {
              useNativeDriver: true
            }
          )}
          scrollEventThrottle={1}

          renderItem={this.renderFeed}
          scrollEnabled={this.state.scrollEnabled}
          showsVerticalScrollIndicator={false}
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

  renderFeed = ({item, index}) => {
    // const isSelected = this.state.selectedFeedElement !== null &&
    //   this.state.selectedFeedElement.props.feedId === item._id
    const { open } = this;
    const { modal } = this.state;
    return item && <FeedContracted
      key={item._id}
      feed={item}
      index={index}
      navigation={this.props.navigation}
      disableScroll={this.disableScroll}
      {...{ modal, open }}
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
    const margin = getMargin()
    const buttonWidth = (screenWidth - margin * 3) / 2
    const { navigation, isPortrait } = this.props
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
        marginBottom: 40,
        width: screenWidth - getInset() * (isPortrait ? 2 : 4)
      }}>
        {/*}<Text style={{
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
            minWidth: buttonWidth,
            width: buttonWidth
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
          <View style={{ height: margin*2 }} />{*/}
        <NavButton
          text="Unread stories"
          hasBottomBorder={true}
          hasTopBorder={true}
          icon={ getRizzleButtonIcon('unread', hslString('rizzleText')) }
          index={0}
          onPress={() => {
            this.props.navigation.navigate('Items')
          }}
          scrollAnim={this.props.scrollAnim}
          index={1}
        />
        <FeedFilterIndicator 
          scrollAnim={this.props.scrollAnim}
        />
        <Animated.View style={{
          transform: [{
            translateY: this.props.scrollAnim.interpolate({
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
            onPress={this.props.showAddFeeds}
          />
        </Animated.View>
      </View>
    )
  }
}

export default FeedsScreen
