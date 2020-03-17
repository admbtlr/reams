import { NowRequest, NowResponse } from '@now/node'
import { getTitleAndDescription } from '../services/feed'

export default async (req: NowRequest, res: NowResponse) => {
  const feedUrl = req.query.url || 'https://www.theguardian.com/world/rss'
  const titleDesc = await getTitleAndDescription(feedUrl)
  res.json(titleDesc)
}
