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

    return (
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: hslString('rizzleBG'),
        marginTop: margin
      }}>
        <FlatList
          data={this.props.feeds}
          renderItem={this.renderFeed}
          keyExtractor={feed => feed._id}
          contentContainerStyle={{
            marginLeft: margin,
            marginRight: margin
          }}
        />
    </View>
    )
  }

  renderFeed = ({item}) => {
    return <Feed feed={item}/>
  }
}

export default FeedsScreen
