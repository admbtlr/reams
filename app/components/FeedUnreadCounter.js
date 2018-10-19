import React from 'react'
import {
  Text,
  View
} from 'react-native'
import { hslString } from '../utils/colors'

class FeedUnreadCounter extends React.Component {

  constructor (props) {
    super(props)
    this.props = props
  }

  render () {
    const {numFeedItems, feedColor} = this.props
    const textStyles = {
      color: 'white',
      fontFamily: 'IBMPlexMono-Light',
      textAlign: 'center'
    }

    return (
      <View style={{ ...this.props.style }}>
        <View style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          paddingTop: 8,
          backgroundColor: 'white'
        }}>
          <Text style={{
            ...textStyles,
            fontFamily: 'IBMPlexMono-Bold',
            color: hslString(feedColor, 'desaturated'),
            fontSize: 24
          }}>{numFeedItems}</Text>
        </View>
        <Text style={{
          ...textStyles,
          fontSize: 12
        }}>unread</Text>
      </View>
    )
  }
}

export default FeedUnreadCounter

