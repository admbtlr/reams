import React from 'react'
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native'
import Modal from 'react-native-modalbox'

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

  render () {
    return (
      <Modal
        backdrop={false}
        style={{ backgroundColor: 'transparent' }}
        position="center"
        isOpen={this.props.isVisible}
        >
       <View style={{...this.getStyles().base}}>
        <View style={{...this.getStyles().inner}}>
          <Text style={{...this.getStyles().text}}>{this.props.modalProps.modalText}</Text>

          <View style={{...this.getStyles().buttonHolder}}>
            { this.props.modalProps.modalHideCancel ||
              <TouchableHighlight
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
              </TouchableHighlight>
            }
            <TouchableHighlight
              style={{...this.getStyles().touchable}}
              onPress={this.onOK}>
              <Text
                style={{
                  ...this.getStyles().text,
                  ...this.getStyles().buttonText
                }}>OK</Text>
            </TouchableHighlight>
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
        backgroundColor: '#51485f',
        borderRadius: 20,
        width: '80%'
      },
      buttonHolder: {
        flexDirection: 'row',
        height: 40,
        borderTopWidth: 1,
        borderColor: 'rgba(0,0,0,0.3)'
      },
      text: {
        color: 'white',
        fontFamily: 'IBMPlexMono',
        fontSize: 16,
        margin: 20,
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
