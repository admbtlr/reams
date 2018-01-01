/* global fetch, Headers */
import { fetchUnreadItems, getUnreadItems, markItemRead } from './feedwrangler'

function loadMercuryStuff (item) {
  const url = getMercuryUrl(item)
  return fetch(url, {
    'headers': new Headers({
      'x-api-key': 'vTNatJB4JsgmfnKysiE9cOuJonFib4U9176DRF2z'
    })})
    .then((response) => {
      return response.json()
    })
}

function getMercuryUrl (item) {
  let url = 'https://mercury.postlight.com/parser?url=' +
    encodeURIComponent(item.url)
  return url
}

export { fetchUnreadItems, getUnreadItems, markItemRead, loadMercuryStuff }
