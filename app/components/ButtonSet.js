import React, { useEffect, useState, Fragment } from 'react'
import { useDispatch } from 'react-redux'
import {
  Animated,
  Dimensions,
  Image,
  InteractionManager,
  ScrollView,
  StatusBar,
  StatusBarAnimation,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import RizzleButton from './RizzleButton'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import { fontSizeMultiplier } from '../utils'
import { hslString } from '../utils/colors'

// isDarkBackground, displayMode, isOnboarding
let areButtonsVisible = true

export default function ButtonSet ({
  displayMode,
  isCurrent,
  isDarkBackground,
  item,
  launchBrowser,
  opacityAnim,
  setSaved,
  showShareSheet,
  toggleMercury,
  toggleViewButtons,
  visible
}) {
  useEffect(() => {
    makeVisible(visible)
  }, [visible])

  const visibleAnim = new Animated.Value(0)
  const toggleAnimMercury = new Animated.Value(0)
  const toggleAnimSaved = new Animated.Value(0)

  const translateDistance = 80

  let isItemSaved = item.isSaved
  let isItemMercury = item.showMercuryContent

  const strokeColor = isDarkBackground ?
    'hsl(0, 0%, 70%)' :
    'black'
  const showMercuryContent = item && item.showMercuryContent
  const isMercuryButtonEnabled = item && item.content_mercury
  const saveStrokeColours = item && item.isSaved ?
    ['hsl(45, 60%, 51%)', 'hsl(210, 60%, 51%)', 'hsl(15, 60%, 51%)'] :
    [strokeColor, strokeColor, strokeColor]
  const saveFillColors = ['white', 'white', 'white']
  let activeColor = displayMode === 'saved' ?
      hslString('rizzleText', 'ui') :
    item ?
      hslString(item.feed_color, 'darkmodable') :
    null
  const borderColor = displayMode == 'saved' ?
    isDarkBackground ? 'hsl(0, 0%, 80%)' : hslString('rizzleText') :
    activeColor
  const backgroundColor = displayMode == 'saved' ?
    hslString('rizzleBG') :
    hslString('buttonBG')
  const backgroundColorLighter = backgroundColor.replace(/[0-9]*\%\)/, '70%)')
  const borderWidth = 1

  const getMercuryToggleOpacity = (item, isCurrent) => {
    if (isCurrent) {
      return toggleAnimMercury
    } else {
      return item && item.showMercuryContent ? 1 : 0
    }
  }

  const makeVisible = (areVisible) => {
    Animated.timing(
      visibleAnim,
      {
        toValue: areVisible ? 0 : 1,
        duration: 800,
        useNativeDriver: true
      }
    ).start(_ => {
      areButtonsVisible = areVisible ? 0 : 1
    })
  }

  const startToggleAnimationMercury = () => {
    isItemMercury = !isItemMercury
    Animated.timing(toggleAnimMercury, {
      toValue: isItemMercury ? 1 : 0,
      delay: 250,
      duration: 500,
      // useNativeDriver: true
    }).start()
  }


  return (
    <Animated.View
      pointerEvents={isCurrent ? 'box-none' : 'none'}
      style={{
        ...getStyles().base,
        opacity: opacityAnim || 1
      }}>
      <RizzleButton
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        borderWidth={borderWidth}
        iconOff={getRizzleButtonIcon('toggleViewButtonsIcon', borderColor, backgroundColor)}
        iconOn={getRizzleButtonIcon('toggleViewButtonsIcon', borderColor, backgroundColor)}
        initialToggleState={false}
        isToggle={true}
        style={{
          paddingLeft: 1,
          transform: [{
            translateY: isCurrent ? visibleAnim.interpolate({
              inputRange: [0, 0.167, 0.333, 0.5, 1],
              outputRange: [0, translateDistance * -0.2, translateDistance, translateDistance, translateDistance]
            }) : 0
          }]
        }}
        onPress={toggleViewButtons}
      />
      <RizzleButton
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        borderWidth={borderWidth}
        style={{
          paddingLeft: 0,
          transform: [{
            translateY: isCurrent ? visibleAnim.interpolate({
              inputRange: [0, 0.167, 0.333, 0.5, 1],
              outputRange: [0, 0, translateDistance * -0.2, translateDistance, translateDistance]
            }) : 0
          }]
        }}
        onPress={showShareSheet}
        >
        { getRizzleButtonIcon('showShareSheetIcon', borderColor, backgroundColor) }
      </RizzleButton>
      <RizzleButton
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        borderWidth={borderWidth}
        iconOff={getRizzleButtonIcon('saveButtonIconOff', borderColor, backgroundColor)}
        iconOn={getRizzleButtonIcon('saveButtonIconOn', borderColor, backgroundColor)}
        initialToggleState={isItemSaved}
        isToggle={true}
        style={{
          paddingLeft: 1,
          transform: [{
            translateY: isCurrent ? visibleAnim.interpolate({
              inputRange: [0, 0.333, 0.5, 0.667, 1],
              outputRange: [0, 0, translateDistance * -0.2, translateDistance, translateDistance]
            }) : 0
          }]
        }}
        onPress={(isSaved) => setSaved(item, isSaved)}
      />
      <RizzleButton
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        borderWidth={borderWidth}
        style={{
          paddingLeft: 0,
          transform: [{
            translateY: isCurrent ? visibleAnim.interpolate({
              inputRange: [0, 0.5, 0.667, 0.833, 1],
              outputRange: [0, 0, translateDistance * -0.2, translateDistance, translateDistance]
            }) : 0
          }]
        }}
        onPress={() => {
          launchBrowser()
        }}
        >
        { getRizzleButtonIcon('launchBrowserIcon', borderColor, backgroundColor) }
      </RizzleButton>
      <RizzleButton
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        borderWidth={borderWidth}
        iconOff={getRizzleButtonIcon('showMercuryIconOff', borderColor, backgroundColor, isMercuryButtonEnabled)}
        iconOn={getRizzleButtonIcon('showMercuryIconOn', borderColor, backgroundColor, isMercuryButtonEnabled)}
        initialToggleState={isItemMercury}
        isToggle={true}
        style={{
          paddingLeft: 2,
          transform: [{
            translateY: isCurrent ? visibleAnim.interpolate({
              inputRange: [0, 0.667, 0.833, 1],
              outputRange: [0, 0, translateDistance * -0.2, translateDistance]
            }) : 0
          }]
        }}
        onPress={isMercuryButtonEnabled ? () => toggleMercury(item) : () => false}
      />
    </Animated.View>
  )
}

const screenDimensions = Dimensions.get('window')

const getStyles = () => {
  return {
    base: {
      position: 'absolute',
      bottom: 0,
      width: screenDimensions.width < 500 ?
        '100%' :
        500,
      zIndex: 10,
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
      paddingLeft: 20,
      paddingRight: 20
    },
    buttonSVG: {
      paddingLeft: 3
    },
    buttonText: {
      color: 'white',
      textAlign: 'center',
      backgroundColor: 'transparent',
      fontFamily: 'IBMPlexMono',
      fontSize: 16,
    },
    buttonView: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: 50,
      height: 50,
    },
    sansText: {
      fontFamily: 'IBMPlexSansCond-Bold',
    },
    smallText: {
      fontSize: 10
    }
  }
}