import React, { Fragment } from 'react'
import {
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Modal from 'react-native-modal'
import ShareExtension from 'react-native-share-extension'
import AnimatedEllipsis from 'react-native-animated-ellipsis'
import * as Sentry from '@sentry/react-native'
// import { RNSKBucket } from 'react-native-swiss-knife'
import SharedGroupPreferences from 'react-native-shared-group-preferences'

import TextButton from './TextButton'
import XButton from './XButton'
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
      rssUrls: [],
      searchingForRss: false,
      retrievingRss: false
    }
    Sentry.init({
      dsn: 'https://1dad862b663640649e6c46afed28a37f:08138824595d4469b62aaba4c01c71f4@sentry.io/195309'
    })

    this.addFeed = this.addFeed.bind(this)
    this.savePage = this.savePage.bind(this)
  }

 checkForRSSHeader (body) {
  // matches = body.match(/(\<link[^>]*?rel="alternate".*?(rss|atom)\+xml.*\>)/)
  matches = body.match(/<link[^>]*?rel="alternate"[^>]*?(rss|atom)\+xml.*?>/)
  return (matches && matches.length > 0) ?
    matches[0] :
    null
}

 checkForLinkToRssFile (body) {
  console.log('Full body length: ' + body.length)
  console.log('Now checking for links to rss files')
  body = body.replace(/<script[^]*?<\/script>/mg, '')
  // console.log(body)
  console.log('Scriptless body length: ' + body.length)
  // look for links to rss files
  const now = Date.now()
  matches = body.match(/<a.*?href.*?>/g)
  var regex = /<a.*?href.*?\.(rss|atom).*?>/
  matches = matches.filter(m => regex.test(m))
  console.log(`Searching for links to RSS files took ${(Date.now() - now)}ms`)
  return (matches && matches.length > 0) ?
    matches[1] :
    null
}

 checkForLinkWithRssInText (body) {
  console.log('Checking for link with RSS in text')
  body = body.replace(/<script[^]*?<\/script>/mg, '')
  const now = Date.now()
  matches = body.match(/href[^>]*?>(rss|atom)/i)
  console.log(`Searching for links with RSS in text took ${(Date.now() - now)}ms`)
  return (matches && matches.length > 0 && matches[0]) ?
    matches[0] :
    null
}

async checkKnownRssLocations (url) {
  // Wordpress: /feed and /<page>/feed
  // Tumblr: /rss
  let feeds = []
  let matches = url.match(/(http[s]*:\/\/.+?(\/|$))(.*?(\/|$))/)
  const host = matches[1]
  const subfolder = matches[3].length > 0 ?
    (matches[3].indexOf('/') === matches[3].length - 1 ?
      matches[3] :
      matches[3] + '/') :
    ''
  console.log('URL: ' + url)
  console.log('SUBFOLDER: ' + subfolder)

  let feedUrl, res, json

  feedUrl = host + 'feed'
  try {
    console.log(`Checking ${host}feed`)
    res = await fetch(host + 'feed')
    if (res.ok) {
      feeds.push(feedUrl)
    }
  } catch (error) {}

  try {
    console.log(`Checking ${host}${subfolder}feed`)
    feedUrl = host + subfolder + 'feed'
    res = await fetch(host + 'feed')
    if (res.ok) {
      feeds.push(feedUrl)
    }
  } catch (error) {}

  try {
    console.log(`Checking ${host}rss`)
    feedUrl = host + 'rss'
    res = await fetch(host + 'feed')
    if (res.ok) {
      feeds.push(feedUrl)
    }
  } catch (error) {}

  return feeds
}

