const feedwrangler = require('./feedwrangler')
const rizzle = require('./rizzle')

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

function fetchUnreadItems () {
  return feedwrangler.fetchUnreadItems()
}

function markItemRead (item) {
  return feedwrangler.markItemRead(item)
}

function markFeedRead (feed) {
  return feedwrangler.markFeedRead(feed)
}

function addFeed (url) {
  return feedwrangler.addFeed(url)
}

export { fetchUnreadItems, markItemRead, addFeed, markFeedRead, loadMercuryStuff }
