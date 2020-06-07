import React, { Fragment } from 'react'
import {
  Animated,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import ShareExtension from 'react-native-share-extension'
import * as Sentry from '@sentry/react-native'
// import { RNSKBucket } from 'react-native-swiss-knife'
import SharedGroupPreferences from 'react-native-shared-group-preferences'

import TextButton from './TextButton'
import AnimatedEllipsis from './AnimatedEllipsis'
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

  async searchForRSS (url) {
    const res = await fetch(`https://api.rizzle.net/api/find-feeds?url=${url}`)
    const rssUrls = await res.json()
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
  }

  async getPageTitle(url) {
    const res = await fetch(`https://api.rizzle.net/api/mercury?url=${url}`)
    const mercury = await res.json()
    this.setState({
      title: mercury.title
    })
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
      this.getPageTitle(value)
      this.searchForRSS(value)
    } catch(e) {
      console.log('errrr', e)
    }
  }

  componentDidUpdate () {
    console.log('COMPONENT DID UPDATE!')
  }

  onClose = () => {
    ShareExtension.close()
  }

  closing = () => this.setState({ isOpen: false })

  async addFeed (url) {
    // console.log(this.state.rssUrl)
    await SharedGroupPreferences.setItem('feed', url, this.group)
    this.onClose()
  }

  async savePage () {
    console.log(SharedGroupPreferences)
    await SharedGroupPreferences.setItem('page', this.state.value, this.group)
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
                      ? 'Searching for available feeds' :
                      'Getting feed details'}<AnimatedEllipsis style={{ 
                        color: hslString('rizzleText'),
                        fontSize: 16
                      }} />
                  </Animated.Text>
                  <Text> </Text>
                </View>
              }
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
                    textAlign: 'left'
                    // justifyContent: 'center'
                  }}>
                    { rssUrls.map((feed, index) => (<TouchableOpacity
                        key={index}
                        style={{
                          paddingHorizontal: 0,
                          paddingVertical: margin
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