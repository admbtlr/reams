import React from 'react'
import {
  Animated,
  Dimensions,
  Image,
  Text,
  View
} from 'react-native'
import {Transition} from 'react-navigation-fluid-transitions'
import {Surface} from 'gl-react-native'
const {Image: GLImage} = require('gl-react-image')
import {ContrastSaturationBrightness} from 'gl-react-contrast-saturation-brightness'
import ColorBlending from 'gl-react-color-blending'
import { blendColor, hslString } from '../utils/colors'

class FeedCoverImage extends React.Component {

  constructor (props) {
    super(props)
    this.props = props
  }

  render () {
    const {
      coverImageDimensions,
      coverImagePath,
      feedColor,
      width,
      height
    } = this.props

    const that = this
    const coverImageUrl = coverImagePath ? `file://${coverImagePath}` : null
    return (coverImageUrl && coverImageDimensions) ?
      (
       <Surface
         width={width}
         height={height}
         backgroundColor="#000"
         key="456"
       >
         <ColorBlending
           color={blendColor(feedColor)}
           blendMode='blendMultiply'
         >
           <ContrastSaturationBrightness
             saturation={0}
             contrast={0.5}
             brightness={1.3}
           >
             <GLImage
               center={[0.5, 0]}
               key={coverImagePath}
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
      // <Image
      //   resizeMode='cover'
      //   source={{uri: coverImageUrl}}
      //   style={{
      //     width: coverImageDimensions.width,
      //     height: coverImageDimensions.height,
      // }} /> :
      // <View style={{
      //   backgroundColor: hslString(feedColor, 'unsaturated'),
      //   width,
      //   height
      // }} /> :
      null

  }
}

export default FeedCoverImage

