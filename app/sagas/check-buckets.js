import SharedGroupPreferences from 'react-native-shared-group-preferences'
import Clipboard from "@react-native-community/clipboard"
import { isIgnoredUrl, addIgnoredUrl } from "../storage/async-storage"
import { parseString } from 'react-native-xml2js'
import log from '../utils/log'
import { call, delay } from '@redux-saga/core/effects'

const GROUP_NAME = 'group.com.adam-butler.rizzle'

export function * checkBuckets () {
  yield checkClipboard()
  yield checkPageBucket()
  yield checkFeedBucket()
}

function * checkClipboard () {
  console.log('Checking clipboard')
  try {
    const hasUrl = yield call(Clipboard.hasURL)
    if (!hasUrl) {
      return
    }
    let contents = yield call(Clipboard.getString)
    contents = contents ?? ''
    // TODO make this more robust
    if (contents.substring(0, 4) === 'http') {
      const isIgnored = yield call(isIgnoredUrl, contents)
      if (!isIgnored) {
        yield showSavePageModal(contents, true)
      }
    } else if (contents.substring(0, 6) === '<opml>') {
    }
  } catch(err) {
    log('checkClipboard', err)
  }
}

function * checkPageBucket () {
  SharedGroupPreferences.getItem('page', GROUP_NAME).then(value => {
    if (value !== null) {
      SharedGroupPreferences.setItem('page', null, GROUP_NAME)
      const parsed = JSON.parse(value)
      const pages = typeof parsed === 'object' ?
        parsed :
        [parsed]
      console.log(`Got ${pages.length} page${pages.length === 1 ? '' : 's'} to save`)
      // ugh, need a timeout to allow for rehydration
      yield delay(100)
      pages.forEach(page => {
        yield call(savePage, page)
      })
    }
  }).catch(err => {
    // '1' just means that there is nothing in the bucket
    if (err !== 1) {
      log('checkPageBucket', err)
    }
  })
}

function * checkFeedBucket () {
  SharedGroupPreferences.getItem('feed', GROUP_NAME).then(value => {
    if (value !== null) {
      const url = value
      SharedGroupPreferences.setItem('feed', null, GROUP_NAME)
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
            showSaveFeedModal(url, title, description)
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

function * savePage (page) {
  yield saveURL(page.url, page.title)
  yield addMessage('Saved page: ' + (page.title ?? page.url))
}

function * showSavePageModal (url, isClipboard = false) {
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
  yield showModal({
    modalText,
    modalHideCancel: false,
    modalShow: true,
    modalOnOk: () => {
      savePage(url)
    }
  })
}

function * showSaveFeedModal (url, title, description) {
  yield showModal({
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
      addFeed({
        url,
        title,
        description
      })
      fetchData()
    }
  })
}

function * showModal (modalProps) {
  yield put({
    type: SHOW_MODAL,
    modalProps
  })
}

function * saveURL (url) {
  yield put({
    type: SAVE_EXTERNAL_URL,
    url
  })
  // yield put({
  //   type: SET_DISPLAY_MODE,
  //   displayMode: ItemType.saved
  // })
}

function * addFeed (feed) {
  yield put({
    type: ADD_FEED,
    feed
  })
}

function * fetchData () {
  dispatch({
    type: FETCH_ITEMS
  })
}

function * addMessage (messageString) {
  dispatch({
    type: ADD_MESSAGE,
    messageString,
    isSelfDestruct: true
  })
}
