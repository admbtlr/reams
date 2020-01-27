import fs from 'fs'
import rp from 'request-promise'
import request from 'request'
import {technology} from '../../utils/feeds/technology.mjs'

const getMeta = async (feedUrl) => {
  const metaUrl = 'https://api.rizzle.net/feed-meta/?url=' + feedUrl
  try {
    const meta = await rp({
      uri: metaUrl,
      json: true
    })
    console.log(meta)
    if (meta) {
      return meta
    } else {
      return null
    }
  } catch (e) {
    return e.message
  }

}

const getMetas = async (feeds) => {
  let newFeeds = []
  for (let feed of feeds) {
    const meta = await getMeta(feed.url)
    let description = feed.description
    if (meta && meta.description && !feed.description) {
      description = meta.description
    }
    newFeeds.push({
      ...feed,
      ...meta
    })
  }
  console.log(newFeeds)
  return newFeeds
}

getMetas(technology)
  .then(feeds => {
    // console.log(feeds)
  })
