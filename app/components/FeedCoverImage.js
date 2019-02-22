import React from 'react'
import {Surface} from 'gl-react-native'
const {Image: GLImage} = require('gl-react-image')
import {ContrastSaturationBrightness} from 'gl-react-contrast-saturation-brightness'
import ColorBlending from 'gl-react-color-blending'
import { blendColor } from '../utils/colors'

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

    const coverImageUrl = coverImagePath ? `file://${coverImagePath}` : null
    return (feedColor && coverImageUrl && coverImageDimensions && coverImageDimensions.width !== 0 && width !== 0) ?
      (
       <Surface
         width={width}
         height={height}
         backgroundColor="#000"
         backgroundColor='#000'
         key='456'
       >
         <ColorBlending
           color={blendColor(feedColor, 'lighter')}
           blendMode='blendMultiply'
         >
           <ContrastSaturationBrightness
             saturation={0.5}
             contrast={0.8}
             brightness={1.3}
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

