import "./wdyr";
import "react-native-gesture-handler";

import { registerRootComponent } from "expo";
import Rizzle from "./components/Rizzle";

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
import './public/fonts/IBMPlexSerif.ttf'
import './public/fonts/LibreBaskerville-Bold.ttf'
import './public/fonts/LibreBaskerville-Italic.ttf'
import './public/fonts/LibreBaskerville-Regular.ttf'
import './public/fonts/Montserrat-Bold.ttf'
import './public/fonts/Montserrat-BoldItalic.ttf'
import './public/fonts/Montserrat-Regular.ttf'
import './public/fonts/Montserrat-Italic.ttf'
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

registerRootComponent(Rizzle)
