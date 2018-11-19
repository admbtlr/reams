import { mergeItems, id } from '../../utils/merge-items'
import { filterItemsForStale } from '../realm/stale-items'
import moment from 'moment'

const feedwrangler = require('./feedwrangler')
const rizzle = require('./rizzle')

let backend
let backends = {
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
      return response.json()
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

const fetchUnreadItems = async function (oldItems, currentItem, feeds) {

  // { readItems, newItems }
  let items

  if (backend === 'rizzle') {
    items = await rizzle.getUnreadItems(oldItems, currentItem, feeds)
  } else if (backend === 'feedwrangler') {
    items = await feedwrangler.getUnreadItems(oldItems, currentItem, feeds)
  }

  if (__DEV__) {
    items.newItems = items.newItems.slice(-100)
  }

  // return {newItems, readItems}
  return items
}

function fetchUnreadIds () {
  switch (backend) {
    case 'rizzle':
    case 'feedwrangler':
      return feedwrangler.fetchUnreadIds()
  }
}

function getItemsByIds (ids) {
  switch (backend) {
    case 'rizzle':
    case 'feedwrangler':
      return feedwrangler.getItemsByIds(ids)
  }
}

function markItemRead (item) {
  switch (backend) {
    case 'rizzle':
    case 'feedwrangler':
      return feedwrangler.markItemRead(item)
  }
}

function markFeedRead (feed) {
  switch (backend) {
    case 'rizzle':
    case 'feedwrangler':
      return feedwrangler.markFeedRead(feed)
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

export { setBackend, fetchUnreadItems, fetchUnreadIds, getItemsByIds, markItemRead, addFeed, markFeedRead, loadMercuryStuff }
