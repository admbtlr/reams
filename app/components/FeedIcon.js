import React from 'react'
import {
  Image,
  InteractionManager,
  View
} from 'react-native'
const RNFS = require('react-native-fs')
import { hslString, hslStringToBlendColor, hslToBlendColor, hslToHslString } from '../utils/colors'
import {getCachedFeedIconPath, getRenderedFeedIconPath} from '../utils/'
import log from '../utils/log'

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
      shouldInvert
    } = this.props
    const width = 32
    const height = 32
    let dim = dimensions || iconDimensions
    return hasCachedIcon && dim && dim.width > 0 ?
      <View style={{
        backgroundColor: feed.color,
        // margin: 10,
        width,
        height,
        marginRight: 5
      }}>
        <Image
          width={width}
          height={height}
          source={{ uri: getCachedFeedIconPath(feed._id) }}
          style={{
            width,
            height
          }}
        />
      </View> :
      null
  }
}

export default FeedIcon
