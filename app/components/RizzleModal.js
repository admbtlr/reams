import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Modal from 'react-native-modalbox'
import {hslString} from '../utils/colors'

class RizzleModal extends React.Component {

  constructor (props) {
    super(props)
    this.props = props
    this.onOK = this.onOK.bind(this)
    this.onCancel = this.onCancel.bind(this)
  }

  onOK () {
    this.props.modalProps.modalOnOk()
    this.props.modalHide()
  }

  onCancel () {
    this.props.modalHide()
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
    return (
      <Modal
        backdrop={true}
        style={{ backgroundColor: 'transparent' }}
        position="center"
        isOpen={this.props.isVisible}
        >
       <View style={{...this.getStyles().base}}>
        <View style={{...this.getStyles().inner}}>
          <View style={{...this.getStyles().textHolder}}>{this.formatText(this.props.modalProps.modalText)}</View>
          <View style={{...this.getStyles().buttonHolder}}>
            { this.props.modalProps.modalHideCancel ||
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
        width: '80%'
      },
      buttonHolder: {
        flexDirection: 'row',
        height: 40,
        borderTopWidth: 1,
        borderColor: 'rgba(0,0,0,0.3)'
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
        fontSize: 15
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
