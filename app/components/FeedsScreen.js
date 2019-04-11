import React from 'react'
import {
  Dimensions,
  FlatList,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import SplashScreen from 'react-native-splash-screen'
import Feed from '../containers/Feed'
import TextButton from './TextButton'
import Heading from './Heading'
import XButton from './XButton'
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
    const margin = Dimensions.get('window').width * 0.05
    const textStyles = {
      fontFamily: 'IBMPlexSans',
      fontSize: 20,
      lineHeight: 32,
      marginTop: margin,
      marginBottom: margin,
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
        <Text style={textStyles}>You are currently using <Text style={{ fontFamily: 'IBMPlexSans-Bold'}}>Rizzle</Text> to manage your feeds.</Text>
        <TextButton
          text="Use a different account"
          onPress={() => this.props.navigation.navigate('Account')} />
        <Text style={textStyles}>You have subscribed to <Text style={{ fontFamily: 'IBMPlexSans-Bold'}}>{ this.props.numFeeds } feeds</Text> and have <Text style={{ fontFamily: 'IBMPlexSans-Bold'}}>{ this.props.numItems } unread items</Text>.</Text>
        <View style={{
          flexDirection: 'row',
          marginBottom: margin,
          marginRight: 0 - margin
        }}>
          <TextButton
            buttonStyle={{
              marginRight: margin
            }}
            fgColor='#993030'
            onPress={() => {
              this.props.markAllRead()
            }}
            text="Mark all read" />
          <TextButton
            buttonStyle={{
              marginRight: margin
            }}
            fgColor='#993030'
            onPress={() => {
              this.showMarkOldReadModal(this)
            }}
            text="Mark old read" />
        </View>
        <TextButton text="Start reading" />
        <View style={{ height: margin*2 }} />
        <Heading title='' />
        <View style={{ height: margin*2 }} />
        <TextButton text="Add a new feed" />
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

  componentWillUnmount () {
    Linking.removeEventListener('url', this.handleOpenURL)
  }

  handleOpenURL = (event) => {
    this.navigate(event.url)
  }

  navigate = (url) => { // E
    const { navigate } = this.props.navigation
    const route = url.replace(/.*?:\/\//g, '')
    // const id = route.match(/\/([^\/]+)\/?$/)[1]
    const routeName = route.split('/')[0]

    if (routeName === 'account') {
      navigate('Account', {})
    };
  }

  clearFeedFilter = () => {
    this.props.clearFeedFilter()
    this.props.clearReadItems()
  }

  shouldComponentUpdate (nextProps, nextState) {
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
            prevSelectedFeedElementYCoord: null
          })
        }
      }, 200)
    }
  }

  render = () => {
    // console.log('Render feeds screen!')
    const width = Dimensions.get('window').width
    const margin = width * 0.05
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
        <StatusBar showHideTransition="slide"/>
        <FlatList
          data={this.props.feeds}
          keyExtractor={feed => feed._id}
          contentContainerStyle={{
            marginLeft: margin,
            marginRight: margin
          }}
          ListHeaderComponent={<ListHeaderComponent
            clearFeedFilter={this.clearFeedFilter}
            navigation={this.props.navigation}
            numItems={this.props.numItems}
            numFeeds={this.props.feeds.length}
            markAllRead={this.props.markAllRead}
            showModal={this.props.showModal}
          />}
          renderItem={this.renderFeed}
          scrollEnabled={this.state.scrollEnabled}
        />
        { this.state.showExpandingFeed &&
          (this.state.selectedFeedElement ?
            !this.state.selectedFeedElement.props.isDeleted :
            true) &&
          <Feed {...extraFeedProps}
            extraStyle={{
              position: 'absolute',
              top: this.state.selectedFeedElementYCoord || this.state.prevSelectedFeedElementYCoord,
              left: margin
            }}
            growMe={this.state.selectedFeedElement !== null}
            yCoord={this.state.selectedFeedElementYCoord || this.state.prevSelectedFeedElementYCoord}
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

  selectFeed = (feed, yCoord) => {
    console.log('selectFeed called')
    console.log(feed)
    console.log(this.state)
    if (this.state.selectedFeedElement !== feed) {
      const prevSelectedFeedElement = feed === null ?
        this.state.selectedFeedElement :
        null
      const prevSelectedFeedElementYCoord = yCoord === null ?
        this.state.selectedFeedElementYCoord :
        null
      let nextState = {
        ...this.state,
        selectedFeedElement: feed,
        selectedFeedElementYCoord: yCoord,
        scrollEnabled: feed === null,
        prevSelectedFeedElement,
        prevSelectedFeedElementYCoord
      }
      if (feed !== null || this.state.selectedFeedElement !== null) {
        nextState.showExpandingFeed = true
      }
      this.setState(nextState)
    }
  }

  renderFeed = ({item}) => {
    const isSelected = this.state.selectedFeedElement !== null &&
      this.state.selectedFeedElement.props.feedId === item._id
    return item && <Feed
      feedTitle={item.title}
      feedDescription={item.description}
      feedColor={item.color}
      feedId={item._id}
      feedOriginalId={item.id}
      feedNumRead={item.number_read}
      feedReadingTime={item.reading_time}
      navigation={this.props.navigation}
      disableScroll={this.disableScroll}
      selectFeed={this.selectFeed}
      preDeselectFeed={this.preDeselectFeed}
      isSelected={isSelected}
    />
  }
}

export default FeedsScreen
