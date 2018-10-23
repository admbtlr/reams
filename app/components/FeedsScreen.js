import React from 'react'
import {
  Dimensions,
  FlatList,
  ScrollView,
  Text,
  View
} from 'react-native'
import Feed from '../containers/Feed'
import { hslString } from '../utils/colors'

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
  }

  render = () => {
    console.log('Render feeds screen!')
    const width = Dimensions.get('window').width
    const margin = width * 0.05

    const everything = {
      title: 'Everything',
      _id: '999999',
      numItems: this.props.feeds.reduce((accum, item) => accum + item.numItems, 0)
    }

    return (
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: hslString('rizzleBG'),
        // marginTop: margin
      }}>
        <FlatList
          data={[everything].concat(this.props.feeds)}
          keyExtractor={feed => feed._id}
          contentContainerStyle={{
            marginLeft: margin,
            marginRight: margin
          }}
          ListHeaderComponent={<Text style={{
            fontFamily: 'IBMPlexMono-Bold',
            fontSize: 48,
            marginTop: 48,
            marginBottom: 24,
            textAlign: 'center',
            color: 'rgba(100,0,0,0.3)'
          }}>Your Feeds</Text>}
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
