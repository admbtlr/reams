import React, { Fragment } from 'react'
import {
  Modal,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import {hslString} from '../utils/colors'

class RizzleModal extends React.Component {

  constructor (props) {
    super(props)
    this.props = props
    this.onOK = this.onOK.bind(this)
    this.onCancel = this.onCancel.bind(this)
    this.onClosed = this.onClosed.bind(this)

    this.state = {
      toggleHideModal: false
    }
  }

  onOK () {
    const { modalHide, modalProps } = this.props
    modalProps.modalOnOk && modalProps.modalOnOk()
    modalHide()
    this.isOpen = false
    modalProps.modalHideable && modalProps.modalName &&
      this.props.toggleHide(modalProps.modalName)
  }

  onCancel () {
    this.props.modalHide()
    this.isOpen = false
  }

  onClosed () {
    if (this.isOpen) {
      this.props.modalHide()
      this.isOpen = false
    }
  }

  formatText (text) {
    if (!text) return text
    if (typeof text === 'string') {
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

  render () {
    const { hiddenModals, isVisible, modalProps } = this.props
    if (hiddenModals && hiddenModals.indexOf(modalProps.modalName) !== -1) {
      return null
    }

    this.isOpen = isVisible
    return (
      <View 
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
        }}>
        <Modal
          animationType="slide"
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
              { modalProps.modalHideable &&
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
              }
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
        width: 300
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
        marginTop: 15
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
