import React, { useEffect, useState } from 'react'
import {
  Animated,
  NativeModules,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import * as Sentry from '@sentry/react-native'
import SharedGroupPreferences from 'react-native-shared-group-preferences'
import {decode} from 'html-entities'
import Config from 'react-native-config'
import {ShareMenuReactView} from 'react-native-share-menu'
import CheckBox from '@react-native-community/checkbox'

import AnimatedEllipsis from './AnimatedEllipsis'
import XButton from './XButton'
import {getRizzleButtonIcon} from '../utils/rizzle-button-icons'
import log from '../utils/log'

const { ui, darkMode } = require('../utils/colors.json')

const hslString = (label) => {
  return ui[label]
}

const Share  = () => {

  const group = 'group.com.adam-butler.rizzle'

  const [isOpen, setIsOpen] = useState(false)
  const [isOpenApp, setIsOpenApp] = useState(true)
  const [type, setType] = useState('')
  const [url, setUrl] = useState('')
  const [domain, setDomain] = useState('')
  const [rssUrls, setRssUrls] = useState([])
  const [searchingForRss, setSearchingForRss] = useState(false)
  const [retrievingRss, setRetrievingRss] = useState(false)
  const [title, setTitle] = useState('')

  useEffect(() => {
    Sentry.init({
      dsn: Config.SENTRY_DSN
    })  
  }, [])

  const dedupeFeeds = (feeds) => {
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

  const searchForRSS = async (url) => {
    fetch(`https://api.rizzle.net/api/find-feeds?url=${url}`)
      .then(res => res.json())
      .then(newRssUrls => {
        const feeds = rssUrls.concat(newRssUrls)
        const deduped = dedupeFeeds(feeds)
        setRssUrls(deduped)
      })
      .catch(e => console.log(e))
    fetch(`https://api.rizzle.net/api/find-feeds?url=${url}&extended=1`)
      .then(res => res.json())
      .then(newRssUrls => {
        const deduped = dedupeFeeds(rssUrls.concat(newRssUrls))
        console.log(deduped)
        setRssUrls(deduped)
        setSearchingForRss(false)
        setRetrievingRss(false)
      })
      .catch(e => console.log(e))
  }

  const getPageTitle = async (url) => {
    fetch(url)
      .then(res => {
        return res.text()
      })
      .then(text => {
        const found = text.match(/\<title.*?\>(.*?)\<\/title/)
        if (found && found.length > 1) {
          setTitle(decode(found[1]))
        }
      })
  }

  useEffect(() => {
    const getSharedData = async () => {
      try {
        const data = await ShareMenuReactView.data()
        console.log(data)
        const url = data.data[0].data
        console.log(url)
        const domain = /http[s]*:\/\/([a-zA-Z0-9\.]*)/.exec(url)[1]
        console.log(domain)
        setUrl(url)
        setDomain(domain)
        setSearchingForRss(true)
        getPageTitle(url)
        searchForRSS(url)
        // const sharedData = await NativeModules.RizzleShare.data()
        // let { type, data } = sharedData
        // console.log(`Data: ${data}`)
        // console.log(`Type: ${type}`)
        // data = /(http[a-zA-Z0-9:\/\.\-_?&=]*)/.exec(data)[1]
        // console.log(`Data after regex: ${data}`)
        // this.setState({
        //   isOpen: true,
        //   type,
        //   data,
        //   searchingForRss: true
        // })

        // this.getPageTitle(data)
        // this.searchForRSS(data)
      } catch(e) {
        console.log('errrr', e)
      }
    }
    getSharedData()
  }, [])

  const onClose = () => {
    if (isOpenApp) {
      ShareMenuReactView.openApp()  
    } else {
      ShareMenuReactView.dismissExtension()
    }
  }

  const closing = () => setIsOpen(false)

  const addFeed = async (feed) => {
    // console.log(this.state.rssUrl)
    try {
      await SharedGroupPreferences.setItem('feed', feed.url, group)
    } catch(error) {
      log('addFeed', error)
    }
    onClose()
  }

  const savePage = async () => {
    const page = {
      url,
      title
    }
    console.log(page)
    let pages = []
    try {
      const raw = await SharedGroupPreferences.getItem('page', group)
      pages = raw ? JSON.parse(raw) : []
    } catch(error) {
      if (error !== 1) {
        log('savePage', error)
      }
    }
    pages.push(page)
    try {
      await SharedGroupPreferences.setItem('page', JSON.stringify(pages), group)
    } catch(error) {
      log('savePage', error)
    }
    onClose()
  }

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
      justifyContent: 'flex-start',
    flex: 1
    }}>
        <View style={{
          padding: margin,
          paddingTop: margin * 2,
          paddingBottom: margin * 4,
          minWidth: '100%',
          flex: 0
        }}>
          <View style={{
            flex: 0,
            justifyContent: 'space-between'
          }}>
            <XButton
              onPress={() => {
                setIsOpen(false)
                console.log('Closing')
                onClose()
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
          </View>
        <View style={{ flex: 0, marginVertical: margin }}>              
            <Text
              style={helpText}
            >{getRizzleButtonIcon('rss', hslString('rizzleText'))} Add 
              <Text style={{ 
                fontFamily: 'IBMPlexSans-Bold',
                opacity: 0.8
              }}> {domain.length === 0 ? 'this site' : domain} </Text>
               to your feed</Text>
            { (!searchingForRss && !retrievingRss &&
              (!rssUrls || rssUrls.length === 0)) &&
              <View style={{
                flex: 0
              }}>
                <Text
                  style={{
                    ...helpText,
                    alignSelf: 'center'
                  }}>Not available</Text>
              </View>
            }
            { !!rssUrls && rssUrls.length > 0 &&
              <TextButton label='Add to Feed' onPress={() => addFeed(rssUrls[0])} />
            }
            { (searchingForRss || retrievingRss) &&
              <View style={{
                flex: 0
              }}>
                <Animated.Text
                  style={{
                    ...helpText,
                    alignSelf: 'center'
                  }}>{searchingForRss
                    ? 'Searching for feeds' :
                    'Getting feed details'}<AnimatedEllipsis style={{ 
                      color: hslString('rizzleText'),
                      fontSize: 16
                    }} />
                </Animated.Text>
              </View>
            }
          </View>
          <View style={{ 
            flex: 0, 
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <View style={{
              height: 1,
              marginRight: margin,
              backgroundColor: hslString('rizzleText'),
              opacity: 0.2,
              flex: 1
            }} />
            <Text style={{
              ...helpText,
              fontFamily: 'IBMPlexSerif-Italic',
              marginBottom: 0
            }}>or</Text>
            <View style={{
              height: 1,
              marginLeft: margin,
              backgroundColor: hslString('rizzleText'),
              opacity: 0.2,
              flex: 1
            }} />
          </View>
          <View style={{ flex: 0, paddingVertical: margin }}>
            <Text
              style={helpText}>{getRizzleButtonIcon('saved', hslString('rizzleText'))} Save { title ? 
                <Text style={{
                  fontFamily: 'IBMPlexSans-Bold',
                  opacity: 0.8 
                }}>{title}</Text> : 
                'this page' 
              } to your library</Text>
            {/* <TextButton
              text="Save to library"
              buttonStyle={{ 
                alignSelf: 'center',
                paddingLeft: 50,
                paddingRight: 50,
                marginBottom: 0,
                // width: Dimensions.get('window').width - 32
              }}
              icon={saveIcon}
              onPress={this.savePage}
            /> */}
            <TextButton onPress={savePage} label='Save to Library' />
          </View>
        </View>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'flex-start'
        }}>
          <CheckBox
            disabled={false}
            value={isOpenApp}
            onCheckColor={hslString('rizzleText')}
            onFillColor='white'
            onTintColor={hslString('rizzleText')}
            onValueChange={(newValue) => setIsOpenApp(newValue)}
          />
          <Text style={{
            ...helpText,
            marginLeft: 10,
            marginTop: 2
          }}>Open in Reams</Text>
        </View>
    </View>

  );
}
const TextButton = ({onPress, label, isDisabled}) => (
  <TouchableOpacity 
    disabled={isDisabled}
    onPress={onPress}
  >
    <View style={{
      backgroundColor: 'white',
      padding: 6,
      paddingHorizontal: 12,
      // height: 36,
      borderRadius: 16,
      borderColor: hslString('rizzleText'),
      borderWidth: 1,
      alignItems: 'center'
    }}>
      <Text style={{
        fontFamily: 'IBMPlexSans',
        fontSize: 16
      }}>{label}</Text>
    </View>
  </TouchableOpacity>
)

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