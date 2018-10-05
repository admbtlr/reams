import React from 'react'
import {
  Animated,
  Dimensions,
  Image,
  Text,
  View
} from 'react-native'
import { hslString } from '../utils/colors'

class Feed extends React.Component {

  constructor (props) {
    super(props)
    this.props = props

    this.state = {
      scaleAnim: new Animated.Value(1)
    }
  }

  render = () => {
    const {coverImagePath, feed, numFeedItems} = this.props

    const that = this
    const width = Dimensions.get('window').width
    const margin = width * 0.05
    const cardWidth = width - margin * 2
    const coverImageUrl = coverImagePath ? `file://${coverImagePath}` : null
    const coverImage = coverImageUrl ?
      <Image
        source={{uri: coverImagePath}}
        style={{width: cardWidth, height: cardWidth-130}}
      /> :
      null

    return (
      <View
        onStartShouldSetResponder={e => true}
        onResponderGrant={e => {
          console.log('Something happened')
          Animated.timing(that.state.scaleAnim, {
            toValue: 0.8,
            duration: 200
          })
          return true
        }}
        style={{
          height: cardWidth,
          width: cardWidth,
          borderColor: hslString(feed.color),
          borderWidth: 1,
          borderRadius: 20,
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          backgroundColor: hslString(feed.color),
          marginBottom: margin,
          shadowColor: 'black',
          shadowRadius: 10,
          shadowOpacity: 1,
          overflow: 'hidden',
          transform: [
            { scaleX: this.state.scaleAnim },
            { scaleY: 1 }
          ]
        }}>
        <View style={{
          borderTopLeftRadius: 19,
          borderTopRightRadius: 19,
          height: 130,
          width: '100%',
          paddingTop: margin,
          paddingLeft: margin,
          backgroundColor: 'white',
        }}>
          <Text style={{
            color: hslString(feed.color),
            fontFamily: 'IBMPlexMono-Light',
            fontSize: 24,
            marginBottom: 12
          }}>{feed.title}</Text>
          <Text style={{
            color: hslString(feed.color),
            fontFamily: 'IBMPlexMono-Light',
            fontSize: 18
          }}>{numFeedItems} unread</Text>
        </View>
        {coverImage}
      </View>
    )
  }
}

export default Feed
