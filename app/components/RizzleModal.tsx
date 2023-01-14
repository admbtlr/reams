import React, { Fragment, ReactElement } from 'react'
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
import { deepEqual, fontSizeMultiplier, getMargin } from '../utils'
import { xIcon } from '../utils/icons'
import FeedIconContainer from '../containers/FeedIcon'

namespace RizzleModal {
  export interface Input {
    label: string
    name: string
    type: string
    value: string
  }
  export interface DeletableRow {
    title: string
    id: string
    iconView?: ReactElement
    bgColor?: string
  }

  export interface ModalProps {
    modalHide: () => void
    modalProps: any
    toggleHide: (modalName: string) => void
    modalOnOk?: (state: any) => void
    modalOnCancel?: () => void
    modalOnClosed?: () => void
    modalOnDelete?: () => void
    modalHideable?: boolean
    modalName?: string
    deletableRows?: RizzleModal.DeletableRow[]
    inputs?: RizzleModal.Input[]
    deleteButton?: boolean
    deleteButtonText?: string
    showKeyboard?: boolean
  }
}

interface RizzleModalProps {
  modalProps: RizzleModal.ModalProps
}

interface RizzleModalState {
  toggleHideModal: boolean
  isDeletePending: boolean
  backgroundColor: ColorValue
  inputState: {
    deletableRows: any[]
  }
}

class RizzleModal extends React.Component<RizzleModalProps, RizzleModalState> {

  props: any
  state: any
  initialState: RizzleModalState
  isOpen?: boolean

  constructor (props: any) {
    super(props)
    this.props = props
    this.onOK = this.onOK.bind(this)
    this.onCancel = this.onCancel.bind(this)
    this.onClosed = this.onClosed.bind(this)

    this.initialState = {
      toggleHideModal: false,
      isDeletePending: false,
      backgroundColor: 'rgba(0, 0, 0, 0)',
      inputState: {
        deletableRows: []
      }
    }
    this.state = this.initialState
  }

  onOK () {
    const { modalHide, modalProps } = this.props
    const { isDeletePending, inputState: {deletableRows} } = this.state
    if (isDeletePending) {
      modalProps.modalOnDelete()
    } else {
      modalProps.modalOnOk && modalProps.modalOnOk(this.state.inputState)
    }
    modalHide()
    this.isOpen = false
    modalProps.modalHideable && modalProps.modalName &&
      this.props.toggleHide(modalProps.modalName)
    this.setState(this.initialState)    
  }

  onCancel () {
    const { modalHide, modalProps } = this.props
    modalHide()
    modalProps.modalOnCancel && modalProps.modalOnCancel()
    this.isOpen = false
    this.setState(this.initialState)    
  }

  onClosed () {
    if (this.isOpen) {
      this.props.modalHide()
      this.isOpen = false
    }
  }

  formatText (text: string | { 
      style: [] 
      text: string 
    }[]) {
    if (typeof text === 'undefined') return text
    if (typeof text === 'string') {
      const styles = this.getStyles().text
      return (<Text>{text}</Text>)
    } else {
      return text.map((el, i) => {
        let style = el.style ? el.style.reduce((accum, tag) => {
          return {
            ...accum,
            ...this.getStyles()[tag]
          }
        }, this.getStyles().text) : null
        return (<Text style={style} key={i}>{el.text}</Text>)
      })
    }
  }

  onDeleteRow (row) {
    const { deletableRows } = this.state.inputState
    const index = deletableRows.indexOf(row)
    if (index !== -1) {
      deletableRows.splice(index, 1)
      LayoutAnimation.configureNext({ 
        duration: 500, 
        create: { type: 'linear', property: 'opacity' }, 
        update: { type: 'spring', springDamping: 0.4 }, 
        delete: { duration: 100, type: 'linear', property: 'opacity' } 
      })
      this.setState({inputState: {deletableRows}})
    }
  }

  onDelete () {
    LayoutAnimation.configureNext({ 
      duration: 500, 
      create: { type: 'linear', property: 'opacity' }, 
      update: { type: 'spring', springDamping: 0.4 }, 
      delete: { duration: 100, type: 'linear', property: 'opacity' } 
    })
    this.setState({
      isDeletePending: true
    })
  }

