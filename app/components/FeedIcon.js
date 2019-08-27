import React from 'react'
import {
  Image,
  InteractionManager,
  View
} from 'react-native'
import {Surface} from 'gl-react-native'
const {Image: GLImage} = require('gl-react-image')
const RNFS = require('react-native-fs')
import {ContrastSaturationBrightness} from 'gl-react-contrast-saturation-brightness'
import ColorBlending from 'gl-react-color-blending'
import { hslStringToBlendColor } from '../utils/colors'
import {getCachedFeedIconPath, getRenderedFeedIconPath} from '../utils/'
import log from '../utils/log'

class FeedIcon extends React.Component {
  constructor (props) {
    super(props)
    this.props = props

    this.state = {}
    this.captureImage = this.captureImage.bind(this)
  }

  captureImage () {
    const {
      dimensions,
      id
    } = this.props
    // debugger
    if (dimensions && dimensions.width !== 0) {
      const that = this
      const filePath = `${RNFS.DocumentDirectoryPath}/feed-icons/rendered/${id}.png`
      InteractionManager.runAfterInteractions()
        .then(_ => RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/feed-icons/rendered`))
        .then(_ => this.surface.captureFrame({
          type: 'png',
          format: 'file',
          quality: 1,
          filePath
        }))
        .then(_ => {
          that.props.setRenderedFeedIcon(id)
        })
        .catch(err => {
          log('captureImage', err)
        })
    }
  }

  render () {
    const {
      id,
      dimensions,
      bgColor,
      hasRenderedIcon
    } = this.props
    const width = 32
    const height = 32
    const colorBlendingColor = hslStringToBlendColor(bgColor)
    return dimensions && dimensions.width > 0 ?
      <View style={{
        backgroundColor: bgColor,
        // margin: 10,
        width,
        height,
        marginRight: 10
      }}>
        {
          hasRenderedIcon ?
            <Image
              width={width}
              height={height}
              source={{ uri: getRenderedFeedIconPath(id) }}
              style={{
                width,
                height
              }}
            /> :
            (<Surface
              width={width}
              height={height}
              backgroundColor={bgColor}
              backgroundColor={bgColor}
              onLoad={this.captureImage}
              ref={ ref => { this.surface = ref } }
            >
              <ColorBlending
                color={colorBlendingColor}
                blendMode='blendScreen'
              >
                <ContrastSaturationBrightness
                  saturation={0}
                  contrast={2}
                  brightness={1}
                >
                  <GLImage
                    resizeMode='contain'
                    source={{
                      uri: getCachedFeedIconPath(id),
                      width: dimensions.width,
                      height: dimensions.height
                    }}
                    imageSize={{
                      width: dimensions.width,
                      height: dimensions.height
                    }}
                  />
                </ContrastSaturationBrightness>
              </ColorBlending>
            </Surface>)
        }
      </View> :
      null
  }
}

export default FeedIcon
