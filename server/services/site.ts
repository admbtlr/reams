import axios from 'axios'

// extended determines how far we want to go looking
// this lets us make multiple requests, one for a simple search, one for
// extended search, so that we get a more immediate response
export async function findFeeds (url, extended) {
  let feeds = []
  let matches = url.match(/(http[s]*:\/\/.+?(\/|$))/)
  if (!matches || matches.length === 0) {
    return
  }
  let homeUrl = matches[1]
  console.log(`Checking ${homeUrl}`)

  try {
    // start with the current page
    console.log(`Sending request to ${url}`)
    let res = await axios.get(url, {
      timeout: 5000,
      maxRedirects: 5
    })
    let body = res.data
    feeds = feeds.concat(checkForHeader(body, homeUrl))
    if (feeds.length === 0) {
      feeds = feeds.concat(checkForLinks(body, homeUrl))
    }

    console.log("State of feeds after first round: " + JSON.stringify(feeds))

    if (extended) {
      // now try the homepage
      res = await axios.get(homeUrl, {
        timeout: 5000,
        maxRedirects: 5
      })
      body = res.data
      feeds = feeds.concat(checkForHeader(body, homeUrl))
      feeds = feeds.concat(checkForLinks(body, homeUrl))
      feeds = feeds.concat(await checkKnownRssLocations(url))
        .filter((feed, index, self) => self.indexOf(feed) === index)

      // now examine the feed pages we've found
      let extraFeeds = []
      console.log('Looking for links in found feed pages')
      for (const feed of feeds) {
        console.log(`Now checking for links within ${feed}`)
        res = await axios.get(feed)
        if (res.headers['content-type'] && 
          res.headers['content-type'].indexOf('text/html') !== -1) {
          const body = res.data
          extraFeeds = extraFeeds.concat(checkForLinks(body, homeUrl))
        }
      }
      feeds = feeds.concat(extraFeeds)
    }
  } catch (error) {
    console.log(`Error fetching page: ${error.message}`)
  } finally {
    let fullFeeds = []
    console.log('Got feeds: ' + feeds)
    for (let feed of feeds) {
      try {
        const res = await axios.get('https://api.rizzle.net/api/feed-title/?url=' + feed)
        if (res.data.title) {
          fullFeeds.push({
            title: res.data.title,
            description: res.data.description || 'No description',
            url: feed
          })
        }
      } catch (error) {
        console.log('ERROR GETTING FEEDS: ' + error)
      }
    }
    console.log(fullFeeds)

    return fullFeeds
  }
}

function checkForLinks (body: string, homeUrl: string) {
  let feeds = []
  let linkTag = checkForLinkToRssFile(body)
  if (linkTag) {
    console.log('FOUND RSS URL IN A LINK: ' + linkTag)
    feeds.push(parseLinkTag(linkTag, homeUrl))
  }

  linkTag = checkForLinkWithRssInText(body)
  if (linkTag) {
    console.log('FOUND RSS URL IN A LINK WITH RSS TEXT: ' + linkTag)
    feeds.push(parseLinkTag(linkTag, homeUrl))
  }
  return feeds
}

function checkForHeader (body: string, homeUrl: string) {
  let feeds = []
  let linkTag = checkForRSSHeader(body)
  if (linkTag) {
    console.log('FOUND RSS URL IN HEADER: ' + linkTag)
    feeds.push(parseLinkTag(linkTag, homeUrl))
  }
  return feeds
}

function checkForRSSHeader (body: string) : string {
  // matches = body.match(/(\<link[^>]*?rel="alternate".*?(rss|atom)\+xml.*\>)/)
  const matches: string[] = body.match(/<link[^>]*?rel="alternate"[^>]*?(rss|atom)\+xml.*?>/)
  return (matches && matches.length > 0) ?
    matches[0] :
    null
}

function checkForLinkToRssFile (body: string) : string {
  // console.log('Full body length: ' + body.length)
  // console.log('Now checking for links to rss files')
  body = body.replace(/<script[^]*?<\/script>/mg, '')
  // console.log(body)
  // console.log('Scriptless body length: ' + body.length)
  // look for links to rss files
  const now = Date.now()
  let matches: string[] = body.match(/<a.*?href.*?>/g)
  var regex1 = /<a.*?href.*?\.(rss|atom).*?>/
  var regex2 = /<a.*?href.*?rss.*?>/
  let feeds = matches.filter(m => regex1.test(m))
  feeds = feeds.concat(matches.filter(m => regex2.test(m)))
  // console.log(`Searching for links to RSS files took ${(Date.now() - now)}ms`)
  return (feeds && feeds.length > 0) ?
    feeds[0] :
    null
}

function checkForLinkWithRssInText (body: string) : string {
  // console.log('Checking for link with RSS in text')
  body = body.replace(/<script[^]*?<\/script>/mg, '')
  const now = Date.now()
  const matches: string[] = body.match(/href[^>]*?>(rss|atom)/i)
  // console.log(`Searching for links with RSS in text took ${(Date.now() - now)}ms`)
  return (matches && matches.length > 0 && matches[0]) ?
    matches[0] :
    null
}

async function checkKnownRssLocations (url: string) : Promise<string[]> {
  // Wordpress: /feed and /<page>/feed
  // Tumblr: /rss
  let feeds = []
  let matches = url.match(/(http[s]*:\/\/.+?(\/|$))(.*?(\/|$))/)
  const host = matches[1].charAt(matches[1].length - 1) === '/' ?
    matches[1] :
    matches[1] + '/'
  const subfolder = matches[3].length > 0 ?
    (matches[3].indexOf('/') === matches[3].length - 1 ?
      matches[3] :
      matches[3] + '/') :
    ''
  // console.log('URL: ' + url)
  // console.log('SUBFOLDER: ' + subfolder)

  let feedUrl: string
  let res: Response

  feedUrl = host + 'feed'

  // bent throws an error if it doesn't get a 200
  try {
    // console.log(`Checking ${host}feed`)
    await axios.get(feedUrl)
    feeds.push(feedUrl)
  } catch (error) {}

  try {
    // console.log(`Checking ${host}${subfolder}feed`)
    feedUrl = host + subfolder + 'feed'
    await axios.get(feedUrl)
    feeds.push(feedUrl)
  } catch (error) {}

  try {
    // console.log(`Checking ${host}rss`)
    feedUrl = host + 'rss'
    await axios.get(feedUrl)
    feeds.push(feedUrl)
  } catch (error) {}

  return feeds
}


function parseLinkTag (linkTag: string, homeUrl: string) : string {
  let rssUrl = linkTag && linkTag.match(/href="(.*?)"/)[1]
  // console.log('MATCHING...')
  if (!rssUrl.startsWith('http')) {
    rssUrl = (homeUrl + rssUrl)
    rssUrl = rssUrl.replace(/([^:])\/\//, '$1/')
  }
  // console.log(`Found an RSS feed: ${rssUrl}`)
  return rssUrl
}
