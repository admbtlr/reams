import { fontSizeMultiplier } from '../utils'
import { hslString } from './colors'

export const baseStyles = (color = 'rizzleText', opacity = 1) => ({
  fontFamily: 'IBMPlexMono',
  align: 'left',
  color: hslString(color, '', opacity)
})

export const textInputStyle = (color = 'rizzleText') => ({
  ...baseStyles(color),
  // padding: 8,
  fontSize: 20 * fontSizeMultiplier(),
  borderBottomColor: hslString(color, '', 0.5),
  borderBottomWidth: 1
})

export const textValueStyle = (color) => ({
  ...baseStyles(color),
  fontSize: 12 * fontSizeMultiplier()
})

export const textLabelStyle = (color) => ({
  ...baseStyles(color),
  textTransform: 'uppercase',
  fontFamily: 'IBMPlexSans-Light',
  fontSize: 12 * fontSizeMultiplier(),
  marginTop: 3
})

export const textButtonStyle = (color) => ({
  ...baseStyles(color),
  fontSize: 16 * fontSizeMultiplier(),
  textDecorationLine: 'underline'
})

export const textInfoStyle = (color, margin = 20 * fontSizeMultiplier(), isSmaller = false) => ({
  ...baseStyles(color),
  fontFamily: 'IBMPlexSans',
  marginLeft: margin,
  marginRight: margin,
  fontSize: (isSmaller ? 12 : 16) * fontSizeMultiplier()
})

export const textInfoBoldStyle = (color) => ({
  ...textInfoStyle(color),
  fontFamily: 'IBMPlexSans-Bold'
})

export const textInfoItalicStyle = (color) => ({
  ...textInfoStyle(color),
  fontFamily: 'IBMPlexSans-Italic'
})

export const textInfoMonoStyle = (color) => ({
  ...baseStyles(color),
  fontFamily: 'IBMPlexMono',
  marginLeft: 20,
  marginRight: 20,
  lineHeight: 24 * fontSizeMultiplier(),
  fontSize: 16 * fontSizeMultiplier()
})
