import React, { useState, useRef, useCallback } from 'react'
import {
  Animated,
  Platform,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import { hslString } from '../utils/colors'
import { textInfoStyle } from '@/utils/styles'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/reducers'

const RizzleButton = (props) => {
  const {
    backgroundColor,
    borderColor,
    children,
    iconOff,
    iconOn,
    initialToggleState,
    isToggle,
    label,
    onPress,
    style,
    text
  } = props

  const showButtonLabels = useSelector((state: RootState) => state.ui.showButtonLabels)
  const [toggleState, setToggleState] = useState(initialToggleState || false)
  const toggleAnim = useRef(new Animated.Value(initialToggleState ? 1 : 0)).current

  const getBackgroundColor = useCallback(() => {
    return backgroundColor || hslString('rizzleSaved')
  }, [backgroundColor])

  const getStyles = useCallback(() => {
    return {
      width: style && style.width ? style.width : 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      flexDirection: 'column',
    }
  }, [style])

  const handlePress = useCallback(() => {
    if (isToggle) {
      const newToggleState = !toggleState
      setToggleState(newToggleState)

      Animated.timing(toggleAnim, {
        toValue: newToggleState ? 1 : 0,
        duration: 300,
        useNativeDriver: true
      }).start()
    }

    if (Platform.OS !== 'web') {
      ReactNativeHapticFeedback.trigger("impactLight", {})
    }

    onPress?.(toggleState)
  }, [isToggle, toggleState, toggleAnim, onPress])

  const getTogglableInnerView = useCallback(() => {
    const style = {
      position: 'absolute',
      left: 0,
      top: 0,
      width: 50,
      height: 50,
      transform: [{
        rotate: toggleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg']
        })
      }]
    }

    const onStyle = {
      ...style,
      opacity: toggleAnim
    }

    const offStyle = {
      ...style,
      opacity: toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0]
      })
    }

    return (
      <>
        <Animated.View style={offStyle}>
          {iconOff}
        </Animated.View>
        <Animated.View style={onStyle}>
          {iconOn}
        </Animated.View>
      </>
    )
  }, [toggleAnim, iconOff, iconOn])

  const buttonStyle = {
    opacity: 0.95,
    backgroundColor: getBackgroundColor(),
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 5
    }
  }

  const newProps = { ...props }
  delete newProps.style

  return (
    <Animated.View style={{
      ...style,
      flex: 0,
      alignItems: 'center',
      transform: [
        ...(style.transform || []),
      ]
    }}>
      <View style={{
        width: text && text.length > 0 ? 'auto' :
          style && style.width ?
            style.width :
            60,
        height: 60,
        paddingTop: 5,
        paddingLeft: 5,
        paddingBottom: 5,
        paddingRight: 5,
      }}>
        <TouchableOpacity
          hitSlop={{
            top: 5,
            right: 5,
            bottom: 5,
            left: 5
          }}
          testID={props.testID}
          accessibilityLabel={props.accessibilityLabel}
          onPressOut={handlePress}
          style={{
            borderRadius: 25,
            ...buttonStyle,
          }}
        >
          <View style={{
            ...getStyles(),
            paddingHorizontal: style.paddingHorizontal || 0
          }}
            {...newProps}
          >
            {isToggle ? getTogglableInnerView() : children}
          </View>
        </TouchableOpacity>
      </View>
      {label && showButtonLabels && (
        <View style={{
          borderRadius: 5,
          padding: 2,
          marginHorizontal: 10,
          ...buttonStyle,
          backgroundColor: borderColor || hslString('rizzleSaved'),
        }}>
          <Text style={{
            ...textInfoStyle,
            fontSize: 9,
            color: hslString('white')
          }}>{label.toUpperCase()}</Text>
        </View>
      )}
    </Animated.View>
  )
}

export default RizzleButton
