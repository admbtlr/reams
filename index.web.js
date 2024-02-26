import './wdyr'
import 'react-native-gesture-handler'

import { Text, View } from 'react-native'
import React from 'react'
import {registerRootComponent} from 'expo'
import Rizzle from './components/Rizzle'

import './web/fonts/IBMPlexMono-Bold.ttf'
import './web/fonts/IBMPlexMono-BoldItalic.ttf'
import './web/fonts/IBMPlexMono-Italic.ttf'
import './web/fonts/IBMPlexMono-Light.ttf'
import './web/fonts/IBMPlexMono-LightItalic.ttf'
import './web/fonts/IBMPlexMono.ttf'
import './web/fonts/IBMPlexSans-Bold.ttf'
import './web/fonts/IBMPlexSans-BoldItalic.ttf'
import './web/fonts/IBMPlexSans-Italic.ttf'
import './web/fonts/IBMPlexSans-Light.ttf'
import './web/fonts/IBMPlexSans-LightItalic.ttf'
import './web/fonts/IBMPlexSans.ttf'
import './web/fonts/IBMPlexSansCond-Bold.ttf'
import './web/fonts/IBMPlexSansCond-BoldItalic.ttf'
import './web/fonts/IBMPlexSansCond-ExtraLight.ttf'
import './web/fonts/IBMPlexSansCond-ExtraLightItalic.ttf'
import './web/fonts/IBMPlexSansCond.ttf'
import './web/fonts/IBMPlexSerif-Bold.ttf'
import './web/fonts/IBMPlexSerif-BoldItalic.ttf'
import './web/fonts/IBMPlexSerif-Italic.ttf'
import './web/fonts/IBMPlexSerif-Light.ttf'
import './web/fonts/IBMPlexSerif-LightItalic.ttf'
import './web/fonts/IBMPlexSerif-Thin.ttf'
import './web/fonts/IBMPlexSerif-ThinItalic.ttf'
import './web/fonts/IBMPlexSerif.ttf'
import './web/fonts/LibreBaskerville-Bold.ttf'
import './web/fonts/LibreBaskerville-Italic.ttf'
import './web/fonts/LibreBaskerville-Regular.ttf'
import './web/fonts/Montserrat-Bold.ttf'
import './web/fonts/Montserrat-BoldItalic.ttf'
import './web/fonts/Montserrat-Light.ttf'
import './web/fonts/Montserrat-LightItalic.ttf'
import './web/fonts/PTSerif-Bold.ttf'
import './web/fonts/PTSerif-BoldItalic.ttf'
import './web/fonts/PTSerif-Italic.ttf'
import './web/fonts/PTSerif-Regular.ttf'
import './web/fonts/PlayfairDisplay-Black.ttf'
import './web/fonts/PlayfairDisplay-BlackItalic.ttf'
import './web/fonts/PlayfairDisplay-Bold.ttf'
import './web/fonts/PlayfairDisplay-BoldItalic.ttf'
import './web/fonts/PlayfairDisplay-Italic.ttf'
import './web/fonts/PlayfairDisplay-Regular.ttf'
import './web/fonts/PlayfairDisplaySC-Bold.ttf'
import './web/fonts/PlayfairDisplaySC-BoldItalic.ttf'
import './web/fonts/Poppins-ExtraBold.ttf'
import './web/fonts/Poppins-ExtraBoldItalic.ttf'
import './web/fonts/Poppins-Italic.ttf'
import './web/fonts/Poppins-Regular.ttf'

// import './web/fonts/fonts.css'

