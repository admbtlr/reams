import React from 'react'
import {
  TouchableOpacity,
  View
} from 'react-native'
import Svg, {Path} from 'react-native-svg'

class XButton extends React.Component {
  constructor (props) {
    super(props)
    this.props = props
  }

  render () {
    const { isLight, onPress } = this.props
    const fgColor = this.props.isLight ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
    return (
      <View style={{
        height: 28,
        position: 'absolute',
        right: 0,
        top: 0,
        width: 28,
        ...this.props.style
      }}>
        <TouchableOpacity
          onPress={onPress}
          style={{
            width: 28,
            height: 28
          }}>
          <Svg
            height='28'
            width='28'>
            <Path
              d="M14,12.5857864 L8.34314575,6.92893219 C7.95262146,6.5384079 7.31945648,6.5384079 6.92893219,6.92893219 C6.5384079,7.31945648 6.5384079,7.95262146 6.92893219,8.34314575 L12.5857864,14 L6.92893219,19.6568542 C6.5384079,20.0473785 6.5384079,20.6805435 6.92893219,21.0710678 C7.31945648,21.4615921 7.95262146,21.4615921 8.34314575,21.0710678 L14,15.4142136 L19.6568542,21.0710678 C20.0473785,21.4615921 20.6805435,21.4615921 21.0710678,21.0710678 C21.4615921,20.6805435 21.4615921,20.0473785 21.0710678,19.6568542 L15.4142136,14 L21.0710678,8.34314575 C21.4615921,7.95262146 21.4615921,7.31945648 21.0710678,6.92893219 C20.6805435,6.5384079 20.0473785,6.5384079 19.6568542,6.92893219 L14,12.5857864 Z M14,28 C6.2680135,28 0,21.7319865 0,14 C0,6.2680135 6.2680135,0 14,0 C21.7319865,0 28,6.2680135 28,14 C28,21.7319865 21.7319865,28 14,28 Z"
              fill={fgColor} />
          </Svg>
        </TouchableOpacity>
      </View>
    )
  }
}

export default XButton
