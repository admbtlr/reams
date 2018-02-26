import React from 'react'
import { AppState, Clipboard, Text, TouchableHighlight, View } from 'react-native'
import Modal from 'react-native-modalbox'
import { RNSKBucket } from 'react-native-swiss-knife'

class AppStateListener extends React.Component {

  group = 'group.com.adam-butler.rizzle'

  constructor (props) {
    super(props)
    this.props = props

    this.checkClipboardContents = this.checkClipboardContents.bind(this)
    AppState.addEventListener('change', this.handleAppStateChange)
  }

  handleAppStateChange = (nextAppState) => {
    if (this.props.appState.match(/inactive|background/) && nextAppState === 'active') {
      this.checkClipboard()
      this.checkPageBucket()
      this.checkFeedBucket()
      this.props.fetchData()
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

  checkPageBucket () {
    RNSKBucket.get('page', this.group).then(value => {
      RNSKBucket.set('page', null, this.group)
      console.log(`Got a page to save: ${value}`)
    })
  }

  checkFeedBucket () {
    RNSKBucket.get('feed', this.group).then(value => {
      RNSKBucket.set('feed', null, this.group)
      console.log(`Got a feed to subscribe to: ${value}`)
    })
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
          backdrop={false}
          style={{ backgroundColor: 'transparent' }}
          position="center"
          isOpen={this.state.showModal}
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
