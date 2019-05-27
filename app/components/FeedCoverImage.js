import React from 'react'
import { Animated, Image } from 'react-native'
import {Surface} from 'gl-react-native'
const {Image: GLImage} = require('gl-react-image')
const RNFS = require('react-native-fs')
import {ContrastSaturationBrightness} from 'gl-react-contrast-saturation-brightness'
import ColorBlending from 'gl-react-color-blending'
import { blendColor } from '../utils/colors'
import {getCachedImagePath} from '../utils/'
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
    return nextProps.cachedCoverImageId !== this.props.cachedCoverImageId ||
      nextProps.coverImageId !== this.props.coverImageId ||
      nextProps.width !== this.props.width
  }

  captureImage () {
    const {
      coverImageDimensions,
      coverImageId,
      feedColor,
      feedId,
      width,
      height
    } = this.props
    // debugger
    if (coverImageId && coverImageDimensions && coverImageDimensions.width !== 0) {
      const that = this
      const filePath = `${RNFS.DocumentDirectoryPath}/feed-cover-images/${this.props.feedId}.jpg`
      RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/feed-cover-images`)
        .then(_ => this.surface.captureFrame({
          type: 'jpg',
          format: 'file',
          quality: 1,
          filePath
        }))
        .then(newImageUri => {
          that.props.setCachedCoverImage(feedId, coverImageId)
        })
        .catch(err => {
          log('captureImage', err)
        })
    }
  }

  render () {
    const {
      cachedCoverImageId,
      coverImageDimensions,
      coverImageId,
      feedColor,
      width,
      height
    } = this.props

    if (cachedCoverImageId && coverImageId &&
      coverImageId === cachedCoverImageId) {
      const cachedCoverImagePath = `${RNFS.DocumentDirectoryPath}/feed-cover-images/${this.props.feedId}.jpg`
      const opacityAnim = new Animated.Value(0)
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }).start()
      return <Animated.Image
        width={width}
        height={height}
        source={{ uri: 'file://' + cachedCoverImagePath }}
        style={{
          width,
          height,
          opacity: opacityAnim
        }}
      />
    }

    const coverImageUrl = coverImageId ?
      `file://${getCachedImagePath(coverImageId)}` :
      null

    return (feedColor && coverImageUrl && coverImageDimensions && coverImageDimensions.width !== 0 && width !== 0) ?
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
        <ColorBlending
          color={blendColor(feedColor, 'desaturated')}
          blendMode='blendMultiply'
        >
          <ContrastSaturationBrightness
            saturation={0.5}
            contrast={0.8}
            brightness={2}
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
          </ContrastSaturationBrightness>
        </ColorBlending>
      </Surface>
    ) :
    null

  }
}

export default FeedCoverImage

