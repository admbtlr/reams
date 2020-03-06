import { NowRequest, NowResponse } from '@now/node'
const { fetchStories, filterStories } = require('../services/feed')

export default async (req: NowRequest, res: NowResponse) => {
  const feedUrl = req.query.url || 'https://www.vox.com/recode'
  const lastUpdated = req.query.lastUpdated || 0

  fetchStories(feedUrl)
    .then(items => {
      res.send(filterStories(items, lastUpdated))
    })
    .catch(err => {
      res.send([])
    })
}
