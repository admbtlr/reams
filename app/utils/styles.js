import { hslString } from './colors'

export const baseStyles = () => ({
  fontFamily: 'IBMPlexMono',
  textAlign: 'left',
  color: hslString('rizzleText')
})

export const textInputStyle = () => ({
  ...baseStyles(),
  // padding: 8,
  fontSize: 20,
  borderBottomColor: hslString('rizzleText'),
  borderBottomWidth: 1
})

export const textValueStyle = () => ({
  ...baseStyles(),
  fontSize: 12
})

export const textLabelStyle = () => ({
  ...baseStyles(),
  fontSize: 12,
  marginTop: 3
})

export const textButtonStyle = () => ({
  ...baseStyles(),
  fontSize: 16,
  textDecorationLine: 'underline'
})

export const textInfoStyle = () => ({
  ...baseStyles(),
  fontFamily: 'IBMPlexSans',
  marginLeft: 20,
  marginRight: 20,
  fontSize: 18
})

export const textInfoBoldStyle = () => ({
  ...textInfoStyle,
  fontFamily: 'IBMPlexSans-Bold'
})

export const textInfoMonoStyle = () => ({
  ...baseStyles(),
  fontFamily: 'IBMPlexMono',
  marginLeft: 20,
  marginRight: 20,
  lineHeight: 24,
  fontSize: 16
})