  componentDidUpdate (prevProps: any) {
    let {deletableRows} = this.props.modalProps
    deletableRows = deletableRows || []
    if (deletableRows && !deepEqual(deletableRows, this.state.inputState.deletableRows)) {
      this.setState({ inputState: {deletableRows}})
    }
  }

  render () {
    const { hiddenModals, inputText, isInput, isVisible, modalProps } = this.props
    const { deletableRows } = this.state.inputState
    if (hiddenModals && modalProps?.modalName && hiddenModals.indexOf(modalProps.modalName) !== -1) {
      return null
    }

    const inputView = (
      modalProps.inputs && modalProps.inputs.length > 0 && 
        modalProps.inputs.map((input: RizzleModal.Input, index: number) => {
          let inputState = {}
          inputState[input.name] = ''
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
                  inputState[input.name] = text
                  this.setState({
                    inputState: {
                      ...this.state.inputState,
                      ...inputState
                    }})
                }}
                value={this.state.inputState[input.name] || input.value}
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
      deletableRows && deletableRows.length > 0 &&
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
          { this.state.inputState.deletableRows.map((row: RizzleModal.DeletableRow, index: number, rows: RizzleModal.DeletableRow[]) => {
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
                    <FeedIconContainer
                      id={row.id}
                      dimensions={{width: 16, height: 16}}
                      isSmall={true}
                    />
                  </View>
                  <Text 
                    ellipsizeMode='tail'
                    numberOfLines={1}
                    style={{
                      ...this.getStyles().text,
                      color: 'white',
                      fontFamily: 'IBM Plex Sans',
                    }}>{row.title}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    this.onDeleteRow(row)
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
      modalProps.deleteButton &&
        <TouchableOpacity
          onPress={() => {
            this.onDelete()
          }}
          style={{ 
            paddingBottom: 20, 
          }}
        >
          <Text style={{
            ...this.getStyles().text,
            textDecorationStyle: 'solid',
            textDecorationLine: 'underline',
            color: hslString('logo2'),
            textDecorationColor: hslString('logo2'),
            margin: 5
          }}>{modalProps.deleteButtonText}</Text>
        </TouchableOpacity>
      )
    const hideModalView = (
      modalProps.modalHideable &&
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
              this.setState({
                toggleHideModal: value
              })
            }}
            value={this.state.toggleHideModal}
            style={{
              marginRight: 10,
              marginTop: -4.9,
              marginBottom: 20
            }}/>
          { this.formatText([{
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
          backgroundColor: isVisible ? 'rgba(0,0,0,0.7)' : 'transparent',
        }}>
        <Modal
          animationType="slide"
          avoidKeyboard={true}
          style={{ backgroundColor: 'transparent' }}
          visible={isVisible}
          onDismiss={this.onClosed}
          transparent={true}
          >
          <View style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",              
            pointerEvents: 'box-none'
          }}>
            <View style={{
              ...this.getStyles().inner
            }}>
              <View style={{
                ...this.getStyles().textHolder
                }}>{this.formatText(modalProps.modalText)}</View>
              { this.state.isDeletePending ? (
                <Text style={{
                  ...this.getStyles().text,
                  marginHorizontal: 20,
                  marginBottom: 20,
                  alignSelf: 'flex-start'
                }}>Are you sure you want to delete this category?</Text>
              ) : (
                <>
                  <View>{ inputView }</View>
                  <View>{ deletableRowsView }</View>
                  <View>{ deleteButtonView }</View>
                  <View>{ hideModalView }</View>
                </>
              )}
              <View style={{...this.getStyles().buttonHolder}}>
                { modalProps.modalHideCancel ||
                  <TouchableOpacity
                    style={{
                      ...this.getStyles().touchable,
                      borderRightWidth: 1
                    }}
                    onPress={this.onCancel}>
                    <Text
                      style={{
                        ...this.getStyles().text,
                        ...this.getStyles().buttonText
                      }}>Cancel</Text>
                  </TouchableOpacity>
                }
                <TouchableOpacity
                  style={{...this.getStyles().touchable}}
                  onPress={this.onOK}>
                  <Text
                    style={{
                      ...this.getStyles().text,
                      ...this.getStyles().buttonText,
                      ...this.getStyles().strong
                    }}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    )
  }

  getStyles () {
    return {
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
    }
  }
}

const styles = StyleSheet.create({
})

export default RizzleModal
