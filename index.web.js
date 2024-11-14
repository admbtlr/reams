import './wdyr'
import 'react-native-gesture-handler'

import { Platform, Text, View } from 'react-native'
import React from 'react'
import {registerRootComponent} from 'expo'
import Rizzle from './components/Rizzle'

import './public/fonts/IBMPlexMono-Bold.ttf'
import './public/fonts/IBMPlexMono-BoldItalic.ttf'
import './public/fonts/IBMPlexMono-Italic.ttf'
import './public/fonts/IBMPlexMono-Light.ttf'
import './public/fonts/IBMPlexMono-LightItalic.ttf'
import './public/fonts/IBMPlexMono.ttf'
import './public/fonts/IBMPlexSans-Bold.ttf'
import './public/fonts/IBMPlexSans-BoldItalic.ttf'
import './public/fonts/IBMPlexSans-Italic.ttf'
import './public/fonts/IBMPlexSans-Light.ttf'
import './public/fonts/IBMPlexSans-LightItalic.ttf'
import './public/fonts/IBMPlexSans.ttf'
import './public/fonts/IBMPlexSansCond-Bold.ttf'
import './public/fonts/IBMPlexSansCond-BoldItalic.ttf'
import './public/fonts/IBMPlexSansCond-ExtraLight.ttf'
import './public/fonts/IBMPlexSansCond-ExtraLightItalic.ttf'
import './public/fonts/IBMPlexSansCond.ttf'
import './public/fonts/IBMPlexSerif-Bold.ttf'
import './public/fonts/IBMPlexSerif-BoldItalic.ttf'
import './public/fonts/IBMPlexSerif-Italic.ttf'
import './public/fonts/IBMPlexSerif-Light.ttf'
import './public/fonts/IBMPlexSerif-LightItalic.ttf'
import './public/fonts/IBMPlexSerif-Thin.ttf'
import './public/fonts/IBMPlexSerif-ThinItalic.ttf'
import './public/fonts/IBMPlexSerif.ttf'
import './public/fonts/LibreBaskerville-Bold.ttf'
import './public/fonts/LibreBaskerville-Italic.ttf'
import './public/fonts/LibreBaskerville-Regular.ttf'
import './public/fonts/Montserrat-Bold.ttf'
import './public/fonts/Montserrat-BoldItalic.ttf'
import './public/fonts/Montserrat-Regular.ttf'
import './public/fonts/Montserrat-Italic.ttf'
import './public/fonts/NunitoSans-Bold.ttf'
import './public/fonts/NunitoSans-BoldItalic.ttf'
import './public/fonts/NunitoSans-Regular.ttf'
import './public/fonts/NunitoSans-Italic.ttf'
import './public/fonts/PTSerif-Bold.ttf'
import './public/fonts/PTSerif-BoldItalic.ttf'
import './public/fonts/PTSerif-Italic.ttf'
import './public/fonts/PTSerif-Regular.ttf'
import './public/fonts/PlayfairDisplay-Black.ttf'
import './public/fonts/PlayfairDisplay-BlackItalic.ttf'
import './public/fonts/PlayfairDisplay-Bold.ttf'
import './public/fonts/PlayfairDisplay-BoldItalic.ttf'
import './public/fonts/PlayfairDisplay-Italic.ttf'
import './public/fonts/PlayfairDisplay-Regular.ttf'
import './public/fonts/PlayfairDisplaySC-Bold.ttf'
import './public/fonts/PlayfairDisplaySC-BoldItalic.ttf'
import './public/fonts/Poppins-ExtraBold.ttf'
import './public/fonts/Poppins-ExtraBoldItalic.ttf'
import './public/fonts/Poppins-Italic.ttf'
import './public/fonts/Poppins-Regular.ttf'

// import './web/fonts/fonts.css'

