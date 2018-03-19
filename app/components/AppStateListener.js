import React from 'react'
import { Alert, AppState, Clipboard, Text, TouchableHighlight, View } from 'react-native'
import { RNSKBucket } from 'react-native-swiss-knife'
// import { RizzleModal } from './RizzleModal'

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
      // Alert.alert('AppState changed to ACTIVE from ' + this.props.appState)
      this.checkClipboard()
      this.checkPageBucket()
      this.checkFeedBucket()
      // see Rizzle component
      if (!global.isStarting) {
        this.props.fetchData()
      }
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
      this.props.showModal({
        modalText: `Save this page? ${contents}`,
        modalHideCancel: false,
        modalShow: true,
        modalOnOk: () => { this.props.saveURL(contents) }
      })
    }
  }

  checkPageBucket () {
    RNSKBucket.get('page', this.group).then(value => {
      if (value !== null) {
        RNSKBucket.set('page', null, this.group)
        console.log(`Got a page to save: ${value}`)
        this.props.saveURL(value)
          // then(() => {
          //   this.props.showRizzleModal({
          //     modalText: `Saved page: ${value}`,
          //     modalShowCancel: false,
          //     modalShow: true
          //   })
          // })
      }
    })
  }

  checkFeedBucket () {
    RNSKBucket.get('feed', this.group).then(value => {
      if (value !== null) {
        RNSKBucket.set('feed', null, this.group)
        console.log(`Got a feed to subscribe to: ${value}`)
        this.props.addFeed(value)
      }
    })
  }

  render () {
    return null
  }
}

export default AppStateListener
