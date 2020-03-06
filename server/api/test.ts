import { NowRequest, NowResponse } from '@now/node'
const feedService = require('../services/feed.js')

export default async (req: NowRequest, res: NowResponse) => {
  const feedUrl = req.query.url || 'https://www.theguardian.com/world/rss'
  const titleDesc = await feedService.getTitleAndDescription(feedUrl)
  res.json(titleDesc)
}