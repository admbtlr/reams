const express = require('express')
const request = require ('request')
const app = express();

app.get('/api/unread/', (req, res) => {
  const unreadUrl = 'https://feedwrangler.net/api/v2/feed_items/list?access_token=07de039941196f956e9e86e202574419&read=false'
  request(unreadUrl).pipe(res)
})

app.get('/api/mercury/', (req, res) => {
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

// Serve index page
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/build/index.html');
});

/******************
 *
 * Express server
 *
 *****************/

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log('Essential React listening at http://%s:%s', host, port);
});
