const FeedParser = require('feedparser')
const request = require('request')
const iconv = require('iconv-lite')
const zlib = require('zlib')

export { fetchStories, filterStories, getTitleAndDescription }

const MIN_ITEMS_PER_FEED = 5

const fetchStories = async (feedUrl, includeMeta = false) : Promise<[]> => {
  return new Promise((resolve, reject) => {
    fetch(feedUrl, resolve, reject, includeMeta)
  })
}

const getTitleAndDescription = async (feedUrl) => {
  return fetchStories(feedUrl, true)
    .then((stories: { meta }[]) => {
      if (stories !== undefined && stories[0]) {
        const meta = stories[0].meta
        return {
          title: meta.title,
          description: meta.description
        }
      } else {
        return {}
      }
    })
}

const fetch = (feedUrl, done, fail, includeMeta) => {
  let items = []

  var feedparser = new FeedParser()

  // make sure we're getting the last redirect URL
  var finalUrl = feedUrl

  var done = done
  var fail = fail

  var redirectReq = request(feedUrl, {
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
      .on('error', function (error) {
        // console.log(error)
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
        res = maybeTranslate(res, charset, done)
        res.pipe(feedparser)
      })
  })

  feedparser.on('error', (error) => {
    console.log(`That's an error... (${finalUrl})`)
    console.log(error)
    // fail ? fail(error) : console.log(error)
  })

  feedparser.on('end', () => {
    done(items)
  })

  feedparser.on('readable', function () {
    let item
    while (item = this.read()) {
      items.push(filterFields(item, includeMeta))
    }
    // return this.read()
  })

  return feedparser
}

const filterStories = (stories: { pubdate: number }[], lastUpdated) => {
  const parseDate = (date) => typeof date !== 'number'
    ? Date.parse(date)
    : date

  if (stories && stories.length) {
    // only get stories from the last 60 days
    // but make sure that there are at least MIN_ITEMS_PER_FEED per feed
    stories = stories.map(story => ({
      ...story,
      pubdate: parseDate(story.pubdate)
    }))
    let cutoff = Date.now() - 1000 * 60 * 60 * 24 * 60
    let filteredStories = stories.filter(story => story.pubdate > cutoff)
    if (filteredStories.length < MIN_ITEMS_PER_FEED) {
      filteredStories = stories.sort((a, b) => a.pubdate - b.pubdate)
        .slice(0 - MIN_ITEMS_PER_FEED)
    }
    if (lastUpdated) {
      filteredStories = filteredStories.filter(story => story.pubdate > lastUpdated)
    }
    return filteredStories
  } else {
    return stories
  }
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

function maybeTranslate (res, charset, done) {
  // Use iconv if its not utf8 already.
  if (charset && !/utf-*8/i.test(charset)) {
    try {
      // console.log('Converting from charset %s to utf-8', charset)
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

function filterFields(item, includeMeta) {
  let toRemove = [
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
    'dc:date'
  ]
  if (!includeMeta) {
    toRemove.push('meta')
  }
  toRemove.forEach(field => {
    delete item[field]
  })
  return item
}
