import {id} from '../../utils'
// import { filterItemsForStale } from '../realm/stale-items'


export const getUnreadItems = async function (oldItems, readItems, currentItem, feeds) {
  let newItems
  let latestDate = 0
  if (oldItems.length > 0) {
    latestDate = [ ...oldItems ].sort((a, b) => b.created_at - a.created_at)[0].created_at
  }
  try {
    let unreadItemArrays = await fetchUnreadItems(feeds)

    unreadItemArrays = extractErroredFeeds(unreadItemArrays)

    newItems = unreadItemArrays.reduce((accum, unread) => accum.concat(unread), [])
    // if (__DEV__) {
    //   newItems = newItems.slice(0, 100)
    // }
    // console.log(`Fetched ${newItems.length} items`)
    // console.log(newItems)
    let { read, unread } = mergeItems(oldItems, newItems, currentItem)

    // console.log(`And now I have ${unread.length} unread items`)
    newItems = unread.sort((a, b) => moment(a.date_published).unix() - moment(b.date_published).unix());
  } catch (error) {
    console.log(error)
  }
  return { newItems, readItems: read }
}

function extractErroredFeeds (unreadItemsArrays) {
  let errored = unreadItemsArrays.filter(uia => uia.message)
  errored.forEach(({feed, message}) => {
    console.log(`${feed.title} has errored: ${message}`)
  })
  return unreadItemsArrays.filter(uia => uia.length)
}

const fetchUnreadItems = (feeds) => {
  const promises = feeds.filter(feed => !!feed).map(feed => {
    const url = `https://api.rizzle.net/feed/?url=${feed.url}`
    // const url = `http://localhost:8080/feed/?url=${feed.url}`
    return fetch(url).then(response => {
      return { response, feed }
    }).then(({response, feed}) => {
        if (!response.ok) {
          throw {
            feed,
            message: response.statusText
          }
        }
        return response.json().then(json => {
          return { json, feed }
        })
    }).then(({json, feed}) => json.map(mapRizzleServerItemToRizzleItem).map(item => {
      return {
        ...item,
        feed_title: feed.title,
        feed_id: feed._id,
        feed_color: feed.color
      }
    })).catch(({feed, message}) => {
      return {feed, message}
    })

    //   if (!response.ok) {
    //     throw Error(response.statusText)
    //   }
    //   return response
    // })
    // .then((response) => response.json())
    // .then((json) => {
    //   return json.map(mapRizzleServerItemToRizzleItem)
    // })
  })
  return Promise.all(promises)
}

export const markItemRead = (item) => {}

export const markFeedRead = (item) => {}

const mapRizzleServerItemToRizzleItem = (item) => {
  return {
    _id: id(item),
    id: item.guid,
    url: item.link,
    external_url: item.link,
    title: item.title,
    content_html: item.description,
    date_published: item.pubdate,
    date_modified: item.pubdate,
    created_at: item.pubdate,
    author: item.author,
    feed_title: item.feed_name,
    feed_id: item.feed_id
  }
}


// {"title":"Do You Weigh More at the Equator or at the North Pole?","description":"In which a physics professor very severely overthinks his daughter's science homework.","summary":"In which a physics professor very severely overthinks his daughter's science homework.","date":"2018-04-05T14:00:00.000Z","pubdate":"2018-04-05T14:00:00.000Z","pubDate":"2018-04-05T14:00:00.000Z","link":"https://www.wired.com/story/do-you-weigh-more-at-the-equator-or-at-the-north-pole","guid":"5ac506b428f0c90b2647ac58","author":"Rhett Allain","comments":null,"origlink":null,"image":{"url":"https://media.wired.com/photos/5ac561a15d6b7160f7e186f4/master/pass/scale-111953044.jpg"},"source":{},"categories":["Science","Science / Dot Physics"],"enclosures":[{"url":null,"type":null,"length":null}],"rss:@":{},"rss:title":{"@":{},"#":"Do You Weigh More at the Equator or at the North Pole?"},"rss:description":{"@":{},"#":"In which a physics professor very severely overthinks his daughter's science homework."},"rss:link":{"@":{},"#":"https://www.wired.com/story/do-you-weigh-more-at-the-equator-or-at-the-north-pole"},"rss:guid":{"@":{"ispermalink":"false"},"#":"5ac506b428f0c90b2647ac58"},"rss:pubdate":{"@":{},"#":"Thu, 05 Apr 2018 14:00:00 +0000"},"media:content":{"@":{}},"rss:category":[{"@":{},"#":"Science"},{"@":{},"#":"Science / Dot Physics"}],"media:keywords":{"@":{},"#":"Gravity, circular motion, physics"},"dc:creator":{"@":{},"#":"Rhett Allain"},"dc:modified":{"@":{},"#":"Thu, 05 Apr 2018 15:36:32 +0000"},"dc:publisher":{"@":{},"#":"Condé Nast"},"media:thumbnail":{"@":{"url":"https://media.wired.com/photos/5ac561a15d6b7160f7e186f4/master/pass/scale-111953044.jpg","width":"2400","height":"1607"}},"meta":{"#ns":[{"xmlns:atom":"http://www.w3.org/2005/Atom"},{"xmlns:dc":"http://purl.org/dc/elements/1.1/"},{"xmlns:media":"http://search.yahoo.com/mrss/"}],"@":[{"xmlns:atom":"http://www.w3.org/2005/Atom"},{"xmlns:dc":"http://purl.org/dc/elements/1.1/"},{"xmlns:media":"http://search.yahoo.com/mrss/"}],"#xml":{"version":"1.0","encoding":"utf-8"},"#type":"rss","#version":"2.0","title":"Wired","description":"The latest from www.wired.com","date":"2018-04-05T16:16:15.000Z","pubdate":"2018-04-05T16:16:15.000Z","pubDate":"2018-04-05T16:16:15.000Z","link":"https://www.wired.com/","xmlurl":"https://www.wired.com/feed/rss","xmlUrl":"https://www.wired.com/feed/rss","author":null,"language":"en","favicon":null,"copyright":"© Condé Nast 2018","generator":null,"cloud":{},"image":{},"categories":[],"rss:@":{},"rss:title":{"@":{},"#":"Wired"},"rss:description":{"@":{},"#":"The latest from www.wired.com"},"rss:link":{"@":{},"#":"https://www.wired.com/"},"atom:link":{"@":{"href":"https://www.wired.com/feed/rss","rel":"self","type":"application/rss+xml"}},"rss:copyright":{"@":{},"#":"© Condé Nast 2018"},"rss:language":{"@":{},"#":"en"},"rss:lastbuilddate":{"@":{},"#":"Thu, 05 Apr 2018 16:16:15 +0000"}}}