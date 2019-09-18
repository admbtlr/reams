const Mercury = require('@postlight/mercury-parser')

const express = require('express')
const request = require('request')
const FeedParser = require('feedparser')
const iconv = require('iconv-lite')
const zlib = require('zlib')
const parseFavicon = require('parse-favicon')

const app = express()
app.use(express.urlencoded())
app.use(express.json())

const MIN_ITEMS_PER_FEED = 5

app.get('/unread/', (req, res) => {
  const unreadUrl = 'https://feedwrangler.net/api/v2/feed_items/list?access_token=07de039941196f956e9e86e202574419&read=false'
  request(unreadUrl).pipe(res)
})

app.get('/mercury/', (req, res) => {
  Mercury.parse(req.query.url).then(parsed => {
    res.send(parsed)
  }).catch(error => {
    res.send({
      error
    })
  })
})

app.post('/feeds/', (req, res) => {
  // console.log(req)
  // console.log(req.body)
  const feeds = req.body.feeds
  const promises = feeds.map(feed => {
    return fetchProm(feed.url)
      .then(items => {
        return filterItems(items, feed.lastUpdated || 0)
          .map(item => ({
            ...item,
            feed_id: feed._id
          }))
      })
      .catch(err => {
        return []
      })
  })
  Promise.all(promises)
    .then(itemsArray => {
      res.send(itemsArray.reduce((accum, items) => accum.concat(items), []))
    })
})

app.get('/feed/', (req, res) => {
  const feedUrl = req.query.url || 'https://www.vox.com/recode'
  const lastUpdated = req.query.lastUpdated || 0

  fetchProm(feedUrl)
    .then(items => {
      res.send(filterItems(items, lastUpdated))
    })
    .catch(err => {
      res.send([])
    })
})

app.get('/feed-meta/', (req, res) => {
  let feedMeta
  const feedUrl = req.query.url || 'https://www.theguardian.com/world/rss'
  const readMeta = (items) => {
    if (items && items.length) {
      const meta = items[0].meta
      // console.log(meta)
      feedMeta = {
        description: meta.description,
        favicon: meta.favicon,
        image: meta.image.url,
        link: meta.link,
        color: meta.color
      }
      // res.send(feedMeta)
      getFavicon(feedMeta, res)
    } else {
      res.send({})
    }
  }
  const getFavicon = (feedMeta, res) => {
    request(feedMeta.link, (err, resp, body) => {
      if (err) {
        console.log(err)
        res.send(feedMeta)
      }
      parseFavicon.parseFavicon(body, {}).then(favicons => {
        let favicon
        const getSize = f => f.size
          ? f.size.split('x')[0]
          : 0
        if (favicons && favicons.length > 0) {
          favicons = favicons.sort((a, b) => getSize(a) - getSize(b))
            .filter(f => f.type && f.type === 'image/png')
          if (favicons.length) {
            // try and get the smallest one larger than 63
            favicon = favicons.find(f => getSize(f) > 63)
             || favicons[0]
          }
        }
        if (favicon) {
          if (favicon.url && favicon.url.startsWith('//')) {
            favicon.url = 'https:' + favicon.url
          } else if (favicon.url && favicon.url.startsWith('/')) {
            favicon.url = (feedMeta.link.endsWith('/') ?
              feedMeta.link.substring(0, feedMeta.link.length - 1) :
              feedMeta.link
            ) + favicon.url
          } else if (!favicon.url && favicon.path) {
            favicon.url = feedMeta.link.substring(0, feedMeta.link.length - 1) + favicon.path
          }
        }
        feedMeta.favicon = favicon
        res.send(feedMeta)
      }).catch(err => {
        res.send(feedMeta)
      })
    })
  }

  fetch(feedUrl, readMeta, () => res.send(), true)
})

// Serve index page
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/build/index.html')
})

