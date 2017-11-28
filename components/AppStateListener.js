import React from 'react'
import { AppState, Clipboard, Modal, Text, TouchableHighlight, View } from 'react-native'


class AppStateListener extends React.Component {

  constructor (props) {
    super(props)
    this.props = props

    this.checkClipboardContents = this.checkClipboardContents.bind(this)
    AppState.addEventListener('change', this.handleAppStateChange)
  }

  handleAppStateChange = (nextAppState) => {
    if (this.props.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
      this.checkClipboard()
    }
  }

  checkClipboard () {
    Clipboard.getString().then(this.checkClipboardContents.bind(this))
  }

  checkClipboardContents (contents) {
    console.log(contents)
    console.log(contents.substring(0, 4))
    // TODO make this more robust
    if (contents.substring(0, 4) === 'http') {
      this.setState({
        url: contents,
        showModal: true
      })
    }
  }

  showModal (isShown) {
    this.setState({
      ...this.state,
      showModal: isShown
    })
  }

  render () {
    if (this.state && this.state.showModal) {
      return (
        <Modal
          animationType={"slide"}
          transparent={true}
          visible={this.state.showModal}
          >
         <View style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          <View style={{
            backgroundColor: 'white',
            padding: 30
          }}>
            <Text>Save this page?</Text>
            <Text>{this.state.url}</Text>

            <TouchableHighlight onPress={() => {
              this.showModal(false)
            }}>
              <Text>No</Text>
            </TouchableHighlight>
            <TouchableHighlight onPress={() => {
              this.props.saveURL(this.state.url)
              this.showModal(false)
            }}>
              <Text>Yes</Text>
            </TouchableHighlight>

          </View>
         </View>
        </Modal>
      )
    } else {
      return null
    }
  }
}

export default AppStateListener
