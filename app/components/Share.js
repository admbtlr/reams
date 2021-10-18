import React from 'react'
import {
  Animated,
  NativeModules,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import * as Sentry from '@sentry/react-native'
import SharedGroupPreferences from 'react-native-shared-group-preferences'

import TextButton from './TextButton'
import AnimatedEllipsis from './AnimatedEllipsis'
import XButton from './XButton'
import {hslString} from '../utils/colors'
import {getRizzleButtonIcon} from '../utils/rizzle-button-icons'
import log from '../utils/log'


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

  dedupeFeeds (feeds) {
    var hashTable = {};

    return feeds.filter(function (el) {
      var key = JSON.stringify({
        title: el.title,
        description: el.description
      })
      var match = Boolean(hashTable[key])
  
      return (match ? false : hashTable[key] = true)
    })
  }

  async searchForRSS (url) {
    fetch(`https://api.rizzle.net/api/find-feeds?url=${url}`)
      .then(res => res.json())
      .then(rssUrls => {
        const feeds = this.state.rssUrls.concat(rssUrls)
        const deduped = this.dedupeFeeds(feeds)
        this.setState({ 
          rssUrls: deduped 
        })
      })
    fetch(`https://api.rizzle.net/api/find-feeds?url=${url}&extended=1`)
      .then(res => res.json())
      .then(rssUrls => {
        const deduped = this.dedupeFeeds(this.state.rssUrls.concat(rssUrls))
        this.setState({ 
          rssUrls: deduped,
          searchingForRss: false,
          retrievingRss: false
        })
      })
      .catch(e => console.log(e))
  }

  decodeEntities = str => str.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))

  async getPageTitle(url) {
    fetch(url)
      .then(res => {
        return res.text()
      })
      .then(text => {
        const found = text.match(/\<title.*?\>(.*?)\<\/title/)
        if (found && found.length > 1) {
          this.setState({
            title: this.decodeEntities(found[1])
          })  
        }
      })
  }

  async componentDidMount() {
    try {
      const sharedData = await NativeModules.RizzleShare.data()
      let { type, data } = sharedData
      console.log(`Data: ${data}`)
      console.log(`Type: ${type}`)
      data = /(http[a-zA-Z0-9:\/\.\-_?&=]*)/.exec(data)[1]
      console.log(`Data after regex: ${data}`)
      this.setState({
        isOpen: true,
        type,
        data,
        searchingForRss: true
      })
      this.getPageTitle(data)
      this.searchForRSS(data)
    } catch(e) {
      console.log('errrr', e)
    }
  }

  componentDidUpdate () {
    console.log('COMPONENT DID UPDATE!')
  }

  onClose = () => {
    NativeModules.RizzleShare.close()
  }

  closing = () => this.setState({ isOpen: false })

  async addFeed (url) {
    // console.log(this.state.rssUrl)
    await SharedGroupPreferences.setItem('feed', url, this.group)
    this.onClose()
  }

  async savePage () {
    const page = {
      url: this.state.data,
      title: this.state.title
    }
    console.log(this.group)
    let pages = []
    try {
      const raw = await SharedGroupPreferences.getItem('page', this.group)
      pages = raw ? JSON.parse(raw) : []
    } catch(error) {
      if (error !== 1) {
        log('savePage', error)
      }
    }
    pages.push(page)
    await SharedGroupPreferences.setItem('page', JSON.stringify(pages), this.group)
    this.onClose()
  }

  render() {
    const textStyle = {
      color: hslString('rizzleText'),
      fontFamily: 'IBMPlexMono',
      fontSize: 18,
      textAlign: 'center'
    }
    const helpText = {
      color: hslString('rizzleText'),
      fontFamily: 'IBMPlexSans-Light',
      fontSize: 18,
      textAlign: 'left',
      marginBottom: 16
    }
    const {
      searchingForRss,
      retrievingRss,
      isOpen,
      rssUrls,
      title
    } = this.state
    // console.log(this.state.rssUrls)
    const margin = 24
    const saveIcon = <View style={{
      top: -12,
      left: -12
    }}>
      {getRizzleButtonIcon('saveButtonIconOff', hslString('rizzleText'), hslString('rizzleBG'))}
    </View>
    return (
      <View style={{
        backgroundColor: hslString('rizzleBG'),
        alignItems: 'center',
        justifyContent:'center',
      flex: 1
      }}>
          <View style={{
            // backgroundColor: hslString('rizzleBG'),
            // width: 350,
            // height: 300,
            padding: margin,
            paddingTop: margin * 2,
            paddingBottom: margin * 4,
            // borderRadius: 14
            minWidth: '100%',
            // height: 'auto'
          }}>
            <View style={{
              flex: 1,
              justifyContent: 'space-between'
            }}>
              <XButton
                onPress={() => {
                  this.setState({ isOpen: false })
                  console.log('Closing')
                  this.onClose()
                }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: -16,
                  zIndex: 10
                }}
              />
              <Text style={{
                fontFamily: 'PTSerif-Bold',
                fontSize: 32,
                lineHeight: 36,
                marginBottom: 6,
                paddingTop: 18,
                textAlign: 'center',
                color: hslString('rizzleText')
              }}>Reams</Text>
              <View style={{
                height: 1,
                backgroundColor: hslString('rizzleText'),
                opacity: 0.2,
                marginBottom: margin
              }} />
              <Text
                style={helpText}
              >You can subscribe to a feed from this website:</Text>
              { (!searchingForRss && !retrievingRss &&
                (!rssUrls || rssUrls.length === 0)) &&
                <View style={{
                  flex: 1,
                  justifyContent: 'center',
                  padding: margin
                }}>
                  <Text
                    style={{
                      ...textStyle,
                      fontFamily: 'IBMPlexSans-Bold'
                    }}>No feeds found 😢</Text>
                  <Text style={{
                    ...textStyle,
                    fontFamily: 'IBMPlexSans-Light'
                  }}>Sorry, we can’t find any feeds on this website.</Text>
                </View>
              }
              { !!rssUrls && rssUrls.length > 0 &&
                <View style={{
                  flex: 1,
                  justifyContent: 'space-between'
                }}>
                  <View style={{
                    flex: 1,
                    textAlign: 'left',
                    paddingTop: margin
                    // justifyContent: 'center'
                  }}>
                    { rssUrls.map((feed, index) => (
                      <TouchableOpacity
                        key={index}
                        style={{
                          paddingHorizontal: 0,
                          paddingVertical: margin,
                          borderTopWidth: index === 0 ? 1 : 0,
                          borderTopColor: 'rgba(0,0,0,0.1)',
                          borderBottomWidth: 1,
                          borderBottomColor: 'rgba(0,0,0,0.1)'
                        }}
                        onPress={() => { this.addFeed(feed.url) }}>
                        <Text style={{
                          ...textStyle,
                          textAlign: 'left',
                          fontFamily: 'IBMPlexSans-Bold',
                          fontSize: 20
                        }}>{ feed.title }</Text>
                        <Text style={{
                          ...textStyle,
                          textAlign: 'left',
                          fontFamily: 'IBMPlexSans-Light',
                          fontSize: 16
                        }}>{ feed.description }</Text>
                      </TouchableOpacity>))
                    }
                  </View>
                </View>
              }
              { (searchingForRss || retrievingRss) &&
                <View style={{
                  flex: 1,
                  justifyContent: 'center',
                  padding: margin
                }}>
                  <Animated.Text
                    style={{
                      ...textStyle,
                      color: hslString('rizzleText'),
                      paddingLeft: 24,
                      paddingRight: 24
                    }}>{searchingForRss
                      ? 'Searching for feeds' :
                      'Getting feed details'}<AnimatedEllipsis style={{ 
                        color: hslString('rizzleText'),
                        fontSize: 16
                      }} />
                  </Animated.Text>
                  <Text> </Text>
                </View>
              }

            </View>
            <Text
              style={helpText}>Or you can save { title ? 
                <Text style={{
                  fontFamily: 'IBMPlexSans-Bold'
                }}>{title}</Text> : 
                'this page' 
              } to read later:</Text>
            <TextButton
              text="Save this page in Reams"
              buttonStyle={{ 
                alignSelf: 'center',
                paddingLeft: 50,
                paddingRight: 50,
                marginBottom: 0,
                // width: Dimensions.get('window').width - 32
              }}
              icon={saveIcon}
              onPress={this.savePage}
            />
          </View>
      </View>

    );
  }
}

export default Share

/* 
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
                  }}>Sorry, we can’t add this site to Reams yet.</Text>
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
*/