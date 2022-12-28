import React from 'react'
import {
  Image,
  View
} from 'react-native'
const RNFS = require('react-native-fs')
import {getCachedFeedIconPath} from '../utils/'

class FeedIcon extends React.Component {
  constructor (props) {
    super(props)
    this.props = props

    this.state = {}
  }

  render () {
    const {
      feed,
      dimensions,
      iconDimensions,
      hasCachedIcon,
      hasRenderedIcon,
      shouldInvert,
      isSmall
    } = this.props
    const width = isSmall ? 24 : 32
    const height = isSmall ? 24 : 32
    let dim = dimensions || iconDimensions
    const image = feed ? <Image
      width={width}
      height={height}
      source={{ uri: getCachedFeedIconPath(feed._id) }}
      style={{
        width,
        height,
      }}
    /> : null
    return hasCachedIcon && dim && dim.width > 0 ?
      <View style={{
        backgroundColor: feed ? feed.color : 'white',
        // margin: 10,
        width,
        height,
        marginRight: 5
      }}>
        { //shouldInvert ?
          //<Invert image={ image }/> :
          //image
        }
        { image }
      </View> :
      null
  }
}

export default FeedIcon
