import React, { Fragment, ReactElement, useEffect, useState } from 'react'
import {
  ColorValue,
  Dimensions,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import Modal from "react-native-modal"
import { textInputStyle, textLabelStyle } from '../utils/styles'
import {hslString} from '../utils/colors'
import { deepEqual } from '../utils'
import { getMargin } from '../utils/dimensions'
import { fontSizeMultiplier } from '../utils/dimensions'
import { xIcon } from '../utils/icons'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { RootState } from '../store/reducers'
import { useModal } from './ModalProvider'
import AnimatedEllipsis from './AnimatedEllipsis'
import FeedIcon from './FeedIcon'

namespace RizzleModal {
  export interface Input {
    label?: string
    name: string
    type: string
    value?: string
  }
  export interface DeletableRow {
    title?: string
    id?: string
    iconView?: ReactElement
    bgColor?: string
  }

  export interface ModalProps {
    modalProps?: any // is this necessary?
    modalOnOk?: (state: any) => void
    modalOnCancel?: () => void
    modalOnClosed?: () => void
    modalOnDelete?: () => void
    modalHideCancel?: boolean
    modalHideable?: boolean
    modalName?: string
    modalText?: string | {
      text: string,
      style: string[]
    }[]
    deletableRows?: RizzleModal.DeletableRow[]
    inputs?: RizzleModal.Input[]
    deleteButton?: boolean
    deleteButtonText?: string
    showKeyboard?: boolean
    hideButtonsOnOk?: boolean
    hiddenButtonsText?: string
  }
}

const RizzleModal  = () => {
  const dispatch = useDispatch()

  const { isVisible, closeModal, modalProps } = useModal()
  
  const hiddenModals: string[] = useSelector((state: RootState) => state.ui.hiddenModals)

  // props: any
  // state: any
  // initialState: RizzleModalState
  let isOpen: boolean | undefined = false

  // const [toggleHideModal, setToggleHideModal] = useState(false)
  const [isDeletePending, setIsDeletePending] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState('rgba(0, 0, 0, 0)')
  const [inputState, setInputState] = useState<{
    deletableRows: RizzleModal.DeletableRow[]
  }>({
    deletableRows: []
  })
  const [isHideButtons, setIsHideButtons] = useState(false)

  //   this.initialState = {
  //     toggleHideModal: false,
  //     isDeletePending: false,
  //     backgroundColor: 'rgba(0, 0, 0, 0)',
  //     inputState: {
  //       deletableRows: []
  //     }
  //   }
  //   this.state = this.initialState
  // }

  const resetState = () => {
    // setToggleHideModal(false)
    setIsDeletePending(false)
    setBackgroundColor('rgba(0, 0, 0, 0)')
    setInputState({
      deletableRows: []
    })
    setIsHideButtons(false)
  }

  const onOK = async () => {
    let shouldClose: boolean | undefined | void = true
    if (modalProps?.hideButtonsOnOk) {
      setIsHideButtons(true)
    }
    if (isDeletePending) {
      modalProps?.modalOnDelete && modalProps.modalOnDelete()
    } else {
      shouldClose = modalProps?.modalOnOk && await modalProps.modalOnOk(inputState)
    }
    if (typeof shouldClose !== 'boolean' || shouldClose) {
      closeModal()
      isOpen = false
      // modalProps.hideModalable && modalProps.modalName &&
      //   toggleHide(modalProps.modalName)
      resetState()
    }
  }

  const onCancel = () => {
    closeModal()
    modalProps?.modalOnCancel && modalProps.modalOnCancel()
    isOpen = false
    resetState()
  }

  const onClosed = () => {
    if (isOpen) {
      closeModal()
      isOpen = false
      setIsHideButtons(false)
    }
  }

  const formatText = (text: string | { 
      style: string[] 
      text: string 
    }[]) => {
    if (typeof text === 'undefined') return text
    if (typeof text === 'string') {
      return (<Text>{text}</Text>)
    } else {
      return text.map((el, i) => {
        let style = el.style ? el.style.reduce((accum, tag) => {
          return {
            ...accum,
            ...styles[tag]
          }
        }, styles.text) : null
        return (<Text style={style} key={i}>{el.text}</Text>)
      })
    }
  }

  const onDeleteRow = (row: RizzleModal.DeletableRow) => {
    const deletableRows = inputState?.deletableRows || [] 
    const index = deletableRows.indexOf(row)
    if (index !== -1) {
      deletableRows.splice(index, 1)
      LayoutAnimation.configureNext({ 
        duration: 500, 
        create: { type: 'linear', property: 'opacity' }, 
        update: { type: 'spring', springDamping: 0.4 }, 
        delete: { duration: 100, type: 'linear', property: 'opacity' } 
      })
      setInputState({deletableRows})
    }
  }

  const onDelete = () => {
    LayoutAnimation.configureNext({ 
      duration: 500, 
      create: { type: 'linear', property: 'opacity' }, 
      update: { type: 'spring', springDamping: 0.4 }, 
      delete: { duration: 100, type: 'linear', property: 'opacity' } 
    })
    setIsDeletePending(true)
  }

  useEffect(() => {
    let deletableRows = modalProps?.deletableRows || []
    if (deletableRows && !deepEqual(deletableRows, inputState.deletableRows)) {
      setInputState({deletableRows})
    }
  }, modalProps?.deletableRows)

  if (hiddenModals && modalProps?.modalName && hiddenModals.indexOf(modalProps.modalName) !== -1) {
    return null
  }

  const inputView = (
    modalProps?.inputs && modalProps.inputs.length > 0 && 
      modalProps.inputs.map((input: RizzleModal.Input, index: number) => {
        let currentInputState = {}
        currentInputState[input.name] = ''
        return (
          <View 
            key={index}
            style={{
              padding: 20,
              paddingTop: 0
            }}
          >
            <TextInput
              autoCapitalize='none'
              autoFocus={!!modalProps.showKeyboard}
              multiline={input.type === 'textarea'}
              numberOfLines={input.type === 'textarea' ? 4 : 1}
              onChangeText={(text) => {
                currentInputState[input.name] = text
                setInputState({
                  ...inputState,
                  ...currentInputState
                })
              }}
              value={inputState[input.name] || input.value}
              style={{
                ...textInputStyle(),
                borderBottomWidth: input.type === 'textarea' ? 0 : 1,
                padding: 3,
                height: input.type === 'textarea' ? 100 : 'auto',
                textAlignVertical: input.type === 'textarea' ? 'top' : 'center',
                backgroundColor: input.type === 'textarea' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                fontSize: input.type === 'textarea' ? 16 * fontSizeMultiplier() : 20 * fontSizeMultiplier()
              }}
            />
            { input.label && (
              <Text style={{
                ...textLabelStyle()
              }}>{ input.label }</Text>
            )}
          </View>
        )}
      )
    )
    const deletableRowsView = (
      modalProps?.deletableRows && modalProps.deletableRows.length > 0 &&
        <View style={{
          alignItems: 'stretch',
          paddingBottom: 20,
          maxHeight: Dimensions.get('window').height / 3
        }}>
          <Text style={{
            ...textLabelStyle(),
            marginHorizontal: 20,
            marginBottom: 5,
            alignSelf: 'flex-start'
          }}>FEEDS</Text>
            <ScrollView>
          { inputState.deletableRows.map((row: RizzleModal.DeletableRow, index: number, rows: RizzleModal.DeletableRow[]) => {
            return (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  flexGrow: 1,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 10,
                  borderColor: hslString('rizzleText', '', 0.1),
                  borderTopWidth: 1,
                  borderBottomWidth: index === rows.length - 1 ? 1 : 0,
                  backgroundColor: row.bgColor || hslString('rizzleText'),
                }}>
                <View style={{ 
                  alignItems: 'flex-start',
                  flexDirection: 'row',
                  flex: 1, 
                }}>
                  <View style={{ width: 30 }}>
                    <FeedIcon
                      feedId={row.id}
                      isSmall={true}
                    />
                  </View>
                  <Text 
                    ellipsizeMode='tail'
                    numberOfLines={1}
                    style={{
                      ...styles.text,
                      color: 'white',
                      fontFamily: 'IBM Plex Sans',
                    }}>{row.title}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    onDeleteRow(row)
                  }}
                  style={{
                    flex: 0,
                    padding: 10,
                    paddingTop: 20,
                    paddingRight: 0,
                    width: 10 + 32 * fontSizeMultiplier()
                  }}>
                  {xIcon('white')}
                </TouchableOpacity>
              </View>
            )
          })}
          </ScrollView>
        </View>
      )
    const deleteButtonView = (
      modalProps?.deleteButton &&
        <TouchableOpacity
          onPress={() => {
            onDelete()
          }}
          style={{ 
            paddingBottom: 20, 
          }}
        >
          <Text style={{
            ...styles.text,
            textDecorationStyle: 'solid',
            textDecorationLine: 'underline',
            color: hslString('logo2'),
            textDecorationColor: hslString('logo2'),
            margin: 5
          }}>{modalProps.deleteButtonText}</Text>
        </TouchableOpacity>
      )
    const hideModalView = (
      modalProps?.modalHideable &&
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center'
        }}>
          <Switch
            trackColor={{
              false: hslString('rizzleText', '', 0.3),
              true: hslString('rizzleText')
            }}
            onValueChange={ value => {
              setToggleHideModal(value)
            }}
            value={toggleHideModal}
            style={{
              marginRight: 10,
              marginTop: -4.9,
              marginBottom: 20
            }}/>
          { formatText([{
            text: 'Don’t show this again',
            style: ['em', 'smaller']
          }]) }
        </View>
      )

    return (
      <View 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        pointerEvents='none'
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          // backgroundColor: isVisible ? 'rgba(0,0,0,0.7)' : 'transparent',
        }}>
        <Modal
          animationIn='slideInUp'
          animationOut='slideOutDown'
          avoidKeyboard={true}
          hasBackdrop={true}
          backdropColor='rgba(0,0,0,0.7)'
          style={{ backgroundColor: 'transparent' }}
          isVisible={isVisible}
          onDismiss={onClosed}
          useNativeDriver={true}
          useNativeDriverForBackdrop={true}
        >
          <View 
            pointerEvents='box-none'
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",              
            }}
          >
            <View style={{
              ...styles.inner
            }}>
              <View style={{
                ...styles.textHolder
                }}>{formatText(modalProps?.modalText || '')}</View>
              { isDeletePending ? (
                <Text style={{
                  ...styles.text,
                  marginHorizontal: 20,
                  marginBottom: 20,
                  alignSelf: 'flex-start'
                }}>Are you sure you want to delete this category?</Text>
              ) : (
                <>
                  <View>{ inputView }</View>
                  <View>{ deletableRowsView }</View>
                  <View>{ deleteButtonView }</View>
                  {/* <View>{ hideModalView }</View> */}
                </>
              )}
              { isHideButtons ? (
                  <View style={{
                    ...styles.buttonHolder,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    { modalProps?.hiddenButtonsText && (
                      <View style={{
                        flexDirection: 'row',
                      }}>
                        <Text
                          style={{
                            ...styles.text
                          }}>{modalProps?.hiddenButtonsText}</Text>
                        <AnimatedEllipsis style={{
                          marginTop: 3
                        }}/>
                      </View>
                    )}
                  </View>
                ) :
                (
                  <View style={{...styles.buttonHolder}}>
                    { modalProps?.modalHideCancel ||
                      <TouchableOpacity
                        style={{
                          ...styles.touchable,
                          borderRightWidth: 1
                        }}
                        onPress={onCancel}>
                        <Text
                          style={{
                            ...styles.text,
                            ...styles.buttonText
                          }}>Cancel</Text>
                      </TouchableOpacity>
                    }
                    <TouchableOpacity
                      style={{...styles.touchable}}
                      onPress={onOK}>
                      <Text
                        style={{
                          ...styles.text,
                          ...styles.buttonText,
                          ...styles.strong
                        }}>OK</Text>
                    </TouchableOpacity>
                  </View>
                )
              }
            </View>
          </View>
        </Modal>
      </View>
    )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  inner: {
    backgroundColor: hslString('rizzleBG'),
    borderRadius: 20,
    width: 300,
    shadowColor: 'black',
    shadowRadius: 10,
    shadowOpacity: 0.1
  },
  error: {
    backgroundColor: hslString('logo2'),
    color: hslString('rizzleBG')
  },
  buttonHolder: {
    flexDirection: 'row',
    height: 40,
    borderTopWidth: 1,
    borderColor: hslString('rizzleText', '', 0.2)
  },
  textHolder: {
    margin: 20,
    marginTop: 15,
    marginBottom: 40,
  },
  text: {
    color: hslString('rizzleText'),
    fontFamily: 'IBMPlexMono',
    fontSize: 16,
    textAlign: 'center'
  },
  title: {
    // color: hslString('rizzleHighlight'),
    marginBottom: 10,
    fontFamily: 'IBMPlexMono-Bold'
  },
  em: {
    fontFamily: 'IBMPlexMono-Italic'
  },
  strong: {
    fontFamily: 'IBMPlexMono-Bold'
  },
  strong_em: {
    fontFamily: 'IBMPlexMono-BoldItalic'
  },
  smaller: {
    fontSize: 14
  },
  hint: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: -20,
    marginLeft: -20,
    marginRight: -20,
    marginTop: 20,
    padding: 15,
    fontSize: 14,
    textAlign: 'left'
  },
  yellow: {
    color: hslString('rizzleHighlight')
  },
  touchable: {
    flex: 1,
    borderColor: 'rgba(0,0,0,0.3)'
  },
  buttonText: {
    margin: 5,
    marginTop: 7,
    textAlign: 'center'
  }
})

export default RizzleModal