async searchForRSS (url) {
    let feeds = []
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
      if (linkTag) {
        console.log('FOUND RSS URL IN HEADER: ' + linkTag)
        feeds.push(this.parseLinkTag(linkTag, homeUrl))
      }

      linkTag = this.checkForLinkToRssFile(body)
      if (linkTag) {
        console.log('FOUND RSS URL IN A LINK: ' + linkTag)
        feeds.push(this.parseLinkTag(linkTag, homeUrl))
      }

      linkTag = this.checkForLinkWithRssInText(body)
      if (linkTag) {
        console.log('FOUND RSS URL IN A LINK WITH RSS TEXT: ' + linkTag)
        feeds.push(this.parseLinkTag(linkTag, homeUrl))
      }

      feeds = feeds.concat(await this.checkKnownRssLocations(url))
        .filter((feed, index, self) => self.indexOf(feed) === index)

    } catch (error) {
      console.log(`Error fetching page: ${error.message}`)
    } finally {
      let fullFeeds = []
      console.log('Got feeds: ' + feeds)
      this.setState({
        searchingForRss: false,
        retrievingRss: true
      })
      for (feed of feeds) {
        try {
          const res = await fetch('https://api.rizzle.net/feed-title/?url=' + feed)
          const json = await res.json()
          if (json.title) {
            fullFeeds.push({
              title: json.title,
              description: json.description || 'No description',
              url: feed
            })
          }
        } catch (error) {
          console.log('ERROR GETTING FEEDS: ' + error)
        }
      }
      // console.log(fullFeeds)

      return fullFeeds
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
      const data = await ShareExtension.data()
      let { type, value } = data
      console.log(`Value: ${value}`)
      console.log(`Type: ${type}`)
      value = /(http[a-zA-Z0-9:\/\.\-_?&=]*)/.exec(value)[1]
      console.log(`Value after regex: ${value}`)
      this.setState({
        isOpen: true,
        type,
        value,
        searchingForRss: true
      })
      const rssUrls = await this.searchForRSS(value)
      console.log(rssUrls)
      let state = {
        ...this.state,
        searchingForRss: false,
        retrievingRss: false
      }
      if (rssUrls && rssUrls.length > 0) {
        state.rssUrls = rssUrls
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

  async addFeed (url) {
    // console.log(this.state.rssUrl)
    await SharedGroupPreferences.setItem('feed', url, this.group)
    this.closing()
  }

  async savePage () {
    console.log(SharedGroupPreferences)
    await SharedGroupPreferences.setItem('page', this.state.value, this.group)
    this.closing()
  }

  render() {
    const textStyle = {
      color: hslString('rizzleText'),
      fontFamily: 'IBMPlexMono',
      fontSize: 18,
      textAlign: 'center'
    }
    const {
      searchingForRss,
      retrievingRss,
      isOpen,
      rssUrls
    } = this.state
    console.log(this.state.rssUrls)
    return (
      <Modal
        coverScreen={true}
        hasBackdrop={false}
        style={{ backgroundColor: 'transparent' }}
        isVisible={isOpen}
        onModalHide={this.onClose}
        onSwipeComplete={() => this.setState({ isOpen: false })}
        swipeDirection="down"
        useNativeDriver={true}
        >
        <View style={{
          alignItems: 'center',
          justifyContent:'center',
          flex: 1
        }}>
          <View style={{
            backgroundColor: hslString('rizzleBG'),
            width: 350,
            height: 300,
            padding: 14,
            borderRadius: 14
          }}>
            <View style={{
              flex: 1,
              justifyContent: 'space-between'
            }}>
              <XButton
                onPress={() => {
                  this.setState({ isOpen: false })
                  console.log('Closing')
                }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  zIndex: 10
                }}
              />
              { (searchingForRss || retrievingRss) &&
                <View style={{
                  flex: 1,
                  justifyContent: 'center',
                  padding: 20
                }}>
                  <Text
                    style={{
                      ...textStyle,
                      color: hslString('rizzleText'),
                      paddingLeft: 20,
                      paddingRight: 20
                    }}>{searchingForRss
                      ? 'Looking for an available feed' :
                      'Getting feed details'}<AnimatedEllipsis style={{
                    color: hslString('rizzleText'),
                    fontSize: 16,
                    letterSpacing: -5
                  }}/></Text>
                  <Text> </Text>
                </View>
              }
              { (!searchingForRss && !retrievingRss &&
                (!rssUrls || rssUrls.length === 0)) &&
                <View style={{
                  flex: 1,
                  justifyContent: 'center',
                  padding: 20
                }}>
                  <Text
                    style={{
                      ...textStyle,
                      fontFamily: 'IBMPlexSans-Bold'
                    }}>No feed found 😢</Text>
                  <Text style={{
                    ...textStyle,
                    fontFamily: 'IBMPlexSans-Light'
                  }}>Sorry, we can’t add this site to Rizzle yet.</Text>
                </View>
              }
              { !!rssUrls && rssUrls.length > 0 &&
                <Fragment>
                  <View style={{ flex: 0 }}>
                    <Text
                      style={{
                        ...textStyle,
                        fontFamily: 'IBMPlexMono',
                        marginBottom: 10
                      }}>Select a feed:</Text>
                  </View>
                  <View style={{
                    flex: 1,
                    justifyContent: 'space-between'
                  }}>
                    <View style={{
                      flex: 1,
                      justifyContent: 'center'
                    }}>
                      { rssUrls.map((feed, index) => (<TouchableOpacity
                          key={index}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 5
                          }}
                          onPress={() => { this.addFeed(feed.url) }}>
                          <Text style={{
                            ...textStyle,
                            fontFamily: 'IBMPlexSans-Bold'
                          }}>{ feed.title }</Text>
                          <Text style={{
                            ...textStyle,
                            fontFamily: 'IBMPlexSans-Light',
                            fontSize: 16
                          }}>{ feed.description }</Text>
                        </TouchableOpacity>))
                      }
                    </View>
                    <Text
                      style={{
                        ...textStyle,
                        fontFamily: 'IBMPlexMono',
                        marginBottom: 10,
                        flex: 0
                      }}>… or …</Text>
                  </View>
                </Fragment>
              }
            </View>
            <TextButton
              text="Save this page in Rizzle"
              buttonStyle={{ marginBottom: 0 }}
              onPress={this.savePage}
            />
          </View>
        </View>
      </Modal>
    );
  }
}

export default Share
