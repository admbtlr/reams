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
import Feed from '../containers/Feed'
import TextButton from './TextButton'
import { hslString } from '../utils/colors'

class ListHeaderComponent extends React.Component {
  constructor (props) {
    super(props)
    this.props = props
  }

  render = () => {
    const textStyles = {
      fontFamily: 'IBMPlexSans',
      fontSize: 20,
      lineHeight: 32,
      marginTop: 16,
      marginBottom: 26,
      padding: 8,
      textAlign: 'left',
      color: 'hsl(300, 20%, 20%)'
    }
    return (
      <View style={{
        marginBottom: 64
      }}>
        <Text style={{
          fontFamily: 'IBMPlexSerif-Bold',
          fontSize: 32,
          lineHeight: 32,
          marginTop: 60,
          marginBottom: 8,
          textAlign: 'left',
          color: 'hsl(300, 20%, 20%)',
        }}>Your Feeds</Text>
        <View style={{
          height: 1,
          backgroundColor: 'hsl(300, 20%, 20%)',
          opacity: 0.2,
          marginBottom: 16
        }} />
        <Text style={textStyles}>You are currently using <Text style={{ fontFamily: 'IBMPlexSans-Bold'}}>Rizzle</Text> to manage your feeds.</Text>
        <TextButton text="Use a different account" />
        <Text style={textStyles}>You have subscribed to <Text style={{ fontFamily: 'IBMPlexSans-Bold'}}>43 feeds</Text> and have <Text style={{ fontFamily: 'IBMPlexSans-Bold'}}>574 unread items</Text>.</Text>
        <View style={{
          flexDirection: 'row',
          marginBottom: 16
        }}>
          <TextButton text="Remove items" />
          <TextButton
            onPress={() => {
              this.props.clearFeedFilter()
              this.props.navigation.navigate('Items')
            }}
            text="Go to items" />
        </View>
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

  clearFeedFilter = () => {
    this.props.clearFeedFilter()
    this.props.clearReadItems()
  }

  render = () => {
    console.log('Render feeds screen!')
    const width = Dimensions.get('window').width
    const margin = width * 0.05

    return (
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: hslString('rizzleBG'),
        backgroundColor: '#F2ECD9'
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
      feedColor={item.color}
      feedId={item._id}
      navigation={this.props.navigation}
      disableScroll={this.disableScroll}
      selectFeed={this.selectFeed}
    />
  }
}

export default FeedsScreen
