import fs from 'fs'
import rp from 'request-promise'
import request from 'request'
import {technology} from '../../utils/feeds/technology.mjs'

const getFaviconUrl = async (feedUrl) => {
  const metaUrl = 'https://api.rizzle.net/api/feed-meta/?url=' + feedUrl
  try {
    const meta = await rp({
      uri: metaUrl,
      json: true
    })
    console.log(feedUrl)
    if (meta && meta.favicon && meta.favicon.url) {
      return meta.favicon.url
    } else {
      return null
    }
  } catch (e) {
    return e.message
  }

}

const getMetas = async (feeds) => {

  for (let feed of feeds) {
    const meta = await getMeta(feed.url)
    let description = feed.description
    if (meta.description && !feed.description) {
      description = meta.description
    }
    feed = {
      ...feed,
      ...meta
    }
  }
  // console.log(feeds)
  return feeds
}

getMetas(technology)
  .then(feeds => {
    console.log(feeds)
  })
