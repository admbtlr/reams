import React from 'react'
import {
  Dimensions,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import Svg, {Path} from 'react-native-svg'
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
    const { icon, isActive, isExpandable, isInverted, isCompact, noResize, onPress, testID, text } = this.props
    const { isExpanded } = this.state
    const fgColor = this.props.fgColor || hslString('rizzleText')
    const bgColor = this.props.bgColor || hslString('buttonBG')
    const borderColor = this.props.hideBorder ? bgColor : fgColor
    let buttonStyle = {
      borderColor: borderColor,
      backgroundColor: isInverted ? fgColor : bgColor,
      borderWidth: 1,
      borderRadius: (isCompact ? 16 : 21) * fontSizeMultiplier(),
      // paddingTop: (isCompact ? 7 : 12) * fontSizeMultiplier(),
      // paddingBottom: (isCompact ? 3 : 8) * fontSizeMultiplier(),
      justifyContent: 'flex-start',
      flex: 1,
      height: (isCompact ? 32 : 42) * fontSizeMultiplier(),
      maxHeight: 42 * fontSizeMultiplier(),
      ...this.props.buttonStyle,
      maxWidth: 700,
      paddingTop: 8
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
      fontSize: (isExpanded ? 24 : 16) * fontSizeMultiplier(),
      lineHeight: (isExpanded ? 24 : 18) * fontSizeMultiplier(),
      textAlign: 'center',
      color: isInverted ? bgColor : fgColor,
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: isCompact ? 0 : 3,
      marginTop: isCompact ? -1 : 0
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
          <View style={{
            position: 'absolute',
            top: (isCompact ? 2 : 4) * fontSizeMultiplier(),
            left: 4 * fontSizeMultiplier(),
            height: (isCompact ? 24 : 32) * fontSizeMultiplier(),
            width: (isCompact ? 24 : 32) * fontSizeMultiplier(),
            padding: 2,
            borderRadius: this.props.iconBg ? ((isCompact ? 24 : 32) * fontSizeMultiplier()) / 2 : 0,
            backgroundColor: this.props.iconBg ? (isInverted ? bgColor : fgColor) : 'transparent'
          }}>
            { isExpanded ? this.props.iconExpanded : this.props.iconCollapsed }
          </View>
          <TouchableOpacity
            onPress={this.expand}
            testID={testID}
          >
            <Text
              maxFontSizeMultiplier={1.2}
              style={textStyle}
            >{text}</Text>
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
          style={buttonStyle}
          testID={testID}>
          <View
            style={{
              position: 'absolute',
              top: (isCompact ? 3 : 8) * fontSizeMultiplier(),
              left: 8 * fontSizeMultiplier(),
              backgroundColor: 'transparent'
            }}
          >{icon}</View>
          <Text
            maxFontSizeMultiplier={1.2}
            style={textStyle}
          >{text}</Text>
        </TouchableOpacity>
      )
    }
  }
}

export default TextButton
