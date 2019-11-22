import React from 'react'
import {
  Dimensions,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import AccountCredentialsForm from './AccountCredentialsForm'
import {hslString} from '../utils/colors'
import { fontSizeMultiplier } from '../utils'

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
    const { icon, isActive, isExpandable, isInverted, isCompact, noResize, onPress, text } = this.props
    const { isExpanded } = this.state
    const fgColor = this.props.fgColor || hslString('rizzleText')
    const bgColor = this.props.bgColor || 'white'
    let buttonStyle = {
      borderColor: fgColor,
      backgroundColor: isInverted ? fgColor : bgColor,
      borderWidth: 1,
      borderRadius: (isCompact ? 16 : 21) * fontSizeMultiplier(),
      paddingTop: (isCompact ? 7 : 12) * fontSizeMultiplier(),
      paddingBottom: (isCompact ? 3 : 8) * fontSizeMultiplier(),
      // flex: 1,
      height: (isCompact ? 32 : 42) * fontSizeMultiplier(),
      maxHeight: 42 * fontSizeMultiplier(),
      ...this.props.buttonStyle,
      maxWidth: 700,
      // alignSelf: 'center'
    }
    if (Dimensions.get('window').width > 950) {
      if (this.props.buttonStyle && this.props.buttonStyle.width) {
        buttonStyle.width = this.props.buttonStyle.width
      } else if (!noResize) {
        buttonStyle.maxWidth = 600
        buttonStyle.alignSelf = 'center'
      }
    }

    const textStyle = {
      fontFamily: 'IBMPlexSans-Bold',
      fontSize: (isExpanded ? 18 : 16) * fontSizeMultiplier(),
      lineHeight: 18 * fontSizeMultiplier(),
      textAlign: 'center',
      color: isInverted ? bgColor : fgColor
    }
    if (isExpandable) {
      return (
        <View
          style={{
            ...buttonStyle,
            overflow: 'hidden',
            maxHeight: (isExpanded ? 'auto' : 42 * fontSizeMultiplier()),
            height: (isExpanded ? 'auto' : 42 * fontSizeMultiplier())
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
            top: (isCompact ? 3 : 9) * fontSizeMultiplier(),
            left: 8 * fontSizeMultiplier(),
            backgroundColor: 'transparent'
          }}>{icon}</View>
          <Text style={textStyle}>{text}</Text>
        </TouchableOpacity>
      )
    }
  }
}

export default TextButton
