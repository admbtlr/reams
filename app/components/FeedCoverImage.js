import React from 'react'
import {
  Animated,
} from 'react-native'
import {fileExists, getCachedCoverImagePath} from '../utils/'

class FeedCoverImage extends React.Component {

  constructor (props) {
    super(props)
    this.props = props
  }

  async componentDidMount () {
    const { _id, cachedCoverImageId, coverImageId } = this.props.feed
    const coverImagePath = this.getCoverImagePath()
    if (!coverImagePath) return
    const coverImageFileExists = await fileExists(coverImagePath)
    if (!coverImageFileExists) {
      this.props.removeCoverImage(_id)
    } else if (coverImageId && !cachedCoverImageId) {
      this.props.setCachedCoverImage(_id, coverImageId)
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return nextProps.cachedCoverImageId !== this.props.cachedCoverImageId
  }

  async componentDidUpdate () {
    const { _id } = this.props.feed
    const coverImageFileExists = await fileExists(this.getCoverImagePath())
    if (!coverImageFileExists) {
      this.props.removeCoverImage(_id)
    }
  }

  getCoverImagePath () {
    const {
      cachedCoverImageId,
      coverImageId,
    } = this.props.feed

    const imageId = cachedCoverImageId || coverImageId
    return imageId ?
      getCachedCoverImagePath(imageId) :
      null
  }

  render () {
    const {
      coverImageDimensions,
      color
    } = this.props.feed
    const { width, height } = this.props

    const coverImagePath = this.getCoverImagePath()

    return (color && !!coverImagePath && coverImageDimensions && coverImageDimensions.width !== 0 && width !== 0) ?
      <Animated.Image
        source={{ uri: `file://${coverImagePath}` }}
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

