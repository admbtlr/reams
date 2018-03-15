const feedWranglerAccessToken = '07de039941196f956e9e86e202574419'
const itemsFetchBatchSize = 100

let itemsCache = []

export const getUnreadItemsUrl = (createdSince, page) => {
  let url = '/api/unread?thing=1'
  url = 'https://feedwrangler.net/api/v2/feed_items/list?read=false&access_token=' + feedWranglerAccessToken
  if (createdSince > 0) {
    url += '&created_since=' + createdSince
  }
  if (page > 0) {
    url += '&offset=' + (page * itemsFetchBatchSize)
  }
  return url
}

export const getUnreadItems = (createdSince, page) => {
  createdSince = createdSince || 0
  page = page || 0
  console.log("Fetching unread items: " + getUnreadItemsUrl(createdSince, page))
  return fetch(getUnreadItemsUrl(createdSince, page))
    .then(response => {
      if (!response.ok) {
        throw Error(response.statusText)
      } else {
        return receiveUnreadItems(response, createdSince, page)
      }
    })
    .catch((error) => {
      console.log(error)
    })
}

export const fetchUnreadItems = (createdSince) => {
  itemsCache = []
  return getUnreadItems(createdSince)
}

export const receiveUnreadItems = (response, createdSince, page) => {
  return response.json()
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
          created_at: item.created_at,
          author: item.author,
          feed_title: item.feed_name,
          feed_id: item.feed_id
        }
      })
      itemsCache = itemsCache.concat(items)
      if (items.length === itemsFetchBatchSize) {
        return getUnreadItems(createdSince, page + 1)
      } else {
        return Promise.resolve(itemsCache)
      }
    })
}

export const markItemRead = (item) => {
  const id = typeof item === 'object' ? item.id : item
  let url = 'https://feedwrangler.net/api/v2/feed_items/update?'
  url += 'access_token=' + feedWranglerAccessToken
  url += '&feed_item_id=' + id
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

export const markFeedRead = (feed) => {
  const id = typeof feed === 'object' ? feed.id : feed
  let url = 'https://feedwrangler.net/api/v2/feed_items/mark_all_read?'
  url += 'access_token=' + feedWranglerAccessToken
  url += '&feed_id=' + id
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response
    })
    .then((response) => response.json())
    .then(json => {
      console.log(json)
    })
}

export const addFeed = (feedUrl) => {
  let url = 'https://feedwrangler.net/api/v2/subscriptions/add_feed?'
  url += 'access_token=' + feedWranglerAccessToken
  url += '&feed_url=' + feedUrl
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response
    })
    .then((response) => response.json())
    .then(json => {
      console.log(json)
    })
}