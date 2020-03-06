import { NowRequest, NowResponse } from '@now/node'
import { fetchStories, filterStories } from '../services/feed'

export default async (req: NowRequest, res: NowResponse) => {
  const feeds = req.body.feeds
  const promises = feeds.map(feed => {
    return fetchStories(feed.url)
      .then(items => {
        return filterStories(items, feed.lastUpdated || 0)
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
      res.send(itemsArray.reduce((accum: [], items: []) => accum.concat(items), []))
    })
}
