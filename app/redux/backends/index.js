import { mergeItems, id } from '../../utils/merge-items'
import { filterItemsForStale } from '../realm/stale-items'

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

function * fetchUnreadItems (oldItems, currentItem, feeds) {
  let readItems
  let newItems

  if (backend === 'rizzle') {
    let latestDate = 0
    if (oldItems.length > 0) {
      latestDate = [ ...oldItems ].sort((a, b) => b.created_at - a.created_at)[0].created_at
    }
    try {
      const unreadItemArrays = yield rizzle.fetchUnreadItems(feeds)
      newItems = unreadItemArrays.reduce((accum, unread) => accum.concat(unread), [])
      if (__DEV__) {
        newItems = newItems.slice(0, 100)
      }
      console.log(`Fetched ${newItems.length} items`)
      console.log(newItems)
      const { read, unread } = mergeItems(oldItems, newItems, currentItem)
      unread = yield filterItemsForStale(unread)

      console.log(`And now I have ${unread.length} unread items`)
      console.log(unread)
      readItems = read.sort((a, b) => a.date_published > b.date_published)
      newItems = unread
    } catch (error) {
      console.log(error)
    }
  } else if (backend === 'feedwrangler') {
    const newIds = yield feedwrangler.fetchUnreadIds()
    newItems = newIds.map((item) => {
      return oldItems.find((oldItem) => oldItem.id === item.id) || item
    })
    readItems = oldItems.filter((oldItem) => newItems.find((newItem) => newItem.id === oldItem.id) === undefined)
    const idsToExpand = newItems.filter(item => !!!item._id)
    if (idsToExpand.length > 0) {
      const expandedItems = yield feedwrangler.getItemsByIds(idsToExpand)
      newItems = mergeExpanded(newItems, expandedItems)
    }
    if (currentItem && !newItems.find((item) => {
      return item && item._id === currentItem._id
    })) {
      newItems.push(currentItem)
    }
    newItems.sort((a, b) => a.date_published - b.date_published)

    if (__DEV__) {
      newItems = newItems.slice(0, 100)
    }

  }

  return {newItems, readItems}
}

function mergeExpanded (mixedItems, expandedItems) {
  return mixedItems.map((item) => {
    return item._id ? item : expandedItems.find((expanded) => expanded.id === item.id)
  })
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
