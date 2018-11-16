const express = require('express')
const request = require ('request')
const FeedParser = require('feedparser')
const Iconv = require('iconv').Iconv
const zlib = require('zlib')

const app = express()

const MIN_ITEMS_PER_FEED = 5

app.get('/unread/', (req, res) => {
  const unreadUrl = 'https://feedwrangler.net/api/v2/feed_items/list?access_token=07de039941196f956e9e86e202574419&read=false'
  request(unreadUrl).pipe(res)
})

app.get('/mercury/', (req, res) => {
  const apiKey = 'vTNatJB4JsgmfnKysiE9cOuJonFib4U9176DRF2z'
  const postlightUrl = 'https://mercury.postlight.com/parser?url='+encodeURIComponent(req.query.url)
  const headers = {
    'x-api-key': apiKey
  }
  request({
    url: postlightUrl,
    headers: headers
  }).pipe(res)
})

app.get('/feed/', (req, res) => {
  const feedUrl = req.query.url || 'https://www.theguardian.com/world/rss'
  fetch(feedUrl, (items) => {
    if (items && items.length) {
      // only get items from the last 60 days
      // but make sure that there are at least MIN_ITEMS_PER_FEED per feed
      const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 60
      let filteredItems = items.filter(item => item.pubdate > cutoff)
      if (filteredItems.length < MIN_ITEMS_PER_FEED) {
        filteredItems = items.sort((a, b) => a.pubdate - b.pubdate)
          .slice(0 - MIN_ITEMS_PER_FEED)
      }
      res.send(filteredItems)
    } else {
      res.send(items)
    }
  })
})

// Serve index page
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/build/index.html')
})

function fetch (feed, done) {
  let items = []

  var feedparser = new FeedParser()

  // make sure we're getting the last redirect URL
  var finalUrl = feed

  var done = done

  var redirectReq = request(feed, {
    method: 'HEAD',
    followAllRedirects: true
  }, (err, response, body) => {
    if (err) {
      console.log('ERROR: ' + err)
      done(items)
      return
    }
    finalUrl = response.request.href
    console.log(finalUrl)
    var req = request(finalUrl, {
      timeout: 10000,
      pool: false
    })

    req.setMaxListeners(50)
    // Some feeds do not respond without user-agent and accept headers.
    req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36')
    req.setHeader('accept', 'text/html,application/xhtml+xml')

    // Define our handlers
    req.on('response', function (res) {
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
    console.log("That's an error...")
    // console.log(error)
    // done([])
  })

  feedparser.on('end', () => {
    done(items)
  })

  feedparser.on('readable', function () {
    let item
    while (item = this.read()) {
      items.push(item)
    }
    // return this.read()
  })

  return feedparser
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
  var iconv
  // Use iconv if its not utf8 already.
  if (!iconv && charset && !/utf-*8/i.test(charset)) {
    try {
      iconv = new Iconv(charset, 'utf-8')
          console.log('Converting from charset %s to utf-8', charset)
          iconv.on('error', done)
          // If we're using iconv, stream will be the output of iconv
      // otherwise it will remain the output of request
      res = res.pipe(iconv)
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
