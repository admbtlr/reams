import React from 'react'
import {
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Modal from 'react-native-modalbox'
import ShareExtension from 'react-native-share-extension'
import AnimatedEllipsis from 'react-native-animated-ellipsis'
import { Sentry } from 'react-native-sentry'
// import { RNSKBucket } from 'react-native-swiss-knife'
import SharedGroupPreferences from 'react-native-shared-group-preferences'

import {hslString} from '../utils/colors'


class Share extends React.Component {

  group = 'group.com.adam-butler.rizzle'

  constructor(props, context) {
    super(props, context)
    console.log('Constructor!')
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

 checkForRSSHeader (body) {
  matches = body.match(/(\<link[^>]*?rel="alternate".*?(rss|atom)\+xml.*\>)/)
  return (matches && matches.length > 0) ?
    matches[1] :
    null
}

 checkForLinkToRssFile (body) {
  console.log('Full body length: ' + body.length)
  console.log('Now checking for links to rss files')
  body = body.replace(/<script[^]*?<\/script>/mg, '')
  // console.log(body)
  console.log('Scriptless body length: ' + body.length)
  // look for links to rss files
  matches = body.match(/<a.*?href.*?\.(rss|atom).*?>/)
  return (matches && matches.length > 0) ?
    matches[1] :
    null
}

 checkForLinkWithRssInText (body) {
  console.log('Checking for link with RSS in text')
  body = body.replace(/<script[^]*?<\/script>/mg, '')
  matches = body.match(/href[^>]*?>(rss|atom)/i)
  console.log(matches[0])
  return (matches && matches.length > 0) ?
    matches[0] :
    null
}

async searchForRSS (url) {
    let matches = url.match(/(http[s]*:\/\/.+?(\/|$))/)
    if (!matches || matches.length === 0) {
      return
    }
    let homeUrl = matches[1]
    console.log(`Checking ${homeUrl}`)

    try {
      const res = await fetch(homeUrl)
      const body = await res.text()

      let linkTag = this.checkForRSSHeader(body)
      if (linkTag) return this.parseLinkTag(linkTag, homeUrl)

      linkTag = this.checkForLinkToRssFile(body)
      if (linkTag) return this.parseLinkTag(linkTag, homeUrl)

      linkTag = this.checkForLinkWithRssInText(body)
      if (linkTag) return this.parseLinkTag(linkTag, homeUrl)

      return null
    } catch (error) {
      console.log(`Error fetching page: ${error.message}`)
      throw `Error fetching page: ${error.message}`
    }
  }

  parseLinkTag (linkTag, homeUrl) {
    let rssUrl = linkTag && linkTag.match(/href="(.*?)"/)[1]
    console.log('MATCHING...')
    if (!rssUrl.startsWith('http')) {
      rssUrl = (homeUrl + rssUrl)
      rssUrl = rssUrl.replace(/([^:])\/\//, '$1/')
    }
    console.log(`Found an RSS feed: ${rssUrl}`)
    return rssUrl
  }

  async componentDidMount() {
    try {
      const { type, value } = await ShareExtension.data()
      this.setState({
        isOpen: true,
        type,
        value,
        searchingForRss: true
      })
      const rssUrl = await this.searchForRSS(value)
      let state = {
        ...this.state,
        searchingForRss: false
      }
      console.log(`Value of rssUrl is ${rssUrl}`)
      if (rssUrl) {
        state.rssUrl = rssUrl
      }
      this.setState(state)
    } catch(e) {
      console.log('errrr', e)
    }
  }

  componentDidUpdate () {
    console.log('COMPONENT DID UPDATE!')
  }

  onClose = () => {
    ShareExtension.close()
    // https://github.com/alinz/react-native-share-extension/issues/64
    crashMe()
  }

  closing = () => this.setState({ isOpen: false })

  async addFeed () {
    await SharedGroupPreferences.setItem('feed', this.state.rssUrl, this.group)
    this.closing()
  }

  async savePage () {
    console.log(SharedGroupPreferences)
    await SharedGroupPreferences.setItem('page', this.state.value, this.group)
    this.closing()
  }

  render() {
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
            backgroundColor: hslString('rizzleBG'),
            width: 300,
            height: 250,
            padding: 14,
            borderRadius: 14
          }}>
            <View style={{
              flex: 1,
              justifyContent: 'center'
            }}>
              { this.state.searchingForRss &&
                <Text
                  style={{
                    ...textStyle,
                    color: 'white',
                    paddingLeft: 20,
                    paddingRight: 20
                  }}>Looking for an available feed<AnimatedEllipsis style={{
                  color: 'white',
                  fontSize: 16,
                  letterSpacing: -5
                }}/></Text>
              }
              { (!this.state.searchingForRss && !this.state.rssUrl) &&
                <Text
                  style={{
                    ...textStyle,
                    color: 'white'
                  }}>No feed found :(</Text>
              }
              { this.state.rssUrl &&
                <TouchableOpacity
                  style={{
                    padding: 28,
                    // paddingBottom: 0
                  }}
                  onPress={this.addFeed}>
                  <Text style={textStyle}>Add this site to your Rizzle feed</Text>
                </TouchableOpacity>
              }
            </View>
            <View style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 10,
              paddingRight: 10
            }}>
              <View style={{
                height: 1,
                width: 70,
                backgroundColor: 'white'
              }}/>
              <Image
                source={require('../assets/images/logo.png')}
                style={{
                  width: 60,
                  height: 60
                }}/>
              <View style={{
                height: 1,
                width: 70,
                backgroundColor: 'white'
              }}/>
            </View>
            <View style={{
              flex: 1,
              justifyContent: 'center'
            }}>
              <TouchableOpacity
                style={{ padding: 28 }}
                onPress={this.savePage}>
                <Text style={textStyle}>Save this page to read in Rizzle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

export default Share
