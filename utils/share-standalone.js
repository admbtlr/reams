var fetch = require('/usr/local/lib/node_modules/node-fetch')

var checkForRSSHeader = function (body) {
  matches = body.match(/(\<link[^>]*?rel="alternate".*?(rss|atom)\+xml.*\>)/)
  return (matches && matches.length > 0) ?
    matches[1] :
    null
}

var checkForLinkToRssFile = function (body) {
  console.log('Full body length: ' + body.length)
  console.log('Now checking for links to rss files')
  body = body.replace(/<script[^]*?<\/script>/mg, '')
  // console.log(body)
  console.log('Scriptless body length: ' + body.length)
  // look for links to rss files
  matches = body.match(/<a.*?href.*?\.(rss|atom).*?>/)
  return (matches && matches.length > 0) ?
    matches[1] :
    null
}

var checkForLinkWithRssInText = function (body) {
  console.log('Checking for link with RSS in text')
  body = body.replace(/<script[^]*?<\/script>/mg, '')
  matches = body.match(/href[^>]*?>(rss|atom)/i)
  console.log(matches[0])
  return (matches && matches.length > 0) ?
    matches[0] :
    null
}

var searchForRSS = async function (url) {
    let matches = url.match(/(http[s]*:\/\/.+?(\/|$))/)
    if (!matches || matches.length === 0) {
      return
    }
    let homeUrl = matches[1]
    console.log(`Checking ${homeUrl}`)

    try {
      const res = await fetch(homeUrl)
      const body = await res.text()

      let linkTag = checkForRSSHeader(body)
      if (linkTag) return parseLinkTag(linkTag, homeUrl)

      linkTag = checkForLinkToRssFile(body)
      if (linkTag) return parseLinkTag(linkTag, homeUrl)

      linkTag = checkForLinkWithRssInText(body)
      if (linkTag) return parseLinkTag(linkTag, homeUrl)

      return null


    //   // <link rel="alternate" href="https://www.theguardian.com/international/rss" title="RSS" type="application/rss+xml">
    //   matches = body.match(/(\<link[^>]*?rel="alternate".*?(rss|atom)\+xml.*\>)/)
    //   if (matches && matches.length > 0) {
    //     let linkTag = matches[1]
    //     console.log(linkTag)
    //     return parseLinkTag(linkTag, homeUrl)
    //   } else {
    //     console.log('Full body length: ' + body.length)
    //     console.log('Now checking for links to rss files')
    //     body = body.replace(/<script[^]*?<\/script>/mg, '')
    //     // console.log(body)
    //     console.log('Scriptless body length: ' + body.length)
    //     // look for links to rss files
    //     matches = body.match(/<a.*?href.*?\.(rss|atom).*?>/)
    //     console.log('Matches? ' + matches)
    //     if (matches && matches.length > 0) {
    //       console.log('Got one!')
    //       linkTag = matches[0]
    //       return parseLinkTag(linkTag, homeUrl)
    //     } else {
    //       // look for links with "rss" in the text
    //       // matches = body.match(/<a[^>]*?href.*?>[^<]*?(rss|atom).*?<\/a>/i)
    //       matches = body.match(/<a[^<]*>(rss|atom)/i)

    //       if (matches && matches.length > 0) {
    //         // now we need to check whether this is an html page...
    //         const rssLink = parseLinkTag(matches[0], homeUrl)
    //         fetch(rssLink)
    //           .then(res => {
    //             const contentType = res.headers.get('content-type')
    //             if (contentType.indexOf('html') !== -1) {
    //               return fetch
    //             }
    //           })
    //       } else {
    //         return null
    //       }
    //     }
    //   }
    //   return null
    // // })
    // // .catch((error) => {
    } catch (error) {
      console.log(`Error fetching page: ${error.message}`)
      throw `Error fetching page: ${error.message}`
    }

}

var parseLinkTag = function (linkTag, homeUrl) {
  console.log(linkTag)
  var rssUrl = linkTag && linkTag.match(/href="(.*?)"/)[1]
  console.log('MATCHING...')
  if (!rssUrl.startsWith('http')) {
    rssUrl = (homeUrl + rssUrl)
    rssUrl = rssUrl.replace(/([^:])\/\//, '$1/')
  }
  console.log(`Found an RSS feed: ${rssUrl}`)
  return rssUrl
}

searchForRSS('http://www.newyorker.com/')