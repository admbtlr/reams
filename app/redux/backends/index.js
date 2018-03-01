/* global fetch, Headers */
import { fetchUnreadItems, markItemRead, markFeedRead } from './feedwrangler'
// import { fetchUnreadItems, markItemRead } from './rizzle'

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

export { fetchUnreadItems, markItemRead, markFeedRead, loadMercuryStuff }
