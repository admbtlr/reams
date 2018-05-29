var fetch = require('/usr/local/lib/node_modules/node-fetch')

var checkForRSSHeader = function (url) {
  var that = this
  var matches = url.match(/(http[s]*:\/\/.+?(\/|$))/)
  if (!matches || matches.length === 0) {
    return
  }
  var homeUrl = matches[1]
  console.log(`Checking ${homeUrl}`)

  var headers = new Headers({
    'Accept-Encoding': ''
  })

  return fetch(homeUrl)
    .then(res => {
      console.log(res)
      return res.text()
    })
    .then(body => {
      // console.log(body)
      // <link rel="alternate" href="https://www.theguardian.com/international/rss" title="RSS" type="application/rss+xml">
      matches = body.match(/(\<link[^>]*?rel="alternate".*?(rss|atom)\+xml.*\>)/)
      if (matches && matches.length > 0) {
        var linkTag = matches[1]
        console.log(linkTag)
        return parseLinkTag(linkTag, homeUrl)
      } else {
        console.log('Now checking for links to rss files')
        // console.log(body)
        // look for links to rss files
        matches = body.match(/<a.*?href.*?\.(rss|atom).*?>/)
        console.log(matches)
        if (!matches || matches.length === 0) {
          // look for links with "rss" in the text
          matches = body.match(/<a.*?href.*?>[^<]*?(rss|atom).*?>/)
          console.log(matches)
        }
        if (matches && matches.length > 0) {
          console.log('Got one!')
          linkTag = matches[0]
          return parseLinkTag(linkTag, homeUrl)
        }
      }
      return null
    })
    .catch((error) => {
      console.log(`Error fetching page: ${error.message}`)
      throw `Error fetching page: ${error.message}`
    })
}

var parseLinkTag = function (linkTag, homeUrl) {
  var rssUrl = linkTag && linkTag.match(/href="(.*?)"/)[1]
  console.log('MATCHING...')
  if (!rssUrl.startsWith('http')) {
    rssUrl = (homeUrl + rssUrl)
    rssUrl = rssUrl.replace(/([^:])\/\//, '$1/')
  }
  console.log(`Found an RSS feed: ${rssUrl}`)
  return rssUrl
}

checkForRSSHeader('http://www.thesartorialist.com/')