const IBMPlexMonoBold = `@font-face { 
  src: url('./web/fonts/IBMPlexMono-Bold.ttf')
  font-family: 'IBMPlexMono-Bold'
}`
const IBMPlexMonoBoldItalic = `@font-face { 
  src: url('./web/fonts/IBMPlexMono-BoldItalic.ttf')
  font-family: 'IBMPlexMono-BoldItalic'
}`
const IBMPlexMonoItalic = `@font-face { 
  src: url('./web/fonts/IBMPlexMono-Italic.ttf')
  font-family: 'IBMPlexMono-Italic'
}`
const IBMPlexMonoLight = `@font-face { 
  src: url('./web/fonts/IBMPlexMono-Light.ttf')
  font-family: 'IBMPlexMono-Light'
}`
const IBMPlexMonoLightItalic = `@font-face { 
  src: url('./web/fonts/IBMPlexMono-LightItalic.ttf')
  font-family: 'IBMPlexMono-LightItalic'
}`
const IBMPlexMono = `@font-face { 
  src: url('./web/fonts/IBMPlexMono.ttf')
  font-family: 'fonts/IBMPlexMono'
}`
const IBMPlexSansBold = `@font-face { 
  src: url('./web/fonts/IBMPlexSans-Bold.ttf')
  font-family: 'IBMPlexSans-Bold'
}`
const IBMPlexSansBoldItalic = `@font-face { 
  src: url('./web/fonts/IBMPlexSans-BoldItalic.ttf')
  font-family: 'IBMPlexSans-BoldItalic'
}`
const IBMPlexSansItalic = `@font-face { 
  src: url('./web/fonts/IBMPlexSans-Italic.ttf')
  font-family: 'IBMPlexSans-Italic'
}`
const IBMPlexSansLight = `@font-face { 
  src: url('./web/fonts/IBMPlexSans-Light.ttf')
  font-family: 'IBMPlexSans-Light'
}`
const IBMPlexSansLightItalic = `@font-face { 
  src: url('./web/fonts/IBMPlexSans-LightItalic.ttf')
  font-family: 'IBMPlexSans-LightItalic'
}`
const IBMPlexSans = `@font-face { 
  src: url('./web/fonts/IBMPlexSans.ttf')
  font-family: 'fonts/IBMPlexSans'
}`
const IBMPlexSansCondBold = `@font-face { 
  src: url('./web/fonts/IBMPlexSansCond-Bold.ttf')
  font-family: 'IBMPlexSansCond-Bold'
}`
const IBMPlexSansCondBoldItalic = `@font-face { 
  src: url('./web/fonts/IBMPlexSansCond-BoldItalic.ttf')
  font-family: 'IBMPlexSansCond-BoldItalic'
}`
const IBMPlexSansCondExtraLight = `@font-face { 
  src: url('./web/fonts/IBMPlexSansCond-ExtraLight.ttf')
  font-family: 'IBMPlexSansCond-ExtraLight'
}`
const IBMPlexSansCondExtraLightItalic = `@font-face { 
  src: url('./web/fonts/IBMPlexSansCond-ExtraLightItalic.ttf')
  font-family: 'IBMPlexSansCond-ExtraLightItalic'
}`
const IBMPlexSansCond = `@font-face { 
  src: url('./web/fonts/IBMPlexSansCond.ttf')
  font-family: 'fonts/IBMPlexSansCond'
}`
const IBMPlexSerifBold = `@font-face { 
  src: url('./web/fonts/IBMPlexSerif-Bold.ttf')
  font-family: 'IBMPlexSerif-Bold'
}`
const IBMPlexSerifBoldItalic = `@font-face { 
  src: url('./web/fonts/IBMPlexSerif-BoldItalic.ttf')
  font-family: 'IBMPlexSerif-BoldItalic'
}`
const IBMPlexSerifItalic = `@font-face { 
  src: url('./web/fonts/IBMPlexSerif-Italic.ttf')
  font-family: 'IBMPlexSerif-Italic'
}`
const IBMPlexSerifLight = `@font-face { 
  src: url('./web/fonts/IBMPlexSerif-Light.ttf')
  font-family: 'IBMPlexSerif-Light'
}`
const IBMPlexSerifLightItalic = `@font-face { 
  src: url('./web/fonts/IBMPlexSerif-LightItalic.ttf')
  font-family: 'IBMPlexSerif-LightItalic'
}`
const IBMPlexSerifThin = `@font-face { 
  src: url('./web/fonts/IBMPlexSerif-Thin.ttf')
  font-family: 'IBMPlexSerif-Thin'
}`
const IBMPlexSerifThinItalic = `@font-face { 
  src: url('./web/fonts/IBMPlexSerif-ThinItalic.ttf')
  font-family: 'IBMPlexSerif-ThinItalic'
}`
const IBMPlexSerif = `@font-face { 
  src: url('./web/fonts/IBMPlexSerif.ttf')
  font-family: 'fonts/IBMPlexSerif'
}`
const LibreBaskervilleBold = `@font-face { 
  src: url('./web/fonts/LibreBaskerville-Bold.ttf')
  font-family: 'LibreBaskerville-Bold'
}`
const LibreBaskervilleItalic = `@font-face { 
  src: url('./web/fonts/LibreBaskerville-Italic.ttf')
  font-family: 'LibreBaskerville-Italic'
}`
const LibreBaskervilleRegular = `@font-face { 
  src: url('./web/fonts/LibreBaskerville-Regular.ttf')
  font-family: 'LibreBaskerville-Regular'
}`
const MontserratBold = `@font-face { 
  src: url('./web/fonts/Montserrat-Bold.ttf')
  font-family: 'Montserrat-Bold'
}`
const MontserratBoldItalic = `@font-face { 
  src: url('./web/fonts/Montserrat-BoldItalic.ttf')
  font-family: 'Montserrat-BoldItalic'
}`
const MontserratLight = `@font-face { 
  src: url('./web/fonts/Montserrat-Light.ttf')
  font-family: 'Montserrat-Light'
}`
const MontserratLightItalic = `@font-face { 
  src: url('./web/fonts/Montserrat-LightItalic.ttf')
  font-family: 'Montserrat-LightItalic'
}`
const PTSerifBold = `@font-face { 
  src: url('./web/fonts/PTSerif-Bold.ttf')
  font-family: 'PTSerif-Bold'
}`
const PTSerifBoldItalic = `@font-face { 
  src: url('./web/fonts/PTSerif-BoldItalic.ttf')
  font-family: 'PTSerif-BoldItalic'
}`
const PTSerifItalic = `@font-face { 
  src: url('./web/fonts/PTSerif-Italic.ttf')
  font-family: 'PTSerif-Italic'
}`
const PTSerifRegular = `@font-face { 
  src: url('./web/fonts/PTSerif-Regular.ttf')
  font-family: 'PTSerif-Regular'
}`
const PlayfairDisplayBlack = `@font-face { 
  src: url('./web/fonts/PlayfairDisplay-Black.ttf')
  font-family: 'PlayfairDisplay-Black'
}`
const PlayfairDisplayBlackItalic = `@font-face { 
  src: url('./web/fonts/PlayfairDisplay-BlackItalic.ttf')
  font-family: 'PlayfairDisplay-BlackItalic'
}`
const PlayfairDisplayBold = `@font-face { 
  src: url('./web/fonts/PlayfairDisplay-Bold.ttf')
  font-family: 'PlayfairDisplay-Bold'
}`
const PlayfairDisplayBoldItalic = `@font-face { 
  src: url('./web/fonts/PlayfairDisplay-BoldItalic.ttf')
  font-family: 'PlayfairDisplay-BoldItalic'
}`
const PlayfairDisplayItalic = `@font-face { 
  src: url('./web/fonts/PlayfairDisplay-Italic.ttf')
  font-family: 'PlayfairDisplay-Italic'
}`
const PlayfairDisplayRegular = `@font-face { 
  src: url('./web/fonts/PlayfairDisplay-Regular.ttf')
  font-family: 'PlayfairDisplay-Regular'
}`
const PlayfairDisplaySCBold = `@font-face { 
  src: url('./web/fonts/PlayfairDisplaySC-Bold.ttf')
  font-family: 'PlayfairDisplaySC-Bold'
}`
const PlayfairDisplaySCBoldItalic = `@font-face { 
  src: url('./web/fonts/PlayfairDisplaySC-BoldItalic.ttf')
  font-family: 'PlayfairDisplaySC-BoldItalic'
}`
const PoppinsExtraBold = `@font-face { 
  src: url('./web/fonts/Poppins-ExtraBold.ttf')
  font-family: 'Poppins-ExtraBold'
}`
const PoppinsExtraBoldItalic = `@font-face { 
  src: url('./web/fonts/Poppins-ExtraBoldItalic.ttf')
  font-family: 'Poppins-ExtraBoldItalic'
}`
const PoppinsItalic = `@font-face { 
  src: url('./web/fonts/Poppins-Italic.ttf')
  font-family: 'Poppins-Italic'
}`
const PoppinsRegular = `@font-face { 
  src: url('./web/fonts/Poppins-Regular.ttf')
  font-family: 'Poppins-Regular'
}`

