import React from 'react'
import {
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Modal from 'react-native-modalbox'
import ShareExtension from 'react-native-share-extension'
import { Sentry } from 'react-native-sentry'
import { RNSKBucket } from 'react-native-swiss-knife'

class Share extends React.Component {

  group = 'group.com.adam-butler.rizzle'

  constructor(props, context) {
    super(props, context)
    this.state = {
      isOpen: true,
      type: '',
      value: '',
      rssUrl: ''
    }
    Sentry
      .config('https://1dad862b663640649e6c46afed28a37f:08138824595d4469b62aaba4c01c71f4@sentry.io/195309')
      .install()
  }

  checkForRSSHeader (url) {
    let matches = url.match(/(http[s]*:\/\/.+?(\/|$))/)
    if (!matches || matches.length === 0) {
      return
    }
    let homeUrl = matches[1]
    console.log(`Checking ${homeUrl}`)

    return fetch(homeUrl)
      .then(res => res.text())
      .then(body => {
        // <link rel="alternate" href="https://www.theguardian.com/international/rss" title="RSS" type="application/rss+xml">
        matches = body.match(/(\<link[^>]*?rel="alternate".*?(rss|atom)\+xml.*\>)/)
        if (!matches || matches.length === 0) {
          console.log('No RSS here')
        } else {
          let linkTag = matches[1]
          console.log(linkTag)
          let rssUrl = linkTag && linkTag.match(/href="(.*?)"/)[1]
          console.log('MATCHING...')
          if (!rssUrl.startsWith('http')) {
            rssUrl = (homeUrl + rssUrl)
            rssUrl = rssUrl.replace(/([^:])\/\//, '$1/')
          }
          return rssUrl
        }
      })
      .catch((error) => {
        console.log(`Error fetching page: ${error.message}`)
        throw `Error fetching page: ${error.message}`
      })
  }

  async componentDidMount() {
    try {
      const { type, value } = await ShareExtension.data()
      this.setState({
        type,
        value,
        searchingForRss: true
      })
      const rssUrl = await this.checkForRSSHeader(value)
      let state = {
        ...this.state,
        searchingForRss: false
      }
      if (rssUrl) {
        state.rssUrl = rssUrl
      }
      this.setState(state)
    } catch(e) {
      console.log('errrr', e)
    }
  }

  onClose = () => ShareExtension.close()

  closing = () => this.setState({ isOpen: false })

  addFeed = () => {
    RNSKBucket.set('feed', this.state.rssUrl, this.group)
    this.closing()
  }

  savePage = () => {
    console.log(RNSKBucket)
    RNSKBucket.set('page', this.state.value, this.group)
    // this.closing()
  }

  render() {
    console.log('Rendering')
    console.log(`this.state.rssUrl is ${this.state.rssUrl}`)
    console.log(this.state)
    const textStyle = {
      color: '#f6be3c',
      fontFamily: 'IBMPlexMono',
      fontSize: 18,
      textAlign: 'center'
    }
    return (
      <Modal
        backdrop={false}
        style={{ backgroundColor: 'transparent' }}
        position="center"
        isOpen={this.state.isOpen}
        onClosed={this.onClose}
      >
        <View style={{ alignItems: 'center', justifyContent:'center', flex: 1 }}>
          <View style={{
            backgroundColor: '#51485f',
            width: 300,
            height: 300,
            padding: 14,
            borderRadius: 14
          }}>
            <TouchableOpacity onPress={this.closing}>
              <Text>Close</Text>
            </TouchableOpacity>
            { this.state.searchingForRss &&
              <Text
                style={{
                  ...textStyle,
                  color: 'white'
                }}>Looking for an RSS feed...</Text>
            }
            { (!this.state.searchingForRss && !this.state.rssUrl) &&
              <Text
                style={{
                  ...textStyle,
                  color: 'white'
                }}>No RSS feed found :(</Text>
            }
            { this.state.rssUrl &&
              <TouchableOpacity
                style={{
                  padding: 28,
                  paddingBottom: 0
                }}
                onPress={this.addFeed}>
                <Text style={textStyle}>Add this site to your Rizzle feed</Text>
                <View style={{
                  height: 1,
                  marginTop: 28,
                  backgroundColor: 'white'
                }}/>
              </TouchableOpacity>
            }
            <TouchableOpacity
              style={{ padding: 28 }}
              onPress={this.savePage}>
              <Text style={textStyle}>Save this page to read in Rizzle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
}

export default Share
