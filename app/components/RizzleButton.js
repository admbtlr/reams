import React from 'react'
import {
  TouchableOpacity,
  View
} from 'react-native'
import {hslString} from '../utils/colors'

class RizzleButton extends React.Component {
  constructor (props) {
    super(props)
    this.props = props
  }

  getStyles () {
    const backgroundColor = this.props.backgroundColor || hslString('rizzleBG')
    return {
        backgroundColor,
        opacity: 0.95,
        width: 56,
        height: 56,
        borderRadius: 28,
        borderColor: backgroundColor,
        borderWidth: 1,
        justifyContent: 'center',
        flexDirection: 'column',
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowRadius: 2,
        shadowOpacity: 0.1
    }
  }

  render () {
    let newProps = Object.assign({}, this.props)
    delete newProps.style
    return <TouchableOpacity style={{
      ...this.getStyles(),
      ...this.props.style
    }}
    { ...newProps } />
  }
}

export default RizzleButton
