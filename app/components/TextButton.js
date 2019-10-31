import React from 'react'
import {
  Image,
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
      isExpanded: this.props.isExpanded || false
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
    const { icon, isActive, isExpandable, isInverted, isCompact, onPress, text } = this.props
    const { isExpanded } = this.state
    const fgColor = this.props.fgColor || hslString('rizzleText')
    const bgColor = this.props.bgColor || 'white'
    if (icon) {
      console.log(icon)
    }
    let buttonStyle = {
      borderColor: fgColor,
      backgroundColor: isInverted ? fgColor : bgColor,
      borderWidth: 1,
      borderRadius: isCompact ? 16 : 21,
      paddingTop: isCompact ? 7 : 12,
      paddingBottom: isCompact ? 3 : 8,
      // flex: 1,
      height: isCompact ? 32 : 42,
      maxHeight: 42,
      ...this.props.buttonStyle
    }
    const textStyle = {
      fontFamily: 'IBMPlexSans-Bold',
      fontSize: isExpanded ? 18 : 16,
      lineHeight: 18,
      textAlign: 'center',
      color: isInverted ? bgColor : fgColor,
    }
    if (isExpandable) {
      return (
        <View
          style={{
            ...buttonStyle,
            overflow: 'hidden',
            maxHeight: isExpanded ? 'auto' : 42,
            height: isExpanded ? 'auto' : 42
          }}>
          { isExpanded ? this.props.iconExpanded : this.props.iconCollapsed }
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
      if (isActive) {
        buttonStyle.backgroundColor = fgColor
        textStyle.color = bgColor === 'transparent' ? 'white' : bgColor
      }
      return (
        <TouchableOpacity
          onPress={onPress}
          style={buttonStyle}>
          <View style={{
            position: 'absolute',
            top: 9,
            left: 8,
            backgroundColor: 'transparent'
          }}>{icon}</View>
          <Text style={textStyle}>{text}</Text>
        </TouchableOpacity>
      )
    }
  }
}

export default TextButton
