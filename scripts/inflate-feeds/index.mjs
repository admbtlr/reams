import fs from 'fs'
import rp from 'request-promise'
import {feeds} from '../../utils/feeds/index.mjs'
import Config from 'react-native-config'

const getMeta = async (feedUrl) => {
  const metaUrl = Config.API_URL + '/feed-meta?url=' + feedUrl
  try {
    const meta = await rp({
      uri: metaUrl,
      json: true
    })
    return meta
  } catch (e) {
    return e.message
  }
}

const getMetas = async (feeds) => {
  let newFeeds = []
  for (let feed of feeds) {
    console.log(`Getting meta for ${feed.title}`)
    let meta = await getMeta(feed.url)
    // meta = typeof meta === 'object' ? meta : {}
    newFeeds.push({
      ...feed,
      ...meta
    })
  }
  console.log(newFeeds)
  return newFeeds
}

const downloadFavicons = async (feeds) => {
  for (let feed of feeds) {
    if (feed.favicon && feed.favicon.url) {
      console.log(`Getting favicon for ${feed.title}`)
      const fileName = feed._id
      const extension = feed.favicon.url.indexOf('.ico') !== -1 ?
        'ico' : 'png'
      let path = `/tmp/favicons/${fileName}.${extension}`
      const res = await rp.get({
        url: feed.favicon.url,
        encoding: null
      })
      const buffer = Buffer.from(res, 'utf8')
      fs.writeFileSync(path, buffer)
    }
  }
  return feeds
}

const addIds = (feeds) => feeds.map((f, i) => ({
  id: i,
  ...f
}))

const writeJSON = (feeds) => {
  fs.writeFileSync('/tmp/feeds.js', JSON.stringify(feeds))
}

const inflate = async (feeds) => {
  let newFeeds = addIds(feeds)
  newFeeds = await getMetas(newFeeds.slice(300, 400))
  await downloadFavicons(newFeeds)
  writeJSON(newFeeds)
  return true  
}

inflate(feeds).then(_ => true)

