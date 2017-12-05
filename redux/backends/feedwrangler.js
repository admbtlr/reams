/* global fetch */
import 'whatwg-fetch'

import {
  itemsHasErrored,
  itemsIsLoading,
  itemsFetchDataSuccess
} from '../actions/items.js'

const feedWranglerAccessToken = '07de039941196f956e9e86e202574419'
const itemsFetchBatchSize = 100

let itemsCache = []

export const getUnreadItemsUrl = (page) => {
  let url = '/api/unread?thing=1'
  url = 'https://feedwrangler.net/api/v2/feed_items/list?read=false&access_token=' + feedWranglerAccessToken
  if (page > 0) {
    url += '&offset=' + (page * itemsFetchBatchSize)
  }
  return url
}

export const getUnreadItems = (dispatch, page) => {
  page = page || 0
  fetch(getUnreadItemsUrl(page))
    .then(response => {
      if (!response.ok) {
        throw Error(response.statusText)
      } else {
        receiveUnreadItems(dispatch, response, page)
      }
    })
    .catch(() => {
      dispatch(itemsHasErrored(true))
      dispatch(itemsIsLoading(false))
    })
}

export const receiveUnreadItems = (dispatch, response, page) => {
  response.json()
    .then((feed) => {
      const items = [...feed.feed_items].map((item) => {
        return {
          id: item.feed_item_id,
          url: item.url,
          external_url: item.url,
          title: item.title,
          content_html: item.body,
          date_published: item.published_at,
          date_modified: item.updated_at,
          author: item.author,
          feed_title: item.feed_name
        }
      })
      itemsCache = itemsCache.concat(items)
      if (items.length === itemsFetchBatchSize) {
        getUnreadItems(dispatch, page + 1)
      } else {
        dispatch(itemsIsLoading(false))
        dispatch(itemsFetchDataSuccess(itemsCache))
        itemsCache = []
      }
    })
    .catch(() => dispatch(itemsHasErrored(true)))
}

export const markItemRead = (item) => {
  let url = 'https://feedwrangler.net/api/v2/feed_items/update?'
  url += 'access_token=' + feedWranglerAccessToken
  url += '&feed_item_id=' + item.id
  url += '&read=true'
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response
    })
    .then((response) => response.json())
}
