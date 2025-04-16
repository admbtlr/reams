import { fontSizeMultiplier } from './dimensions'
import { hslString } from './colors'

export const opacitise = (color, opacity) => color.indexOf('hsl') === -1 ?
  hslString(color, '', opacity) :
  color.replace(/hsl\(([0-9]*), ([0-9]*%), ([0-9]*%)/, `hsla($1, $2, $3, ${opacity}`)

export const baseStyles = (color = 'rizzleText', opacity = 1) => ({
  fontFamily: 'IBMPlexMono',
  color: opacitise(color, opacity)
})

export const textInputStyle = (color = 'rizzleText') => ({
  ...baseStyles(color),
  // padding: 8,
  fontSize: 20 * fontSizeMultiplier(),
  borderBottomColor: opacitise(color, 0.5),
  borderBottomWidth: 1
})

export const textValueStyle = (color) => ({
  ...baseStyles(color),
  fontSize: 12 * fontSizeMultiplier()
})

export const textUiStyle = (color) => ({
  ...baseStyles(color),
  fontFamily: 'IBMPlexSans',
  fontSize: 14 * fontSizeMultiplier()
})

export const textLabelStyle = (color = 'rizzleText') => ({
  ...baseStyles(color),
  fontFamily: 'IBMPlexSans-Light',
  fontSize: 12 * fontSizeMultiplier(),
  marginTop: 3,
  textTransform: 'uppercase',
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

export const textInfoBoldStyle = (color, margin = 20 * fontSizeMultiplier(), isSmaller = false) => ({
  ...textInfoStyle(color, margin, isSmaller),
  fontFamily: 'IBMPlexSans-Bold'
})

export const textInfoItalicStyle = (color, margin = 20 * fontSizeMultiplier()) => ({
  ...textInfoStyle(color, margin),
  fontFamily: 'IBMPlexSans-Italic'
})

export const textInfoBoldItalicStyle = (color, margin = 20 * fontSizeMultiplier()) => ({
  ...textInfoStyle(color, margin = 20 * fontSizeMultiplier()),
  fontFamily: 'IBMPlexSans-BoldItalic'
})

export const textInfoMonoStyle = (color, margin = 20 * fontSizeMultiplier()) => ({
  ...baseStyles(color),
  fontFamily: 'IBMPlexMono',
  marginLeft: margin,
  marginRight: margin,
  lineHeight: 24 * fontSizeMultiplier(),
  fontSize: 16 * fontSizeMultiplier()
})

export const textInfoMonoItalicStyle = (color, margin = 20 * fontSizeMultiplier()) => ({
  ...textInfoStyle(color, margin),
  fontFamily: 'IBMPlexMono-Italic'
})

export const textInfoMonoBoldStyle = (color, margin = 20 * fontSizeMultiplier()) => ({
  ...textInfoStyle(color, margin),
  fontFamily: 'IBMPlexMono-Bold'
})

export const textSerifStyle = (color, margin = 20) => ({
  ...baseStyles(color),
  fontFamily: 'IBMPlexSerif',
  marginLeft: margin,
  marginRight: margin,
  fontSize: 16 * fontSizeMultiplier()
})
