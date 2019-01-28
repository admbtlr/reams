import { mergeItems, id } from '../../utils/merge-items'
import moment from 'moment'

const feedbin = require('./feedbin')
const feedwrangler = require('./feedwrangler')
const rizzle = require('./rizzle')

const MAX_ITEMS_TO_DOWNLOAD = 5000

let backend
let backends = {
  feedbin,
  feedwrangler,
  rizzle
}

function setBackend (bcknd) {
  backend = bcknd
}

function loadMercuryStuff (item) {
  const url = getMercuryUrl(item)
  return fetch(url, {
    'headers': new Headers({
      'x-api-key': 'vTNatJB4JsgmfnKysiE9cOuJonFib4U9176DRF2z'
    })})
    .then((response) => {
      try {
        return response.json()
      } catch (e) {
        console.log(e)
      }
    })
    .catch((error) => {
      console.log(error)
    })
}

function getMercuryUrl (item) {
  let url = 'https://mercury.postlight.com/parser?url=' +
    encodeURIComponent(item.url)
  return url
}

// old items are (fetched items + read items)
const fetchUnreadItems = async function (oldItems, readItems, currentItem, feeds, cb) {

  // { readItems, newItems }
  let items

  if (backend === 'rizzle') {
    items = await rizzle.getUnreadItems(oldItems, readItems, currentItem, feeds, MAX_ITEMS_TO_DOWNLOAD, cb)
  } else if (backend === 'feedwrangler') {
    items = await feedwrangler.getUnreadItems(oldItems, readItems, currentItem, feeds, MAX_ITEMS_TO_DOWNLOAD, cb)
  }

  // if (__DEV__) {
  //   items.newItems = items.newItems.slice(-100)
  // }

  // return {newItems, readItems}
  return items
}

function fetchUnreadIds () {
  switch (backend) {
    case 'rizzle':
      return
    case 'feedwrangler':
      return feedwrangler.fetchUnreadIds()
  }
}

function markItemRead (item) {
  switch (backend) {
    case 'rizzle':
      return
    case 'feedwrangler':
      return feedwrangler.markItemRead(item)
  }
}

function markFeedRead (feed, olderThan) {
  switch (backend) {
    case 'rizzle':
      return
    case 'feedwrangler':
      // return feedwrangler.markFeedRead(feed, olderThan)
  }
}

function addFeed (url) {
  switch (backend) {
    case 'rizzle':
      return
    case 'feedwrangler':
      return feedwrangler.addFeed(url)
  }
}

function authenticate (username, password, backend) {
  switch (backend) {
    case 'rizzle':
      return
    case 'feedbin':
      return
    case 'feedwrangler':
      return feedwrangler.authenticate(username, password)
  }
}

export { authenticate, setBackend, fetchUnreadItems, fetchUnreadIds, markItemRead, addFeed, markFeedRead, loadMercuryStuff }
