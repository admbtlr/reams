import React, { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, Linking, View } from 'react-native'
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
  _id: string
  text?: string
  serialized?: string
  url?: string | null
  item_id?: string | null
  note?: string | null
}

export default function HighlightButtons() {
  const { activeHighlightId, setActiveHighlightId, activeHighlight } = React.useContext(ActiveHighlightContext)
  const dispatch = useDispatch()
  const [note, setNote] = useState<string | undefined>(undefined)

  const screenDimensions = Dimensions.get('window')
  const { openModal } = useModal()

  useEffect(() => {
    if (activeHighlightId !== null) {
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
  }, [activeHighlightId])

  const updateNote = (note: string) => {
    if (activeHighlight) {
      if ('text' in activeHighlight && 'serialized' in activeHighlight) {
        // Update existing annotation
        dispatch(updateAnnotation({
          ...activeHighlight,
          note: note ?? activeHighlight.note
        } as Annotation) as any)
      } else if (activeHighlightId) {
        // We should not reach here normally as we should have the full annotation
        console.warn('Updating annotation with incomplete data')
        dispatch(updateAnnotation({
          _id: activeHighlightId,
          text: '',
          serialized: '',
          note
        } as Annotation) as any)
      }
    } else {
      // This should not happen in normal flow
      console.warn('No active highlight to save')
    }
  }

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
        value: note ?? activeHighlight?.note ?? '',
      }
    ],
    modalOnOk: ({ note }: { note: string }) => {
      updateNote(note)
      setActiveHighlightId(null)
      setNote(undefined)
      dispatch({ type: SHOW_ITEM_BUTTONS })
    },
    modalOnCancel: () => { },
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
            transform: [{
              translateY: translateAnim.interpolate({
                inputRange: [0, 0.25, 0.5, 0.75, 1],
                outputRange: [0, 0, 0, translateDistance * -0.2, translateDistance]
                // inputRange: [0, 0.333, 0.666, 1],
                // outputRange: [0, 0, 0, translateDistance]
              })
            }]
          }}
          hasShadow={true}
          icon={dustbinIcon()}
          onPress={() => {
            if (activeHighlight !== null) {
              dispatch(deleteAnnotation(activeHighlight as Annotation) as any)
            }
            setActiveHighlightId(null)
            dispatch({ type: SHOW_ITEM_BUTTONS })
          }}
          text={'Delete'} />
        <TextButton
          buttonStyle={{
            margin: getMargin() * .5,
            transform: [{
              translateY: translateAnim.interpolate({
                inputRange: [0, 0.25, 0.5, 0.75, 1],
                outputRange: [0, 0, translateDistance * -0.2, translateDistance, translateDistance]
                // inputRange: [0, 0.333, 0.666, 1],
                // outputRange: [0, 0, translateDistance, translateDistance]
              })
            }]
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
            transform: [{
              translateY: translateAnim.interpolate({
                inputRange: [0, 0.25, 0.5, 0.75, 1],
                outputRange: [0, translateDistance * -0.2, translateDistance, translateDistance, translateDistance]
                // inputRange: [0, 0.333, 0.666, 1],
                // outputRange: [0, translateDistance, translateDistance, translateDistance]
              })
            }]
          }}
          hasShadow={true}
          icon={okIcon()}
          onPress={() => {
            setActiveHighlightId(null)
            setNote(undefined)
            dispatch({ type: SHOW_ITEM_BUTTONS })
          }}
          text='OK'
        />
      </Animated.View>
    </View>
  )
}
