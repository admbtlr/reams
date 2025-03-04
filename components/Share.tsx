import type React from 'react'
import { useEffect, useState } from 'react'
import {
  Animated,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import * as Sentry from '@sentry/react-native'
import SharedGroupPreferences from 'react-native-shared-group-preferences'
import { decode } from 'html-entities'
import { ShareMenuReactView } from 'react-native-share-menu'
import CheckBox from '@react-native-community/checkbox'

import AnimatedEllipsis from './AnimatedEllipsis'
import XButton from './XButton'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import log from '../utils/log'
import { fontSizeMultiplier } from '../utils/dimensions'

const { ui, darkMode } = require('../utils/colors.json')

const hslString = (label: string): string => {
  return ui[label]
}

const EXPO_PUBLIC_SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN

interface Feed {
  url: string
  title: string
  description: string
}

const Share: React.FC = () => {
  const group = 'group.com.adam-butler.rizzle'

  const [isOpen, setIsOpen] = useState(false)
  const [isOpenApp, setIsOpenApp] = useState(true)
  const [type, setType] = useState('')
  const [url, setUrl] = useState('')
  const [domain, setDomain] = useState('')
  const [rssUrls, setRssUrls] = useState<Feed[]>([])
  const [searchingForRss, setSearchingForRss] = useState(false)
  const [retrievingRss, setRetrievingRss] = useState(false)
  const [title, setTitle] = useState('')

  useEffect(() => {
    Sentry.init({
      dsn: EXPO_PUBLIC_SENTRY_DSN
    })
  }, [])

  const dedupeFeeds = (feeds: Feed[]): Feed[] => {
    const hashTable: { [key: string]: boolean } = {}

    return feeds.filter((el) => {
      const key = JSON.stringify({
        title: el.title,
        description: el.description
      })
      const match = Boolean(hashTable[key])
      hashTable[key] = true
      return !match
    })
  }

  const searchForRSS = async (url: string) => {
    let deduped: Feed[] = []
    try {
      let res = await fetch(`https://api.reams.app/api/find-feeds?url=${url}`)
      let newRssUrls: Feed[] = await res.json()
      deduped = dedupeFeeds(rssUrls.concat(newRssUrls))
      if (!deduped || deduped.length === 0) {
        res = await fetch(`https://api.reams.app/api/find-feeds?url=${url}`)
        newRssUrls = await res.json()
        deduped = dedupeFeeds(rssUrls.concat(newRssUrls))
      }
    } catch (e) {
      console.log(e)
    } finally {
      setRssUrls(deduped || [])
      setSearchingForRss(false)
      setRetrievingRss(false)
    }
  }

  const getPageTitle = async (url: string) => {
    fetch(url)
      .then(res => res.text())
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
        const matches = /http[s]*:\/\/([a-zA-Z0-9\.]*)/.exec(url) 
        const domain = matches !== null ? matches[1] : undefined
        if (!domain) return
        console.log(domain)
        setUrl(url)
        setDomain(domain)
        setSearchingForRss(true)
        getPageTitle(url)
        searchForRSS(url)
      } catch (e) {
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

  const addFeed = async (feed: Feed) => {
    try {
      await SharedGroupPreferences.setItem('feed', feed.url, group)
    } catch (error) {
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
    let pages: { url: string, title: string }[] = []
    try {
      const raw = await SharedGroupPreferences.getItem('page', group)
      pages = raw && raw !== 'null' ? JSON.parse(raw) : []
    } catch (error) {
      if (error !== 1) {
        log('savePage', error)
      }
    }
    pages.push(page)
    try {
      await SharedGroupPreferences.setItem('page', JSON.stringify(pages), group)
    } catch (error) {
      log('savePage', error)
    }
    onClose()
  }

  const textStyle = {
    color: hslString('rizzleText'),
    fontFamily: 'IBMPlexMono',
    fontSize: 18,
    textAlign: 'center' as const
  }
  const helpText = {
    color: hslString('rizzleText'),
    fontFamily: 'IBMPlexSans-Light',
    fontSize: 18,
    textAlign: 'left' as const,
    marginBottom: 32,
    marginTop: 32
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
        <View style={{
          flex: 0,
          marginVertical: margin,
          height: 120 * fontSizeMultiplier(),
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {getRizzleButtonIcon('rss', hslString('rizzleText'))}
          <Text
            style={helpText}
          >Add
            <Text style={{
              fontFamily: 'IBMPlexSans-Bold',
              opacity: 0.8
            }}> {domain.length === 0 ? 'this site' : domain} </Text>
            to your feed</Text>
          {(!searchingForRss && !retrievingRss &&
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
          {!!rssUrls && rssUrls.length > 0 &&
            <TextButton label='Add to Feed' onPress={() => addFeed(rssUrls[0])} />
          }
          {(searchingForRss || retrievingRss) &&
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
          alignItems: 'center',
          marginVertical: margin
        }}>
          <View style={{
            height: 1,
            marginRight: margin,
            backgroundColor: hslString('rizzleText'),
            opacity: 0.2,
            flex: 1
          }} />
          <Text style={{
            // ...helpText,
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
        <View style={{ 
          flex: 0, 
          paddingVertical: margin,
          alignItems: 'center',
        }}>
          {getRizzleButtonIcon('saved', hslString('rizzleText'))}
          <Text
            style={helpText}> Save {title ?
              <Text style={{
                fontFamily: 'IBMPlexSans-Bold',
                opacity: 0.8
              }}>{title}</Text> :
              'this page'
            } to your library</Text>
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
  )
}

interface TextButtonProps {
  onPress: () => void
  label: string
  isDisabled?: boolean
}

const TextButton: React.FC<TextButtonProps> = ({ onPress, label, isDisabled }) => (
  <TouchableOpacity
    disabled={isDisabled}
    onPress={onPress}
  >
    <View style={{
      backgroundColor: 'white',
      padding: 6,
      paddingHorizontal: 32,
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

