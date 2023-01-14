import { ItemType } from '../store/items/types'
import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import {
  Animated,
  Dimensions,
} from 'react-native'
import RizzleButton from './RizzleButton'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import { hslString } from '../utils/colors'
import { getMargin, hasNotchOrIsland } from '../utils'

// isDarkMode, displayMode, isOnboarding
let areButtonsVisible = true

export const translateDistance = 80

export default function ButtonSet ({
  displayMode,
  isCurrent,
  isDarkMode,
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
  const visibleRef = useRef(true)
  const selectItem = state => item ?
    (state.itemsUnread.items.find(i => i._id === item._id) ||
    state.itemsSaved.items.find(i => i._id === item._id)) :
    null
  const liveItem = useSelector(selectItem)

  const visibleAnim = new Animated.Value(visibleRef.current ? 0 : 1)
  const toggleAnimMercury = new Animated.Value(0)
  const toggleAnimSaved = new Animated.Value(0)

  item = liveItem

  let isItemSaved = item.isSaved
  let isItemMercury = item && 
    (item.showMercuryContent || item.isFeedMercury) &&
    item.content_mercury

  const strokeColor = isDarkMode ?
    'hsl(0, 0%, 70%)' :
    'black'
  const isMercuryButtonEnabled = item && item.hasLoadedMercuryStuff
  const saveStrokeColours = item && item.isSaved ?
    ['hsl(45, 60%, 51%)', 'hsl(210, 60%, 51%)', 'hsl(15, 60%, 51%)'] :
    [strokeColor, strokeColor, strokeColor]
  const saveFillColors = ['white', 'white', 'white']
  let activeColor = displayMode === ItemType.saved ?
      hslString('rizzleText', 'ui') :
    item ?
      hslString(item.feed_color, 'darkmodable') :
    null
  const borderColor = displayMode == ItemType.saved ?
    isDarkMode ? 'hsl(0, 0%, 80%)' : hslString('rizzleText') :
    activeColor
  const backgroundColor = displayMode == ItemType.saved ?
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

  const makeVisible = (imminentlyVisible) => {
    Animated.timing(
      visibleAnim,
      {
        toValue: imminentlyVisible ? 0 : 1,
        duration: 600,
        useNativeDriver: true
      }
    ).start(_ => {
      visibleRef.current = imminentlyVisible
    })
  }

  const startToggleAnimationMercury = () => {
    isItemMercury = !isItemMercury
    Animated.timing(toggleAnimMercury, {
      toValue: isItemMercury ? 1 : 0,
      delay: 250,
      duration: 500,
      useNativeDriver: false
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
        iconOff={getRizzleButtonIcon('toggleViewButtonsIcon', borderColor, backgroundColor, true, false)}
        iconOn={getRizzleButtonIcon('toggleViewButtonsIcon', borderColor, backgroundColor, true, false)}
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
        { getRizzleButtonIcon('showShareSheetIcon', borderColor, backgroundColor, true, false) }
      </RizzleButton>
      <RizzleButton
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        borderWidth={borderWidth}
        iconOff={getRizzleButtonIcon('saveButtonIconOff', borderColor, backgroundColor, true, false)}
        iconOn={getRizzleButtonIcon('saveButtonIconOn', borderColor, backgroundColor, true, false)}
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
        { getRizzleButtonIcon('launchBrowserIcon', borderColor, backgroundColor, true, false) }
      </RizzleButton>
      <RizzleButton
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        borderWidth={borderWidth}
        iconOff={getRizzleButtonIcon('showMercuryIconOff', borderColor, backgroundColor, isMercuryButtonEnabled, false)}
        iconOn={getRizzleButtonIcon('showMercuryIconOn', borderColor, backgroundColor, isMercuryButtonEnabled, false)}
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


const getStyles = () => {
  const screenDimensions = Dimensions.get('window')
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
      alignSelf: 'center',
      marginBottom: getMargin() / (hasNotchOrIsland() ? 1 : 2),
      paddingLeft: getMargin() / (screenDimensions.width < 321 ? 2 : 1),
      paddingRight: getMargin() / (screenDimensions.width < 321 ? 2 : 1)
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