import { NowRequest, NowResponse } from '@now/node'
const Mercury = require('@postlight/mercury-parser')

export default async (req: NowRequest, res: NowResponse) => {
  Mercury.parse(req.query.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1'
    }
  }).then(parsed => {
    res.send(parsed)
  }).catch(error => {
    res.send({
      error
    })
  })
}