// Create stylesheet
const style = document.createElement('style')
style.type = 'text/css'

if (style.styleSheet) {
  style.styleSheet.cssText = `
${IBMPlexMonoBold}
${IBMPlexMonoBoldItalic}
${IBMPlexMonoItalic}
${IBMPlexMonoLight}
${IBMPlexMonoLightItalic}
${IBMPlexMono}
${IBMPlexSansBold}
${IBMPlexSansBoldItalic}
${IBMPlexSansItalic}
${IBMPlexSansLight}
${IBMPlexSansLightItalic}
${IBMPlexSans}
${IBMPlexSansCondBold}
${IBMPlexSansCondBoldItalic}
${IBMPlexSansCondExtraLight}
${IBMPlexSansCondExtraLightItalic}
${IBMPlexSansCond}
${IBMPlexSerifBold}
${IBMPlexSerifBoldItalic}
${IBMPlexSerifItalic}
${IBMPlexSerifLight}
${IBMPlexSerifLightItalic}
${IBMPlexSerifThin}
${IBMPlexSerifThinItalic}
${IBMPlexSerif}
${LibreBaskervilleBold}
${LibreBaskervilleItalic}
${LibreBaskervilleRegular}
${MontserratBold}
${MontserratBoldItalic}
${MontserratLight}
${MontserratLightItalic}
${PTSerifBold}
${PTSerifBoldItalic}
${PTSerifItalic}
${PTSerifRegular}
${PlayfairDisplayBlack}
${PlayfairDisplayBlackItalic}
${PlayfairDisplayBold}
${PlayfairDisplayBoldItalic}
${PlayfairDisplayItalic}
${PlayfairDisplayRegular}
${PlayfairDisplaySCBold}
${PlayfairDisplaySCBoldItalic}
${PoppinsExtraBold}
${PoppinsExtraBoldItalic}
${PoppinsItalic}
${PoppinsRegular}
  `
} else {
  style.appendChild(document.createTextNode(IBMPlexMonoBold))
  style.appendChild(document.createTextNode(IBMPlexMonoBoldItalic))
  style.appendChild(document.createTextNode(IBMPlexMonoItalic))
  style.appendChild(document.createTextNode(IBMPlexMonoLight))
  style.appendChild(document.createTextNode(IBMPlexMonoLightItalic))
  style.appendChild(document.createTextNode(IBMPlexMono))
  style.appendChild(document.createTextNode(IBMPlexSansBold))
  style.appendChild(document.createTextNode(IBMPlexSansBoldItalic))
  style.appendChild(document.createTextNode(IBMPlexSansItalic))
  style.appendChild(document.createTextNode(IBMPlexSansLight))
  style.appendChild(document.createTextNode(IBMPlexSansLightItalic))
  style.appendChild(document.createTextNode(IBMPlexSans))
  style.appendChild(document.createTextNode(IBMPlexSansCondBold))
  style.appendChild(document.createTextNode(IBMPlexSansCondBoldItalic))
  style.appendChild(document.createTextNode(IBMPlexSansCondExtraLight))
  style.appendChild(document.createTextNode(IBMPlexSansCondExtraLightItalic))
  style.appendChild(document.createTextNode(IBMPlexSansCond))
  style.appendChild(document.createTextNode(IBMPlexSerifBold))
  style.appendChild(document.createTextNode(IBMPlexSerifBoldItalic))
  style.appendChild(document.createTextNode(IBMPlexSerifItalic))
  style.appendChild(document.createTextNode(IBMPlexSerifLight))
  style.appendChild(document.createTextNode(IBMPlexSerifLightItalic))
  style.appendChild(document.createTextNode(IBMPlexSerifThin))
  style.appendChild(document.createTextNode(IBMPlexSerifThinItalic))
  style.appendChild(document.createTextNode(IBMPlexSerif))
  style.appendChild(document.createTextNode(LibreBaskervilleBold))
  style.appendChild(document.createTextNode(LibreBaskervilleItalic))
  style.appendChild(document.createTextNode(LibreBaskervilleRegular))
  style.appendChild(document.createTextNode(MontserratBold))
  style.appendChild(document.createTextNode(MontserratBoldItalic))
  style.appendChild(document.createTextNode(MontserratLight))
  style.appendChild(document.createTextNode(MontserratLightItalic))
  style.appendChild(document.createTextNode(PTSerifBold))
  style.appendChild(document.createTextNode(PTSerifBoldItalic))
  style.appendChild(document.createTextNode(PTSerifItalic))
  style.appendChild(document.createTextNode(PTSerifRegular))
  style.appendChild(document.createTextNode(PlayfairDisplayBlack))
  style.appendChild(document.createTextNode(PlayfairDisplayBlackItalic))
  style.appendChild(document.createTextNode(PlayfairDisplayBold))
  style.appendChild(document.createTextNode(PlayfairDisplayBoldItalic))
  style.appendChild(document.createTextNode(PlayfairDisplayItalic))
  style.appendChild(document.createTextNode(PlayfairDisplayRegular))
  style.appendChild(document.createTextNode(PlayfairDisplaySCBold))
  style.appendChild(document.createTextNode(PlayfairDisplaySCBoldItalic))
  style.appendChild(document.createTextNode(PoppinsExtraBold))
  style.appendChild(document.createTextNode(PoppinsExtraBoldItalic))
  style.appendChild(document.createTextNode(PoppinsItalic))
  style.appendChild(document.createTextNode(PoppinsRegular))
}

// Inject stylesheet
document.head.appendChild(style);

const HelloWorld = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Hello world!</Text></View>
)

// registerRootComponent(Rizzle)