const IBMPlexMonoBold = `@font-face { 
  src: url('/public/fonts/IBMPlexMono-Bold.ttf');
  font-family: 'IBMPlexMono-Bold';
}`
const IBMPlexMonoBoldItalic = `@font-face { 
  src: url('/public/fonts/IBMPlexMono-BoldItalic.ttf');
  font-family: 'IBMPlexMono-BoldItalic';
}`
const IBMPlexMonoItalic = `@font-face { 
  src: url('/public/fonts/IBMPlexMono-Italic.ttf');
  font-family: 'IBMPlexMono-Italic';
}`
const IBMPlexMonoLight = `@font-face { 
  src: url('/public/fonts/IBMPlexMono-Light.ttf');
  font-family: 'IBMPlexMono-Light';
}`
const IBMPlexMonoLightItalic = `@font-face { 
  src: url('/public/fonts/IBMPlexMono-LightItalic.ttf');
  font-family: 'IBMPlexMono-LightItalic';
}`
const IBMPlexMono = `@font-face { 
  src: url('/public/fonts/IBMPlexMono.ttf');
  font-family: 'IBMPlexMono';
}`
const IBMPlexSansBold = `@font-face { 
  src: url('/public/fonts/IBMPlexSans-Bold.ttf');
  font-family: 'IBMPlexSans-Bold';
}`
const IBMPlexSansBoldItalic = `@font-face { 
  src: url('/public/fonts/IBMPlexSans-BoldItalic.ttf');
  font-family: 'IBMPlexSans-BoldItalic';
}`
const IBMPlexSansItalic = `@font-face { 
  src: url('/public/fonts/IBMPlexSans-Italic.ttf');
  font-family: 'IBMPlexSans-Italic';
}`
const IBMPlexSansLight = `@font-face { 
  src: url('/public/fonts/IBMPlexSans-Light.ttf');
  font-family: 'IBMPlexSans-Light';
}`
const IBMPlexSansLightItalic = `@font-face { 
  src: url('/public/fonts/IBMPlexSans-LightItalic.ttf');
  font-family: 'IBMPlexSans-LightItalic';
}`
const IBMPlexSans = `@font-face { 
  src: url('/public/fonts/IBMPlexSans.ttf');
  font-family: 'IBMPlexSans';
}`
const IBMPlexSansCondBold = `@font-face { 
  src: url('/public/fonts/IBMPlexSansCond-Bold.ttf');
  font-family: 'IBMPlexSansCond-Bold';
}`
const IBMPlexSansCondBoldItalic = `@font-face { 
  src: url('/public/fonts/IBMPlexSansCond-BoldItalic.ttf');
  font-family: 'IBMPlexSansCond-BoldItalic';
}`
const IBMPlexSansCondExtraLight = `@font-face { 
  src: url('/public/fonts/IBMPlexSansCond-ExtraLight.ttf');
  font-family: 'IBMPlexSansCond-ExtraLight';
}`
const IBMPlexSansCondExtraLightItalic = `@font-face { 
  src: url('/public/fonts/IBMPlexSansCond-ExtraLightItalic.ttf');
  font-family: 'IBMPlexSansCond-ExtraLightItalic';
}`
const IBMPlexSansCond = `@font-face { 
  src: url('/public/fonts/IBMPlexSansCond.ttf');
  font-family: 'IBMPlexSansCond';
}`
const IBMPlexSerifBold = `@font-face { 
  src: url('/public/fonts/IBMPlexSerif-Bold.ttf');
  font-family: 'IBMPlexSerif-Bold';
}`
const IBMPlexSerifBoldItalic = `@font-face { 
  src: url('/public/fonts/IBMPlexSerif-BoldItalic.ttf');
  font-family: 'IBMPlexSerif-BoldItalic';
}`
const IBMPlexSerifItalic = `@font-face { 
  src: url('/public/fonts/IBMPlexSerif-Italic.ttf');
  font-family: 'IBMPlexSerif-Italic';
}`
const IBMPlexSerifLight = `@font-face { 
  src: url('/public/fonts/IBMPlexSerif-Light.ttf');
  font-family: 'IBMPlexSerif-Light';
}`
const IBMPlexSerifLightItalic = `@font-face { 
  src: url('/public/fonts/IBMPlexSerif-LightItalic.ttf');
  font-family: 'IBMPlexSerif-LightItalic';
}`
const IBMPlexSerifThin = `@font-face { 
  src: url('/public/fonts/IBMPlexSerif-Thin.ttf');
  font-family: 'IBMPlexSerif-Thin';
}`
const IBMPlexSerifThinItalic = `@font-face { 
  src: url('/public/fonts/IBMPlexSerif-ThinItalic.ttf');
  font-family: 'IBMPlexSerif-ThinItalic';
}`
const IBMPlexSerif = `@font-face { 
  src: url('/public/fonts/IBMPlexSerif.ttf');
  font-family: 'IBMPlexSerif';
}`
const LibreBaskervilleBold = `@font-face { 
  src: url('/public/fonts/LibreBaskerville-Bold.ttf');
  font-family: 'LibreBaskerville-Bold';
}`
const LibreBaskervilleItalic = `@font-face { 
  src: url('/public/fonts/LibreBaskerville-Italic.ttf');
  font-family: 'LibreBaskerville-Italic';
}`
const LibreBaskervilleRegular = `@font-face { 
  src: url('/public/fonts/LibreBaskerville-Regular.ttf');
  font-family: 'LibreBaskerville-Regular';
}`
const MontserratBold = `@font-face { 
  src: url('/public/fonts/Montserrat-Bold.ttf');
  font-family: 'Montserrat-Bold';
}`
const MontserratBoldItalic = `@font-face { 
  src: url('/public/fonts/Montserrat-BoldItalic.ttf');
  font-family: 'Montserrat-BoldItalic';
}`
const MontserratLight = `@font-face { 
  src: url('/public/fonts/Montserrat-Light.ttf');
  font-family: 'Montserrat-Light';
}`
const MontserratLightItalic = `@font-face { 
  src: url('/public/fonts/Montserrat-LightItalic.ttf');
  font-family: 'Montserrat-LightItalic';
}`
const NunitoSansBold = `@font-face { 
  src: url('/public/fonts/NunitoSans-Bold.ttf');
  font-family: 'NunitoSans-Bold';
}`
const NunitoSansBoldItalic = `@font-face { 
  src: url('/public/fonts/NunitoSans-BoldItalic.ttf');
  font-family: 'NunitoSans-BoldItalic';
}`
const NunitoSansItalic = `@font-face { 
  src: url('/public/fonts/NunitoSans-Italic.ttf');
  font-family: 'NunitoSans-Italic';
}`
const NunitoSansRegular = `@font-face { 
  src: url('/public/fonts/NunitoSans-Regular.ttf');
  font-family: 'NunitoSans-Regular';
}`
const PTSerifBold = `@font-face { 
  src: url('/public/fonts/PTSerif-Bold.ttf');
  font-family: 'PTSerif-Bold';
}`
const PTSerifBoldItalic = `@font-face { 
  src: url('/public/fonts/PTSerif-BoldItalic.ttf');
  font-family: 'PTSerif-BoldItalic';
}`
const PTSerifItalic = `@font-face { 
  src: url('/public/fonts/PTSerif-Italic.ttf');
  font-family: 'PTSerif-Italic';
}`
const PTSerifRegular = `@font-face { 
  src: url('/public/fonts/PTSerif-Regular.ttf');
  font-family: 'PTSerif';
}`
const PlayfairDisplayBlack = `@font-face { 
  src: url('/public/fonts/PlayfairDisplay-Black.ttf');
  font-family: 'PlayfairDisplay-Black';
}`
const PlayfairDisplayBlackItalic = `@font-face { 
  src: url('/public/fonts/PlayfairDisplay-BlackItalic.ttf');
  font-family: 'PlayfairDisplay-BlackItalic';
}`
const PlayfairDisplayBold = `@font-face { 
  src: url('/public/fonts/PlayfairDisplay-Bold.ttf');
  font-family: 'PlayfairDisplay-Bold';
}`
const PlayfairDisplayBoldItalic = `@font-face { 
  src: url('/public/fonts/PlayfairDisplay-BoldItalic.ttf');
  font-family: 'PlayfairDisplay-BoldItalic';
}`
const PlayfairDisplayItalic = `@font-face { 
  src: url('/public/fonts/PlayfairDisplay-Italic.ttf');
  font-family: 'PlayfairDisplay-Italic';
}`
const PlayfairDisplayRegular = `@font-face { 
  src: url('/public/fonts/PlayfairDisplay-Regular.ttf');
  font-family: 'PlayfairDisplay-Regular';
}`
const PlayfairDisplaySCBold = `@font-face { 
  src: url('/public/fonts/PlayfairDisplaySC-Bold.ttf');
  font-family: 'PlayfairDisplaySC-Bold';
}`
const PlayfairDisplaySCBoldItalic = `@font-face { 
  src: url('/public/fonts/PlayfairDisplaySC-BoldItalic.ttf');
  font-family: 'PlayfairDisplaySC-BoldItalic';
}`
const PoppinsExtraBold = `@font-face { 
  src: url('/public/fonts/Poppins-ExtraBold.ttf');
  font-family: 'Poppins-ExtraBold';
}`
const PoppinsExtraBoldItalic = `@font-face { 
  src: url('/public/fonts/Poppins-ExtraBoldItalic.ttf');
  font-family: 'Poppins-ExtraBoldItalic';
}`
const PoppinsItalic = `@font-face { 
  src: url('/public/fonts/Poppins-Italic.ttf');
  font-family: 'Poppins-Italic';
}`
const PoppinsRegular = `@font-face { 
  src: url('/public/fonts/Poppins-Regular.ttf');
  font-family: 'Poppins-Regular';
}`

