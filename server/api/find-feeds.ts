import { NowRequest, NowResponse } from '@now/node'
import { findFeeds } from '../services/site'

export default async (req: NowRequest, res: NowResponse) => {
  const siteUrl = req.query.url || 'http://localhost:3000/api/headers'
  const extended = !!req.query.extended
  const feeds = await findFeeds(siteUrl, extended)
  res.json(feeds)
}
