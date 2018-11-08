import React from 'react'
import {
  Text,
  TouchableOpacity
} from 'react-native'
import {hslString} from '../utils/colors'

class TextButton extends React.Component {
  constructor (props) {
    super(props)
    this.props = props
  }

  render () {
    const { isInverted, onPress, text } = this.props
    const fgColor = this.props.fgColor || 'hsl(300, 20%, 20%)'
    const bgColor = this.props.bgColor || 'white'
    return (
      <TouchableOpacity
        onPress={onPress}
        style={{
          borderColor: fgColor,
          backgroundColor: bgColor,
          borderWidth: 1,
          borderRadius: 21,
          paddingTop: 14,
          paddingBottom: 8,
          flex: 1,
          height: 42,
          ...this.props.buttonStyle
        }}>
        <Text style={{
          fontFamily: 'IBMPlexMono',
          fontSize: 16,
          lineHeight: 16,
          textAlign: 'center',
          color: isInverted ? bgColor : fgColor
        }}>{text}</Text>
      </TouchableOpacity>
    )
  }
}

export default TextButton
