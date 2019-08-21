import React from 'react'
import {
  Animated,
  Image,
  InteractionManager,
  View,
  Text
} from 'react-native'
import {Surface} from 'gl-react-native'
const {Image: GLImage} = require('gl-react-image')
const RNFS = require('react-native-fs')
import {ContrastSaturationBrightness} from 'gl-react-contrast-saturation-brightness'
import ColorBlending from 'gl-react-color-blending'
import { blendColor } from '../utils/colors'
import {getCachedFeedIconPath} from '../utils/'
import log from '../utils/log'

export default function FeedIcon ({ id }) {
  return <View style={{
      width: 24,
      height: 24
    }}><Text>!!!</Text></View>
}

