import React from 'react'
import {
  Animated,
} from 'react-native'
import {getCachedCoverImagePath} from '../utils/'

class FeedCoverImage extends React.Component {

  constructor (props) {
    super(props)
    this.props = props
  }

  componentDidMount () {
    const { _id, cachedCoverImageId, coverImageId } = this.props.feed
    if (coverImageId && !cachedCoverImageId) {
      this.props.setCachedCoverImage(_id, coverImageId)
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return nextProps.cachedCoverImageId !== this.props.cachedCoverImageId
  }

  render () {
    const {
      _id,
      cachedCoverImageId,
      coverImageDimensions,
      coverImageId,
      color
    } = this.props.feed
    const { width, height } = this.props

    const imageId = cachedCoverImageId || coverImageId
    const coverImageUrl = imageId ?
      `file://${getCachedCoverImagePath(imageId)}` :
      null

    return (color && coverImageUrl && coverImageDimensions && coverImageDimensions.width !== 0 && width !== 0) ?
      <Animated.Image
        source={{ uri: coverImageUrl }}
        style={{
          alignSelf: 'center',
          width,
          height
        }}
      /> :
      null

  }
}

export default FeedCoverImage

