import React from 'react'
import {
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import AccountCredentialsForm from './AccountCredentialsForm'
import {hslString} from '../utils/colors'

class TextButton extends React.Component {
  constructor (props) {
    super(props)
    this.props = props

    this.state = {
      isExpanded: false
    }

    this.expand = this.expand.bind(this)
  }

  expand () {
    this.setState({
      ...this.state,
      isExpanded: !this.state.isExpanded
    })
  }

  render () {
    const { isExpandable, isInverted, onPress, text } = this.props
    const fgColor = this.props.fgColor || 'hsl(300, 20%, 20%)'
    const bgColor = this.props.bgColor || 'white'
    let buttonStyle = {
      borderColor: fgColor,
      backgroundColor: bgColor,
      borderWidth: 1,
      borderRadius: 21,
      paddingTop: 14,
      paddingBottom: 8,
      // flex: 1,
      height: 42,
      maxHeight: 42,
      ...this.props.buttonStyle
    }
    const textStyle = {
      fontFamily: 'IBMPlexMono',
      fontSize: 16,
      lineHeight: 16,
      textAlign: 'center',
      color: isInverted ? bgColor : fgColor,
    }
    if (isExpandable) {
      return (
        <View
          style={{
            ...buttonStyle,
            overflow: 'hidden',
            maxHeight: this.state.isExpanded ? 'auto' : 42,
            height: this.state.isExpanded ? 'auto' : 42
          }}>
          <TouchableOpacity
            onPress={this.expand}
          >
            <Text style={textStyle}>{text}</Text>
          </TouchableOpacity>
          { this.props.renderExpandedView() }
        </View>
      )
    } else {
      buttonStyle = {
        ...buttonStyle,
        flex: 1
      }
      return (
        <TouchableOpacity
          onPress={onPress}
          style={buttonStyle}>
          <Text style={textStyle}>{text}</Text>
        </TouchableOpacity>
      )
    }
  }
}

export default TextButton
