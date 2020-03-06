import { NowRequest, NowResponse } from '@now/node'
import { findFeeds } from '../services/site'

export default async (req: NowRequest, res: NowResponse) => {
  const siteUrl = req.query.url || 'https://www.theguardian.com/'
  const feeds = await findFeeds(siteUrl)
  res.json(feeds)
}
