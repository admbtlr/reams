import React from 'react'
import {
  Dimensions,
  FlatList,
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
        marginBottom: 64
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
            onPress={() => {
              this.props.markAllRead()
            }}
            text="Remove all items" />
          <TextButton
            buttonStyle={{
              marginRight: margin
            }}
            onPress={() => {
              this.props.markAllRead(Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000))
            }}
            text="Remove old items" />
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
  }

  componentDidMount = () => {
    SplashScreen.hide()
  }

  clearFeedFilter = () => {
    this.props.clearFeedFilter()
    this.props.clearReadItems()
  }

  render = () => {
    // console.log('Render feeds screen!')
    const width = Dimensions.get('window').width
    const margin = width * 0.05

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
          />}
          renderItem={this.renderFeed}
          scrollEnabled={this.state.scrollEnabled}
        />
        { this.state.selectedFeedElement &&
          <Feed {...this.state.selectedFeedElement.props}
            extraStyle={{
              position: 'absolute',
              top: this.state.selectedFeedElementYCoord,
              left: margin
            }}
            growMe={true}
            yCoord={this.state.selectedFeedElementYCoord}
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
    if (this.state.selectedFeedElement !== feed) {
      this.setState({
        ...this.state,
        selectedFeedElement: feed,
        selectedFeedElementYCoord: yCoord
      })
    }
  }

  renderFeed = ({item}) => {
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
    />
  }
}

export default FeedsScreen
