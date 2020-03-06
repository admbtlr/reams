// DEPRECATED!

const express = require('express')
const request = require('request')

const app = express()
app.use(express.urlencoded())
app.use(express.json())

const MIN_ITEMS_PER_FEED = 5

app.get('/unread/', (req, res) => {
  const unreadUrl = 'https://feedwrangler.net/api/v2/feed_items/list?access_token=07de039941196f956e9e86e202574419&read=false'
  request(unreadUrl).pipe(res)
})

app.get('/mercury/', (req, res) => {
  Mercury.parse(req.query.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1'
    }
  }).then(parsed => {
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
    return FeedService.fetchStories(feed.url)
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

  FeedService.fetchStories(feedUrl)
    .then(items => {
      res.send(filterItems(items, lastUpdated))
    })
    .catch(err => {
      res.send([])
    })
})

app.get('/feed-title/', async (req, res) => {
  const feedService = new FeedService()
  const feedUrl = req.query.url || 'https://www.theguardian.com/world/rss'
  const titleDesc = await feedService.getTitleAndDescription(feedUrl)
  res.send(titleDesc)
})

app.get('/feed-meta/', async (req, res) => {
  let feedMeta
  const feedUrl = req.query.url || 'https://www.theguardian.com/world/rss'

  fetch(derelativise(feedUrl), readMeta, () => res.send(), true)
})

// Serve index page
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/build/index.html')
})

function derelativise (url) {
  return url.indexOf('//') === 0 ?
  `https:${url}` :
  url
}

const port = process.env.PORT || 8080
const server = app.listen(port, () => {
  const host = server.address().address
  const port = server.address().port

  console.log('Rizzle API listening at http://%s:%s', host, port)
});
