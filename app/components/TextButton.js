import React from 'react'
import {
  Dimensions,
  LayoutAnimation,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import {hslString} from '../utils/colors'
import { fontSizeMultiplier, getInset } from '../utils'

class TextButton extends React.Component {
  constructor (props) {
    super(props)
    this.props = props

    this.state = {
      isExpanded: this.props.isExpanded || false
    }

    this.expand = this.expand.bind(this)
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.isExpanded !== this.state.isExpanded &&
      this.state.isExpanded === prevState.isExpanded) {
      this.setState({
        isExpanded: this.props.isExpanded
      })
    }
  }

  expand () {
    const { isGroup, text } = this.props
    // if this is part of a group, assume that the parent controls expanded states
    if (isGroup) {
      this.props.onExpand && this.props.onExpand()
    } else {
      const isExpanded = !this.state.isExpanded
      LayoutAnimation.configureNext({
        ...LayoutAnimation.Presets.spring,
        duration: 400,
        update: { type: 'spring', springDamping: 0.8 }
      })
      // LayoutAnimation.configureNext({
      //   duration: 300,
      //   type: LayoutAnimation.Types.spring,
      //   springDamping: 0.6
      // })
      this.setState({
        ...this.state,
        isExpanded
      })
      this.props.onExpand && this.props.onExpand(isExpanded)
    }
  }

  render () {
    let {
      bgColor,
      borderColor,
      fgColor,
      hideBorder,
      isDisabled,
      icon,
      isActive,
      isExpandable,
      isGroup,
      isInverted,
      isCompact,
      noResize,
      onExpand,
      onPress,
      testID,
      text
    } = this.props
    const { isExpanded } = this.state
    fgColor = fgColor || hslString('rizzleText')
    bgColor = bgColor || hslString('buttonBG')
    borderColor = hideBorder ? 
      (isInverted ? fgColor : bgColor) : 
      borderColor || hslString('rizzleText', '', 0.5)
    const screenWidth = Dimensions.get('window').width
    const inset = getInset()
    const height = (isCompact ? 14 : 24) + (18 * fontSizeMultiplier())
    let buttonStyle = {
      borderColor: borderColor,
      backgroundColor: isInverted ? fgColor : bgColor,
      borderWidth: 1,
      borderRadius: height / 2,
      // paddingTop: (isCompact ? 7 : 12) * fontSizeMultiplier(),
      // paddingBottom: (isCompact ? 3 : 8) * fontSizeMultiplier(),
      justifyContent: 'flex-start',
      flex: 0,
      height,
      maxHeight: 42 * fontSizeMultiplier(),
      maxWidth: 700,
      width: '100%',
      ...this.props.buttonStyle,
      paddingTop: 8 * fontSizeMultiplier()
    }
    if (screenWidth > 767) {
      if (this.props.buttonStyle && this.props.buttonStyle.width) {
        buttonStyle.width = this.props.buttonStyle.width
      } else if (!noResize) {
        buttonStyle.maxWidth = screenWidth - getInset() * 4
        buttonStyle.alignSelf = 'center'
      }
    }

    const textStyle = {
      fontFamily: 'IBMPlexSans-Bold',
      fontSize: (isExpanded ? 24 : 16) * fontSizeMultiplier(),
      lineHeight: (isExpanded ? 24 : 18) * fontSizeMultiplier(),
      textAlign: 'center',
      color: isInverted ? bgColor : fgColor,
      opacity: isDisabled ? 0.5 : 1,
      paddingLeft: 20 * fontSizeMultiplier(),
      paddingRight: 20 * fontSizeMultiplier(),
      paddingTop: (isCompact ? 0 : 3) * fontSizeMultiplier(),
      marginTop: (isCompact ? -1 : 0)
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
            top: (isCompact ? 2 : 4),
            left: 4,
            height: (isCompact ? 24 : 32) * fontSizeMultiplier(),
            width: (isCompact ? 24 : 32) * fontSizeMultiplier(),
            padding: 2,
            borderRadius: this.props.iconBg ? ((isCompact ? 24 : 32) * fontSizeMultiplier()) / 2 : 0,
            backgroundColor: this.props.iconBg ? (isInverted ? bgColor : fgColor) : 'transparent'
          }}>
            { isExpanded ? this.props.iconExpanded : this.props.iconCollapsed }
          </View>
          <TouchableOpacity
            disabled={isDisabled}
            onPress={this.expand}
            testID={testID}
          >
            <Text
              maxFontSizeMultiplier={1.2}
              style={{
                ...textStyle,
                opacity: isDisabled ? 0.6 : 1
              }}
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
          disabled={isDisabled}
          onPress={onPress}
          style={buttonStyle}
          testID={testID}>
          <View
            style={{
              position: 'absolute',
              top: (isCompact ? 4 : 8)  * fontSizeMultiplier(),
              left: 8 * fontSizeMultiplier(),
              backgroundColor: 'transparent'
            }}
          >{icon}</View>
          <Text
            maxFontSizeMultiplier={1.2}
            style={{
              ...textStyle,
              opacity: isDisabled ? 0.6 : 1
            }}
        >{text}</Text>
        </TouchableOpacity>
      )
    }
  }
}

export default TextButton
