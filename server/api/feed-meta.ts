import { NowRequest, NowResponse } from '@now/node'
import { fetchStories } from '../services/feed'
import { getMeta } from '../services/feed-meta'
import { derelativise } from '../services/url'

export default async (req: NowRequest, res: NowResponse) => {
  const feedUrl: string = typeof req.query.url === 'undefined' ?
    'https://www.theguardian.com/world/rss' :
    typeof req.query.url === 'object' ?
      req.query.url[0] :
      req.query.url
  const stories: [] = await fetchStories(derelativise(feedUrl), true)
  const meta = await getMeta(stories)
  res.send(meta)
}
