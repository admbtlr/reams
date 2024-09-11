import React from 'react'
import {
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

import {hslString} from '../utils/colors'
import { fontSizeMultiplier, getInset } from '../utils/dimensions'
import { BackgroundGradient } from './BackgroundGradient'

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
    if (Platform.OS === 'web') {
      if (this.props.isExpanded !== this.state.isExpanded &&
        this.state.isExpanded === prevState.isExpanded) {
        this.setState({
          isExpanded: this.props.isExpanded
        })
      }
    }
  }

  expand () {
    const { isGroup, text } = this.props
    // if this is part of a group, assume that the parent controls expanded states
    if (isGroup) {
      this.props.onExpand && this.props.onExpand()
    } else {
      const isExpanded = !this.state.isExpanded
      if (Platform.OS !== 'android') {
        LayoutAnimation.configureNext({
          ...LayoutAnimation.Presets.spring,
          duration: 400,
          update: { type: 'spring', springDamping: 0.8 }
        })
      }
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
      hasShadow,
      hideBorder,
      isDisabled,
      icon,
      isActive,
      isExpandable,
      isGradient,
      isGroup,
      isInverted,
      isCompact,
      noResize,
      onExpand,
      onPress,
      showMaxHeight,
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
    const height = (isCompact ? 4 : 24) + (18 * fontSizeMultiplier())
    let buttonStyle = {
      borderColor: borderColor,
      backgroundColor: isInverted ? fgColor : bgColor,
      borderWidth: isGradient ? 0 : 1,
      borderRadius: height / 2,
      // paddingTop: (isCompact ? 7 : 12) * fontSizeMultiplier(),
      // paddingBottom: (isCompact ? 3 : 8) * fontSizeMultiplier(),
      justifyContent: 'flex-start',
      // flex: 1,
      height,
      maxHeight: showMaxHeight ? height : 'auto',
      maxWidth: 700,
      width: isCompact ? 'auto' : '100%',
      ...this.props.buttonStyle,
      paddingTop: (isCompact ? 2 : 9) * fontSizeMultiplier()
    }
    if (Platform.OS === 'ios') {
      buttonStyle.maxHeight = 42 * fontSizeMultiplier()
    }
    if (hasShadow) {
      buttonStyle = {
        ...buttonStyle,
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: {
          width: 0,
          height: 5
        }
      }
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
      fontFamily: isExpanded ? 'IBMPlexSans-Bold' : 'IBMPlexSans',
      fontSize: (isExpanded ? 24 : isCompact ? 12 : 16) * fontSizeMultiplier(),
      lineHeight: (isExpanded ? 24 : 18) * fontSizeMultiplier(),
      textAlign: 'center',
      color: isInverted ? bgColor : fgColor,
      marginHorizontal: -10,
      opacity: isDisabled ? 0.5 : 1,
      paddingLeft: (isCompact ? 5 : 20) * fontSizeMultiplier(),
      paddingRight: (isCompact ? 5 : 20) * fontSizeMultiplier(),
      paddingTop: (isCompact ? 0 : 3) * fontSizeMultiplier(),
      marginTop: (isCompact ? -1 : (isExpanded ? 4 : 0))
    }
    if (isExpandable) {
      if (Platform.OS === 'ios') {
        buttonStyle.maxHeight = (isExpanded ? 'auto' : 42 * fontSizeMultiplier())
      } else {
        buttonStyle.maxHeight = undefined
      }
      return (
        <Animated.View
          style={{
            ...buttonStyle,
            overflow: 'hidden',
            // maxHeight: (isExpanded ? 'auto' : 42 * fontSizeMultiplier()),
            height: (isExpanded ? 'auto' : 42 * fontSizeMultiplier())
          }}>
          { this.props.isGradient && <BackgroundGradient index={ this.props.gradientIndex || 0 } /> }
          <View style={{
            position: 'absolute',
            top: (isCompact ? 2 : 4),
            left: 4,
            height: (isCompact ? 18 : 32) * fontSizeMultiplier(),
            width: (isCompact ? 18 : 32) * fontSizeMultiplier(),
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
          { this.props.expandedView }
        </Animated.View>
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
              marginLeft: icon ? 15 * fontSizeMultiplier() : -10,
              opacity: isDisabled ? 0.6 : 1
            }}
        >{text}</Text>
        </TouchableOpacity>
      )
    }
  }
}

export default TextButton