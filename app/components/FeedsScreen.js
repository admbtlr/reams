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
import { hslString } from '../utils/colors'

class ListHeaderComponent extends React.Component {
  constructor (props) {
    super(props)
    this.props = props
  }

  render = () => (<View>
    <Text style={{
      fontFamily: 'IBMPlexMono',
      fontSize: 32,
      marginTop: 48,
      marginBottom: 24,
      textAlign: 'center',
      color: 'hsl(300, 20%, 20%)'
    }}>Your Feeds</Text>
    <Text style={{
      fontFamily: 'IBMPlexMono',
      fontSize: 20,
      lineHeight: 32,
      marginBottom: 24,
      padding: 8,
      textAlign: 'left',
      color: 'hsl(300, 20%, 20%)'
    }}>You are currently using <Text style={{ fontFamily: 'IBMPlexMono-Bold'}}>Rizzle</Text> to manage your feeds. You are subscribed to <Text style={{ fontFamily: 'IBMPlexMono-Bold'}}>43 feeds</Text> and have <Text style={{ fontFamily: 'IBMPlexMono-Bold'}}>574 unread items</Text>.</Text>
    <TouchableOpacity style={{
      backgroundColor: 'transparent',
      color: 'hsl(300, 20%, 20%)',
      width: '100%',
      marginBottom: 24,
      height: 60
    }}>
      <Text style={{
        fontFamily: 'IBMPlexMono',
        fontSize: 20,
        textAlign: 'center',
        textDecorationLine: 'underline',
        color: 'hsl(300, 20%, 20%)'
      }}>Use a different account</Text>
    </TouchableOpacity>
    <View style={{
      flexDirection: 'row',
      marginBottom: 36
    }}>
      <TouchableOpacity style={{
        backgroundColor: 'hsl(300, 20%, 20%)',
        borderRadius: 12,
        marginRight: 24,
        paddingTop: 16,
        paddingBottom: 16,
        flex: 1
      }}>
        <Text style={{
        fontFamily: 'IBMPlexMono',
        fontSize: 18,
        textAlign: 'center',
        color: '#F2ECD9'}}>Mark all read</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          backgroundColor: 'hsl(300, 20%, 20%)',
          borderRadius: 12,
          paddingTop: 16,
          paddingBottom: 16,
          flex: 1
        }}
        onPress={() => {
          this.props.clearFeedFilter()
          this.props.navigation.navigate('Items')
        }}>
        <Text style={{
        fontFamily: 'IBMPlexMono',
        fontSize: 18,
        textAlign: 'center',
        color: '#F2ECD9'}}>Go to items</Text>
      </TouchableOpacity>
    </View>
  </View>
  )
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
