import React from 'react'
import { View } from 'react-native'
import FeedIconContainer from '../containers/FeedIcon'
import { hslString } from '../utils/colors'

export default function FeedIconCorner ({ feed, iconDimensions, extraStyle }) {
  return (
    <View
      style={{
        height: '100%',
        width: '100%',
        position: 'absolute',
        left: 0,
        bottom: 20,
        backgroundColor: 'transparent',
        overflow: 'hidden',
        pointerEvents: 'none',
        ...extraStyle
    }}>
      <View style={{
        backgroundColor: hslString(feed.color),
        position: 'absolute',
        bottom: -65,
        right: -65,
        zIndex: 5,
        width: 130,
        height: 130,
        transform: [{
          rotateZ: '45deg'
        }]
      }} />
      <View style={{
        position: 'absolute',
        bottom: 10,
        right: 5,
        zIndex: 10
      }}>
        <FeedIconContainer
          feed={feed}
          iconDimensions={iconDimensions}
        />
      </View>
    </View>
  )
}
