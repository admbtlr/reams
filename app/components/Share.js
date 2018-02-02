import React from 'react'
import {
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Modal from 'react-native-modalbox'
import ShareExtension from 'react-native-share-extension'

class Share extends React.Component {

  constructor(props, context) {
    super(props, context)
    this.state = {
      isOpen: true,
      type: '',
      value: '',
      rssURL: ''
    }
  }

  checkForRSSHeader (url) {
    const that = this
    const req = new XMLHttpRequest();
    const home = url.match(/(http[s]+:\/\/.*?\/)/)[1]
    req.open('GET', home);

    req.onload = function() {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200) {
        // <link rel="alternate" href="https://www.theguardian.com/international/rss" title="RSS" type="application/rss+xml">
        const match = req.response.match(/(\<link rel="alternate".*?rss\+xml.*\>)/)[1]
        const url = match && match.match(/href="(.*?)"/)[1]
        console.log('MATCHING...')
        console.log(url)
        if (url) {
          that.setState({
            ...that.state,
            rssURL: url
          })
        }
      }
      else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };

    // Make the request
    req.send();
  }

  async componentDidMount() {
    try {
      const { type, value } = await ShareExtension.data()
      this.checkForRSSHeader(value)
      this.setState({
        type,
        value
      })
    } catch(e) {
      console.log('errrr', e)
    }
  }

  onClose = () => ShareExtension.close()

  closing = () => this.setState({ isOpen: false });

  render() {
    return (
      <Modal
        backdrop={false}
        style={{ backgroundColor: 'transparent' }}
        position="center"
        isOpen={this.state.isOpen}
        onClosed={this.onClose}
      >
        <View style={{ alignItems: 'center', justifyContent:'center', flex: 1 }}>
          <View style={{ borderColor: 'green', borderWidth: 1, backgroundColor: 'white', height: 200, width: 300 }}>
            <TouchableOpacity onPress={this.closing}>
              <Text>Close</Text>
              <Text>type: { this.state.type }</Text>
              <Text>value: { this.state.value }</Text>
              <Text>RSS: { this.state.rssURL }</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
}

export default Share
