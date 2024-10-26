import React, { useEffect, useRef, useState } from 'react'
import {Animated, Dimensions, Linking, View} from 'react-native'
import { getMargin } from '../utils/dimensions'
import { hasNotchOrIsland } from '../utils/dimensions'
import TextButton from './TextButton'
import { ActiveHighlightContext } from './ItemsScreen'
import { useDispatch, useStore } from 'react-redux'
import { SHOW_ITEM_BUTTONS } from '../store/ui/types'
import { dustbinIcon, noteIcon, okIcon, xIcon } from '../utils/icons'
import { Annotation } from '../store/annotations/types'
import { useSelector } from 'react-redux'
import { createAnnotation, deleteAnnotation, selectAnnotations, updateAnnotation } from '../store/annotations/annotations'
import { useModal } from './ModalProvider'
import { RootState } from '../store/reducers'
import { id } from '../utils'
// import { translateDistance } from './ButtonSet'


const screenWidth = Dimensions.get('window').width
const translateDistance = 90
const translateAnim = new Animated.Value(1)

export interface ActiveHighlight {
  _id?: string | undefined
  text?: string
  serialized?: string
  url?: string | null
  item_id?: string | null
  note?: string | null
}

export default function HighlightButtons() {
  const { activeHighlight, setActiveHighlight } = React.useContext(ActiveHighlightContext)
  const dispatch = useDispatch()
  const activeAnnotation = useSelector((state: RootState) => state
    .annotations.annotations.find(a => activeHighlight?._id ? a._id === activeHighlight._id : undefined))
  const [ note, setNote ] = useState<string | undefined>()
  
  const screenDimensions = Dimensions.get('window')
  const { openModal } = useModal()

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
    showKeyboard: true,
    inputs: [
      {
        // label: 'Name',
        name: 'note',
        type: 'textarea',
        value: note ?? activeAnnotation?.note ?? '',
      }
    ],
    modalOnOk: ({note}: {note: string}) => setNote(note),
    modalOnCancel: () => {},
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
          width: screenDimensions.width < 500 ?
            '100%' :
            500,
          alignSelf: 'center',
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
          icon={ activeAnnotation ? dustbinIcon() : xIcon() }
          onPress={() => {
            if (activeAnnotation !== undefined) {
              dispatch(deleteAnnotation(activeAnnotation))
            }
            setActiveHighlight(null)
            dispatch({ type: SHOW_ITEM_BUTTONS })
        }}
          text={ activeAnnotation ? 'Delete' : 'Cancel' } />
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
            openModal(modalProps)
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
            if (activeAnnotation) {
              dispatch(updateAnnotation({
                ...activeAnnotation,
                note: note ?? activeAnnotation.note
            }))
            } else {
              dispatch(createAnnotation({
                _id: id(),
                ...activeHighlight,
                note

              }))
            }      
            setActiveHighlight(null)
            setNote(null)
            dispatch({ type: SHOW_ITEM_BUTTONS })
          }}
          text='Save' 
        />
      </Animated.View>
    </View>
  )
}