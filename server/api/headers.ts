import { NowRequest, NowResponse } from '@now/node'

export default async (req: NowRequest, res: NowResponse) => {
  console.log(req.headers)
  res.send(req.headers)
}
