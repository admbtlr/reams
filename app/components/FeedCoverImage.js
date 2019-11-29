import React from 'react'
import {
  Animated,
  Image,
  InteractionManager
} from 'react-native'
import {Surface} from 'gl-react-native'
import GLImage from 'gl-react-image'
const RNFS = require('react-native-fs')
import {ContrastSaturationBrightness} from 'gl-react-contrast-saturation-brightness'
import ColorBlending from 'gl-react-color-blending'
import { blendColor } from '../utils/colors'
import {getCachedCoverImagePath} from '../utils/'
import log from '../utils/log'

class FeedCoverImage extends React.Component {

  constructor (props) {
    super(props)
    this.props = props

    this.state = {
      renderedImagePath: null
    }

    this.captureImage = this.captureImage.bind(this)
  }

  // componentDidMount () {
  //   this.captureImage()
  // }

  shouldComponentUpdate (nextProps, nextState) {
    return nextProps.cachedCoverImageId !== this.props.cachedCoverImageId
  }

  captureImage () {
    const {
      cachedCoverImageId,
      coverImageDimensions,
      coverImageId,
      color,
      _id
    } = this.props.feed
    const { width, height } = this.props
    // debugger
    if (coverImageId && coverImageDimensions && coverImageDimensions.width !== 0) {
      const that = this
      const filePath = `${RNFS.DocumentDirectoryPath}/feed-cover-images/${_id}.jpg`
      InteractionManager.runAfterInteractions()
        .then(_ => RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/feed-cover-images`))
        .then(_ => this.surface.captureFrame({
          type: 'jpg',
          format: 'file',
          quality: 1,
          filePath
        }))
        .then(_ => {
          that.props.setCachedCoverImage(_id, coverImageId)
        })
        .catch(err => {
          log('captureImage', err)
        })
    }
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

    // const coverImageUrl = coverImageId ?
    //   `file://${getCachedCoverImagePath(coverImageId)}` :
    //   null

    // return coverImageId ? <Animated.Image
    //     source={{
    //       uri: coverImageUrl
    //     }}
    //     style={{
    //       alignSelf: 'center',
    //       width,
    //       height,
    //     }}
    //   /> :
    //   null

    if (cachedCoverImageId) {
      const cachedCoverImagePath = `${RNFS.DocumentDirectoryPath}/feed-cover-images/${_id}.jpg`
      const opacityAnim = new Animated.Value(0)
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }).start()
      return <Animated.Image
        // width={width}
        // height={height}
        source={{ uri: 'file://' + cachedCoverImagePath }}
        style={{
          alignSelf: 'center',
          width,
          height,
          opacity: opacityAnim
        }}
      />
    }

    const coverImageUrl = coverImageId ?
      `file://${getCachedCoverImagePath(coverImageId)}` :
      null

    return (color && coverImageUrl && coverImageDimensions && coverImageDimensions.width !== 0 && width !== 0) ?
    (
      <Surface
        width={width}
        height={height}
        backgroundColor='#000'
        backgroundColor='#000'
        key='456'
        preload={true}
        onLoad={this.captureImage}
        ref={ ref => { this.surface = ref } }
      >
        <GLImage
          center={[0.5, 0]}
          resizeMode='cover'
          source={{
            uri: coverImageUrl,
            width: coverImageDimensions.width,
            height: coverImageDimensions.height
          }}
          imageSize={{
            width: coverImageDimensions.width,
            height: coverImageDimensions.height
          }}
        />
      </Surface>
    ) :
    null

  }
}

export default FeedCoverImage

