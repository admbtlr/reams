import React from 'react'
import {
  TouchableOpacity,
  View
} from 'react-native'

class RizzleButton extends React.Component {
  constructor (props) {
    super(props)
    this.props = props
  }

  getStyles () {
    return {
        backgroundColor: this.props.displayMode && this.props.displayMode == 'saved' ? '#5f4d2f' : '#51485f',
        opacity: 0.95,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        flexDirection: 'column',
        shadowOffset: {
          width: 0,
          height: 3
        },
        shadowRadius: 3,
        shadowOpacity: 0.3
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
