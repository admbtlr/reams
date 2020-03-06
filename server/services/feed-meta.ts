import { derelativise } from './url'

const rp = require('request-promise')
const fs = require("fs")
const parseFavicon = require('parse-favicon')
const ColorThief = require('colorthief')

export const getMeta = async (items) : Promise<{
  description?: string
  favicon?: string
  image?: string
  link?: string
  color?: string | []
}> => {
  if (items && items.length) {
    const meta = items[0].meta
    let feedMeta = {
      description: meta.description,
      favicon: meta.favicon || (meta.imge && { url: meta.image.url }),
      image: meta.image.url,
      link: meta.link
        .replace(/\?.*/, '')
        .replace(/(.*?\/\/.*?\/).*/, '$1'),
      color: meta.color
    }
    const knownSite = knownSites.find(ks => ks.url === feedMeta.link)
    if (knownSite) {
      feedMeta.favicon = { url: knownSite.favicon },
      feedMeta.color = knownSite.color
      return feedMeta
    }
    try {
      const body = await rp({
        uri: derelativise(feedMeta.link),
        followAllRedirects: true
      })
      const favicon = await getFavicon(feedMeta.link, body)
      feedMeta.favicon = favicon || feedMeta.favicon
      const color = getColor(body) || (feedMeta.favicon ?
        await getColorFromFavicon(feedMeta.favicon.url, meta.title.replace(/[^A-Za-z]/g, '')) :
        null)
      feedMeta.color = color || feedMeta.color
    } catch (e) {
      console.log(e)
    }
    return feedMeta
  } else {
    return {}
  }
}

const getFavicon = async (link, body) => {
  // console.log(body)
  let favicons = await parseFavicon.parseFavicon(body, {})
  let favicon
  const getSize = f => f.size
    ? f.size.split('x')[0]
    : 0
  if (favicons && favicons.length > 0) {
    favicons = favicons.sort((a, b) => getSize(a) - getSize(b))
      .filter(f => f.type && f.type === 'image/png'
        || (f.path && f.path.indexOf('png') !== -1)
        || (f.url && f.url.indexOf('png') !== -1))
    if (favicons.length) {
      let goodFavicons = []
      // try and get the smallest one larger than 63
      // favicon = favicons.find(f => getSize(f) > 63)
      //  || favicons[0]
      for (var i = 0; i < favicons.length; i++) {
        favicon = resolveUrl(favicons[i], link)
        try {
          const response = await rp({
            uri: favicon.url,
            resolveWithFullResponse: true
          })
          if (response.statusCode !== 404) {
            console.log(`${favicon.url} is good`)
            goodFavicons.push(favicon)
          } else {
            console.log(`${favicon.url} is bad`)
          }
        } catch (error) {
          console.log(`${favicon.url} is bad`)
        }
      }
      favicon = goodFavicons.find(f => getSize(f) > 63)
       || goodFavicons[0]
    }
  }
  return favicon
}

const resolveUrl = (favicon, link) => {
  if (favicon.url && favicon.url.startsWith('//')) {
    favicon.url = 'https:' + favicon.url
  } else if (favicon.url && favicon.url.startsWith('/')) {
    favicon.url = (link.endsWith('/') ?
      link.substring(0, link.length - 1) :
      link
    ) + favicon.url
  } else if (!favicon.url && favicon.path) {
    if (favicon.path.startsWith('//')) {
      favicon.url = 'https:' + favicon.path
    } else {
      favicon.url = link.substring(0, link.length - 1) + favicon.path
    }
  }
  return favicon
}

const getColor = (body) => {
  const themeColor = /<meta.*?name="theme-color".*?content="(.*?)"/.exec(body)
  const tileColor = /<meta.*?name="msapplication-TileColor".*?content="(.*?)"/.exec(body)
  let color
  if (themeColor && themeColor.length > 0 && themeColor[1] !== '#ffffff') {
    color = themeColor[1]
  } else if (tileColor && tileColor.length > 0 && tileColor[1] !== '#ffffff') {
    color = tileColor[1]
  }
  return color
}

const getColorFromFavicon = async (faviconUrl, fileName) => {
  const path = `/tmp/${fileName}.png`
  return rp.get({
    url: derelativise(faviconUrl),
    encoding: null
  })
    .then(res => {
      const buffer = Buffer.from(res, 'utf8')
      fs.writeFileSync(path, buffer)
      return ColorThief.getPalette(path)
    })
    .then(palette => {
      return `rgb(${palette[0].join(',')})`
    })
}

const knownSites = [
  {
    url: 'https://sidebar.io/',
    favicon: 'https://sidebar.io/img/favicon/favicon-32x32.png',
    color: '#f36c3d'
  }
]
