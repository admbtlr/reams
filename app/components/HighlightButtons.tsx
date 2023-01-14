import React, { useEffect, useRef, useState } from 'react'
import {Animated, Dimensions, Linking, View} from 'react-native'
import { getMargin, hasNotchOrIsland } from '../utils'
import RizzleButton from './RizzleButton'
import TextButton from './TextButton'
import { HighlightModeContext } from './ItemsScreen'
import { useDispatch, useStore } from 'react-redux'
import { SHOW_ITEM_BUTTONS, SHOW_MODAL } from '../store/ui/types'
import { dustbinIcon, noteIcon, okIcon, xIcon } from '../utils/icons'
import { Annotation, DELETE_ANNOTATION, EDIT_ANNOTATION } from '../store/annotations/types'
// import { translateDistance } from './ButtonSet'


const screenWidth = Dimensions.get('window').width
const translateDistance = 80
const translateAnim = new Animated.Value(1)

export default function HighlightButtons() {
  const { activeHighlight, setActiveHighlight } = React.useContext(HighlightModeContext)
  const dispatch = useDispatch()
  const annotation = useStore().getState().annotations.annotations.find((a: Annotation) => a._id === activeHighlight)

  useEffect(() => {
    if (activeHighlight !== null) {
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 400,
        delay: 100,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(translateAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start()
    }
  }, [activeHighlight])

  const modalText = [
    {
      text: 'Add note',
      style: ['title']
    }
  ]
  const modalProps = {
    modalText,
    modalHideCancel: false,
    modalShow: true,
    inputs: [
      {
        // label: 'Name',
        name: 'note',
        type: 'textarea',
        value: annotation ? annotation.note : '',
      }
    ],
    modalOnOk: ({note}) => {
      dispatch({
        type: EDIT_ANNOTATION,
        annotation: {
          ...annotation,
          note
        }
      })
      setActiveHighlight(null)
      dispatch({ type: SHOW_ITEM_BUTTONS })
    },
    modalOnCancel: () => {
      setActiveHighlight(null)
      dispatch({ type: SHOW_ITEM_BUTTONS })
    }
  }


  return (
    <View 
      pointerEvents='box-none'
      style={{
        justifyContent: 'flex-end',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        marginBottom: getMargin() / (hasNotchOrIsland() ? 1 : 2)
      }}
    >
      <Animated.View 
        pointerEvents='box-none'
        style={{
          flex: 0,
          flexDirection: 'row',
          paddingHorizontal: getMargin() * .5,
        }}>
        <TextButton 
          buttonStyle={{ 
            margin: getMargin() * .5,
            transform: [{ translateY: translateAnim.interpolate({
              inputRange: [0, 0.25, 0.5, 0.75, 1],
              outputRange: [0, 0, 0, translateDistance * -0.2, translateDistance]
              // inputRange: [0, 0.333, 0.666, 1],
              // outputRange: [0, 0, 0, translateDistance]
             })}] 
          }}
          hasShadow={true}
          icon={dustbinIcon()}
          onPress={() => {
            dispatch({ 
              type: DELETE_ANNOTATION,
              annotation
            })
            setActiveHighlight(null)
            dispatch({ type: SHOW_ITEM_BUTTONS })
          }}
          text='Delete' />
        <TextButton 
          buttonStyle={{ 
            margin: getMargin() * .5,
            transform: [{ translateY: translateAnim.interpolate({
              inputRange: [0, 0.25, 0.5, 0.75, 1],
              outputRange: [0, 0, translateDistance * -0.2, translateDistance, translateDistance]
              // inputRange: [0, 0.333, 0.666, 1],
              // outputRange: [0, 0, translateDistance, translateDistance]
             })}] 
          }} 
          hasShadow={true}
          icon={noteIcon()}
          onPress={() => {
            dispatch({
              type: SHOW_MODAL,
              modalProps,           
            })
          }}
          text='Note' />
        <TextButton 
          buttonStyle={{ 
            margin: getMargin() * .5,
            transform: [{ translateY: translateAnim.interpolate({
              inputRange: [0, 0.25, 0.5, 0.75, 1],
              outputRange: [0, translateDistance * -0.2, translateDistance, translateDistance, translateDistance]
              // inputRange: [0, 0.333, 0.666, 1],
              // outputRange: [0, translateDistance, translateDistance, translateDistance]
            })}] 
          }} 
          hasShadow={true}
          icon={okIcon()}
          onPress={() => {
            setActiveHighlight(null)
            dispatch({ type: SHOW_ITEM_BUTTONS })
          }}
          text='OK' 
        />
      </Animated.View>
    </View>
  )
}