function filterItems (items, lastUpdated) {
  const parseDate = (date) => typeof date !== 'number'
    ? Date.parse(date)
    : date

  if (items && items.length) {
    // only get items from the last 60 days
    // but make sure that there are at least MIN_ITEMS_PER_FEED per feed
    items = items.map(item => ({
      ...item,
      pubdate: parseDate(item.pubdate)
    }))
    let cutoff = Date.now() - 1000 * 60 * 60 * 24 * 60
    let filteredItems = items.filter(item => item.pubdate > cutoff)
    if (filteredItems.length < MIN_ITEMS_PER_FEED) {
      filteredItems = items.sort((a, b) => a.pubdate - b.pubdate)
        .slice(0 - MIN_ITEMS_PER_FEED)
    }
    if (lastUpdated) {
      filteredItems = filteredItems.filter(item => item.pubdate > lastUpdated)
    }
    return filteredItems
  } else {
    return items
  }
}


function fetchProm (feed) {
  return new Promise((resolve, reject) => {
    fetch(feed, resolve, reject)
  })
}

function fetch (feed, done, fail, includeMeta) {
  let items = []

  var feedparser = new FeedParser()

  // make sure we're getting the last redirect URL
  var finalUrl = feed

  var done = done
  var fail = fail

  var redirectReq = request(feed, {
    method: 'HEAD',
    followAllRedirects: true
  }, (err, response, body) => {
    if (err) {
      done(items)
      return
    }
    finalUrl = response.request.href
    var req = request(finalUrl, {
      timeout: 10000,
      pool: false
    })

    req.setMaxListeners(50)
    // Some feeds do not respond without user-agent and accept headers.
    req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36')
    req.setHeader('accept', 'text/html,application/xhtml+xml')

    // Define our handlers
    req
      .on('error', function (err) {
        console.log(error)
        done(items)
        return
      })
      .on('response', function (res) {
        if (res.statusCode !== 200) {
          done(items)
          return
        }
        var encoding = res.headers['content-encoding'] || 'identity'
        var charset = getParams(res.headers['content-type'] || '').charset
        res = maybeDecompress(res, encoding)
        res = maybeTranslate(res, charset)
        res.pipe(feedparser)
      })
  })

  feedparser.on('error', (error) => {
    console.log(`That's an error... (${finalUrl})`)
    fail ? fail(error) : console.log(error)
  })

  feedparser.on('end', () => {
    done(items)
  })

  feedparser.on('readable', function (includeMeta) {
    let item
    while (item = this.read()) {
      items.push(filterFields(item, includeMeta))
    }
    // return this.read()
  })

  return feedparser
}

function filterFields(item, includeMeta) {
  const toRemove = [
    'summary',
    'date',
    'comments',
    'origlink',
    'image',
    'enclosures',
    'rss:@',
    'rss:title',
    'rss:description',
    'rss:link',
    'rss:category',
    'rss:pubdate',
    'permalink',
    'rss:guid',
    'media:content',
    'dc:creator',
    'dc:date',
    'meta'
  ]
  toRemove.forEach(field => {
    delete item[field]
  })
  return item
}

function maybeDecompress (res, encoding) {
  var decompress;
  if (encoding.match(/\bdeflate\b/)) {
    decompress = zlib.createInflate();
  } else if (encoding.match(/\bgzip\b/)) {
    decompress = zlib.createGunzip();
  }
  return decompress ? res.pipe(decompress) : res;
}

function maybeTranslate (res, charset) {
  // Use iconv if its not utf8 already.
  if (charset && !/utf-*8/i.test(charset)) {
    try {
      iconv = new Iconv(charset, 'utf-8')
      console.log('Converting from charset %s to utf-8', charset)
      iconv.on('error', done)
      // If we're using iconv, stream will be the output of iconv
      // otherwise it will remain the output of request
      res = res.pipe(iconv.decodeStream(charset))
        .pipe(iconv.encodeStream('utf-8'))
    } catch(err) {
      res.emit('error', err)
    }
  }
  return res
}

function getParams (str) {
  var params = str.split(';').reduce(function (params, param) {
    var parts = param.split('=').map(function (part) { return part.trim(); })
      if (parts.length === 2) {
      params[parts[0]] = parts[1]
        }
    return params
    }, {})
  return params
}

const port = process.env.PORT || 8080
const server = app.listen(port, () => {
  const host = server.address().address
  const port = server.address().port

  console.log('Rizzle API listening at http://%s:%s', host, port)
});