if (Platform.OS === 'web') {
  
}

// Create stylesheet
export const fontStyles = Platform.OS === 'web' ? 
  document.createElement('style') :
  undefined

if (Platform.OS === 'web') {
  if (fontStyles.styleSheet) {
    fontStyles.styleSheet.cssText = `
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
  ${NunitoSansBold}
  ${NunitoSansBoldItalic}
  ${NunitoSansRegular}
  ${NunitoSansItalic}
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
    fontStyles.appendChild(document.createTextNode(IBMPlexMonoBold))
    fontStyles.appendChild(document.createTextNode(IBMPlexMonoBoldItalic))
    fontStyles.appendChild(document.createTextNode(IBMPlexMonoItalic))
    fontStyles.appendChild(document.createTextNode(IBMPlexMonoLight))
    fontStyles.appendChild(document.createTextNode(IBMPlexMonoLightItalic))
    fontStyles.appendChild(document.createTextNode(IBMPlexMono))
    fontStyles.appendChild(document.createTextNode(IBMPlexSansBold))
    fontStyles.appendChild(document.createTextNode(IBMPlexSansBoldItalic))
    fontStyles.appendChild(document.createTextNode(IBMPlexSansItalic))
    fontStyles.appendChild(document.createTextNode(IBMPlexSansLight))
    fontStyles.appendChild(document.createTextNode(IBMPlexSansLightItalic))
    fontStyles.appendChild(document.createTextNode(IBMPlexSans))
    fontStyles.appendChild(document.createTextNode(IBMPlexSansCondBold))
    fontStyles.appendChild(document.createTextNode(IBMPlexSansCondBoldItalic))
    fontStyles.appendChild(document.createTextNode(IBMPlexSansCondExtraLight))
    fontStyles.appendChild(document.createTextNode(IBMPlexSansCondExtraLightItalic))
    fontStyles.appendChild(document.createTextNode(IBMPlexSansCond))
    fontStyles.appendChild(document.createTextNode(IBMPlexSerifBold))
    fontStyles.appendChild(document.createTextNode(IBMPlexSerifBoldItalic))
    fontStyles.appendChild(document.createTextNode(IBMPlexSerifItalic))
    fontStyles.appendChild(document.createTextNode(IBMPlexSerifLight))
    fontStyles.appendChild(document.createTextNode(IBMPlexSerifLightItalic))
    fontStyles.appendChild(document.createTextNode(IBMPlexSerifThin))
    fontStyles.appendChild(document.createTextNode(IBMPlexSerifThinItalic))
    fontStyles.appendChild(document.createTextNode(IBMPlexSerif))
    fontStyles.appendChild(document.createTextNode(LibreBaskervilleBold))
    fontStyles.appendChild(document.createTextNode(LibreBaskervilleItalic))
    fontStyles.appendChild(document.createTextNode(LibreBaskervilleRegular))
    fontStyles.appendChild(document.createTextNode(MontserratBold))
    fontStyles.appendChild(document.createTextNode(MontserratBoldItalic))
    fontStyles.appendChild(document.createTextNode(MontserratLight))
    fontStyles.appendChild(document.createTextNode(MontserratLightItalic))
    fontStyles.appendChild(document.createTextNode(NunitoSansBold))
    fontStyles.appendChild(document.createTextNode(NunitoSansBoldItalic))
    fontStyles.appendChild(document.createTextNode(NunitoSansRegular))
    fontStyles.appendChild(document.createTextNode(NunitoSansItalic))
    fontStyles.appendChild(document.createTextNode(PTSerifBold))
    fontStyles.appendChild(document.createTextNode(PTSerifBoldItalic))
    fontStyles.appendChild(document.createTextNode(PTSerifItalic))
    fontStyles.appendChild(document.createTextNode(PTSerifRegular))
    fontStyles.appendChild(document.createTextNode(PlayfairDisplayBlack))
    fontStyles.appendChild(document.createTextNode(PlayfairDisplayBlackItalic))
    fontStyles.appendChild(document.createTextNode(PlayfairDisplayBold))
    fontStyles.appendChild(document.createTextNode(PlayfairDisplayBoldItalic))
    fontStyles.appendChild(document.createTextNode(PlayfairDisplayItalic))
    fontStyles.appendChild(document.createTextNode(PlayfairDisplayRegular))
    fontStyles.appendChild(document.createTextNode(PlayfairDisplaySCBold))
    fontStyles.appendChild(document.createTextNode(PlayfairDisplaySCBoldItalic))
    fontStyles.appendChild(document.createTextNode(PoppinsExtraBold))
    fontStyles.appendChild(document.createTextNode(PoppinsExtraBoldItalic))
    fontStyles.appendChild(document.createTextNode(PoppinsItalic))
    fontStyles.appendChild(document.createTextNode(PoppinsRegular))
  }
  
  // Inject stylesheet
  if (document !== undefined) {
    document.head.appendChild(fontStyles);
  }
  
  const HelloWorld = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Hello world!</Text></View>
  )
  
  registerRootComponent(Rizzle)
  
}
