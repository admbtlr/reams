import { Dimensions, Platform } from 'react-native';


export const hasNotchOrIsland = () => {
  let d = Dimensions.get('window')
  const { height, width } = d
  const heights = [812, 844, 852, 874, 896, 932]

  return (
    Platform.OS === 'ios' &&
    // Accounting for the height in either orientation
    (heights.includes(height) || heights.includes(width))
  )
}; export const isIpad = () => {
  return Platform.OS === 'ios' && getSmallestDimension() > 700
};
export const isPortrait = () => Dimensions.get('window').height > Dimensions.get('window').width;
export let screenWidth: number, screenHeight: number;
export const getDimensions = () => {
  // this is a remnant from before we supported both screen orientations
  // and we were cacheing the dimensions
  screenWidth = Dimensions.get('window').width
  screenHeight = Dimensions.get('window').height
};
export const getSmallestDimension = () => {
  getDimensions()
  return Math.min(screenWidth, screenHeight)
};
export const fontSizeMultiplier: any = () => {
  if (Platform.OS === 'web') return 1
  getDimensions()
  const smallestDimension = getSmallestDimension()
  // this happens for the schare extension
  if (screenWidth === 0 && screenHeight === 0) return 1
  return screenWidth * screenHeight < 310000 ?
    0.85 : // this is iPhone 8 at this point
    smallestDimension < 768 ? 1 : (smallestDimension / 768).toPrecision(4)
};
export const getInset = () => {
  const width = getSmallestDimension()
  return width < 768 ?
    width * 0.05 :
    width * 0.1
};
export const getMargin = () => {
  if (Platform.OS === 'web') return 10
  const width = getSmallestDimension()
  return width * 0.05 / (width > 768 ? width / 768 : 1)
};
export const getStatusBarHeight = () => 70 * fontSizeMultiplier() +
  (hasNotchOrIsland() && isPortrait() ? 44 : 22)
