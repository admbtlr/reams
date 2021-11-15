import React, { useEffect } from 'react'
import {
  AppState
} from 'react-native'
import Clipboard from "@react-native-community/clipboard"
import SharedGroupPreferences from 'react-native-shared-group-preferences'
import { parseString } from 'react-native-xml2js'

import { isIgnoredUrl, addIgnoredUrl } from '../storage/async-storage'
import log from '../utils/log'
import DarkModeListener from './DarkModeListener'

class AppStateListener extends React.Component {

  group = 'group.com.adam-butler.rizzle'

  MINIMUM_UPDATE_INTERVAL = 600000 // 10 minutes

  constructor (props) {
    super(props)
    this.props = props

    this.checkClipboard = this.checkClipboard.bind(this)
    this.checkPageBucket = this.checkPageBucket.bind(this)
    this.checkFeedBucket = this.checkFeedBucket.bind(this)
    this.handleAppStateChange = this.handleAppStateChange.bind(this)
    this.showSavePageModal = this.showSavePageModal.bind(this)
    this.showSaveFeedModal = this.showSaveFeedModal.bind(this)

    AppState.addEventListener('change', this.handleAppStateChange)

    this.checkBuckets()
  }

  async checkBuckets () {
    await this.checkClipboard()
    await this.checkPageBucket()
    await this.checkFeedBucket()
    // see Rizzle component
  }

  async handleAppStateChange (nextAppState) {
    if (this.props.appState.match(/inactive|background/) && nextAppState === 'active') {
      this.props.appWentActive()
      this.setState({
        doNothing: Date.now()
      })
      await this.checkBuckets()

      if (!global.isStarting && (Date.now() - this.props.lastUpdated > this.MINIMUM_UPDATE_INTERVAL)) {
        this.props.fetchData()
      }
    } else if (this.props.appState.match(/active/) &&
      (nextAppState === 'inactive' ||
      nextAppState === 'background')) {
      this.props.appWentInactive()
    }
  }

  async checkClipboard () {
    console.log('Checking clipboard')
    try {
      const hasUrl = await Clipboard.hasURL()
      if (!hasUrl) {
        return
      }
      let contents = await Clipboard.getString() ?? ''
      // TODO make this more robust
      // right now we're ignoring any URLs that include 'rizzle.net'
      // this is due to links getting into clipboard during the email auth process
      if (contents.substring(0, 4) === 'http' &&
        contents.indexOf('rizzle.net') === -1) {
        const isIgnored = await isIgnoredUrl(contents)
        if (!isIgnored) {
          this.showSavePageModal.call(this, contents, true)
        }
      } else if (contents.substring(0, 6) === '<opml>') {
      }
    } catch(err) {
      log('checkClipboard', err)
    }
  }

  async checkPageBucket () {
    SharedGroupPreferences.getItem('page', this.group).then(value => {
      if (value !== null) {
        SharedGroupPreferences.setItem('page', null, this.group)
        const parsed = JSON.parse(value)
        const pages = typeof parsed === 'object' ?
          parsed :
          [parsed]
        console.log(`Got ${pages.length} page${pages.length === 1 ? '' : 's'} to save`)
        const that = this
        pages.forEach(page => {
          that.savePage.call(that, page)
        })
      }
    }).catch(err => {
      // '1' just means that there is nothing in the bucket
      if (err !== 1) {
        log('checkPageBucket', err)
      }
    })
  }

  async checkFeedBucket () {
    SharedGroupPreferences.getItem('feed', this.group).then(value => {
      if (value !== null) {
        const url = value
        const that = this
        SharedGroupPreferences.setItem('feed', null, this.group)
        console.log(`Got a feed to subscribe to: ${url}`)
        // TODO check that value is a feed url
        // TODO check that feed is not already subscribed!
        // right now it will just get ignored if it's already subscribed
        // but it might be nice to say that in the message
        fetch(url)
          .then((response) => {
            if (!response.ok) {
              throw Error(response.statusText)
            }
            return response
          })
          .then((response) => {
            return response.text()
          })
          .then((xml) => {
            parseString(xml, (error, result) => {
              if (error) {
                throw error
              }
              let title, description
              if (result.rss) {
                title = typeof result.rss.channel[0].title[0] === 'string' ?
                  result.rss.channel[0].title[0] :
                  result.rss.channel[0].title[0]._
                description = result.rss.channel[0].description ?
                  (typeof result.rss.channel[0].description[0] === 'string' ?
                    result.rss.channel[0].description[0] :
                    result.rss.channel[0].description[0]._) :
                  ''
              } else if (result.feed) {
                // atom
                title = typeof result.feed.title[0] === 'string' ? 
                  result.feed.title[0] : 
                  result.feed.title[0]._
                description = result.feed.subtitle ?
                  (typeof result.feed.subtitle[0] === 'string' ? 
                    result.feed.subtitle[0] : 
                    result.feed.subtitle[0]._) :
                  ''
              }
              this.showSaveFeedModal(url, title, description, that)
            })
          })
          .catch(err => {
            log('checkFeedBucket', err)
          })
      }
    }).catch(err => {
      // '1' just means that there is nothing in the bucket
      if (err !== 1) {
        log('checkFeedBucket', err)
      }
    })
  }

  savePage (page) {
    console.log(`Saving page: ${page.url}`)
    this.props.saveURL(page.url, page.title)
    this.props.addMessage('Saved page: ' + (page.title ?? page.url))
  }

  addFeed (feed) {
    this.props.addFeed(feed)
    this.props.addMessage('Added feed: ' + (feed.title ?? feed.url))
    this.props.fetchData()
  }

  showSavePageModal (url, isClipboard = false) {
    let displayUrl = url
    if (displayUrl.length > 64) {
      displayUrl = displayUrl.slice(0, 64) + '…'
    }
    let modalText = [
      {
        text: 'Save this page?',
        style: ['title']
      },
      {
        text: displayUrl,
        style: ['em']
      }
    ]
    if (isClipboard) {
      modalText.push({
        text: 'This URL was in your clipboard. Copying a URL is an easy way to save a page in Rizzle.',
        style: ['hint']
      })
    }
    const onOk = () => {
      this.savePage({ url })
  }
    // onOk = onOk.bind(this)
    this.props.showModal({
      modalText,
      modalHideCancel: false,
      modalShow: true,
      modalOnOk: onOk.bind(this)
    })
  }

  showSaveFeedModal (url, title, description, scope) {
    scope.props.showModal({
      modalText: [
        {
          text: 'Add this feed?',
          style: ['title']
        },
        {
          text: title,
          style: ['em']
        },
        {
          text: description,
          style: ['em', 'smaller']
        }
      ],
      modalHideCancel: false,
      modalShow: true,
      modalOnOk: () => {
        scope.props.addFeed({
          url,
          title,
          description
        })
        scope.props.fetchData()
      }
    })
  }

  render () {
    return <DarkModeListener />
  }
}

export default AppStateListener
