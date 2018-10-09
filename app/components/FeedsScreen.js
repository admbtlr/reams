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
  render = () => {
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
        marginTop: margin
      }}>
        <FlatList
          data={[everything].concat(this.props.feeds)}
          renderItem={this.renderFeed}
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
        />
    </View>
    )
  }

  renderFeed = ({item}) => {
    return <Feed
      feed={item}
      navigation={this.props.navigation}
    />
  }
}

export default FeedsScreen
