import React from 'react'
import {
  Animated
} from 'react-native'
import {fileExists, getCachedCoverImagePath} from '../utils/'

class FeedCoverImage extends React.Component {

  constructor (props) {
    super(props)
    this.props = props
  }

  async componentDidMount () {
    const { coverImageId } = this.props.feed
    const cachedCoverImageId = this.props.feed.feedLocal ?
      this.props.feed.feedLocal.cachedCoverImageId :
      null
    const { _id } = this.props.feed.feed
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
    return nextProps.feed?.feedLocal?.cachedCoverImageId !== 
      this.props.feed?.feedLocal?.cachedCoverImageId
  }

  async componentDidUpdate () {
    const { _id } = this.props.feed.feed
    const coverImageFileExists = await fileExists(this.getCoverImagePath())
    if (!coverImageFileExists) {
      this.props.removeCoverImage(_id)
    }
  }

  getCoverImagePath () {
    const {
      coverImageId,
    } = this.props.feed

    const cachedCoverImageId = this.props.feed?.feedLocal ? 
      this.props.feed.feedLocal.cachedCoverImageId :
      null

    const imageId = cachedCoverImageId || coverImageId
    return imageId ?
      getCachedCoverImagePath(imageId) :
      null
  }

  render () {
    const { coverImageDimensions } = this.props.feed
    // this is a bit weird... due to the shape of the props coming in to FeedExpanded
    const color = this.props.feed.feed?.color || this.props.feed.color
    const { width, height } = this.props

    const coverImagePath = this.getCoverImagePath()

    return (color && !!coverImagePath && coverImageDimensions && coverImageDimensions.width !== 0 && width !== 0) ?
      <Animated.View style={{ width, height }}>
        <Animated.Image
          source={{ uri: `file://${coverImagePath}` }}
          style={{
            alignSelf: 'center',
            width,
            height,
            position: 'absolute',
          }}
        /> 
      </Animated.View> :
      null

  }
}

export default FeedCoverImage

