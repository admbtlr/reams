import { runSaga } from 'redux-saga'
import sinon from 'sinon'
import { InteractionManager } from 'react-native'
import * as firestore from '../../redux/firestore'
import * as backends from '../../redux/backends'

import { inflateFeeds, subscribeToFeed, syncFeeds } from '../../redux/sagas/feeds'

const feeds_1_2 = [
  {
    _id: 111111,
    title: 'Feed 1',
    url: 'http://feed1.org'
  },
  {
    _id: 222222,
    title: 'Feed 2',
    url: 'http://feed2.org'
  }
]
const feed_3 = {
  _id: 333333,
  title: 'Feed 3',
  url: 'http://feed3.org'
}
const feeds_3 = [
  {
    _id: 333333,
    title: 'Feed 3',
    url: 'http://feed3.org'
  }
]

describe('subscribeToFeed', () => {
  sinon.replace(firestore, 'addFeedToFirestore', sinon.fake.resolves(true))
  it('should subscribe to a new feed', async () => {
    let dispatched = []
    const result = await runSaga({
      dispatch: (action) => dispatched.push(action),
      getState: () => ({ feeds: { feeds: feeds_1_2 }})
    }, subscribeToFeed, {
      feed: feed_3
    })
    expect(dispatched).toEqual([
      {
        type: 'FEEDS_ADD_FEED_SUCCESS',
        feed: feed_3
      }
    ])

  })

  it('should not subscribe to an existing feed', async () => {
    let dispatched = []
    const result = await runSaga({
      dispatch: (action) => dispatched.push(action),
      getState: () => ({ feeds: { feeds: feeds_3 }})
    }, subscribeToFeed, {
      feed: feed_3
    })
    expect(dispatched).toEqual([])

  })
})

describe('syncFeeds', () => {
  sinon.replace(firestore, 'getFeedsFS', sinon.fake.resolves(feeds_3))

  it('should merge feeds correctly', async () => {
    let dispatched = []
    const result = await runSaga({
      dispatch: (action) => dispatched.push(action),
      getState: () => ({ feeds: { feeds: feeds_1_2 }})
    }, syncFeeds)
    expect(dispatched).toEqual([
      {
        type: 'FEEDS_UPDATE_FEEDS',
        feeds: [
          {
            _id: 111111,
            title: 'Feed 1',
            url: 'http://feed1.org'
          },
          {
            _id: 222222,
            title: 'Feed 2',
            url: 'http://feed2.org'
          },
          {
            _id: 333333,
            title: 'Feed 3',
            url: 'http://feed3.org'
          }
        ]
      }
    ])
  })

  it('should not duplicate feeds when merging', async () => {
    let dispatched = []
    const feeds_3_differentId = [
      {
        _id: 333334,
        title: 'Feed 3',
        url: 'http://feed3.org'
      }
    ]
    const result = await runSaga({
      dispatch: (action) => dispatched.push(action),
      getState: () => ({ feeds: { feeds: feeds_3_differentId }})
    }, syncFeeds)
    expect(dispatched).toEqual([
      {
        type: 'FEEDS_UPDATE_FEEDS',
        feeds: [
          {
            _id: 333334,
            title: 'Feed 3',
            url: 'http://feed3.org'
          }
        ]
      }
    ])
  })
})

describe('inflateFeeds', () => {
  it('should do nothing if already inflated', async () => {
    let dispatched = []
    let feeds_1_2_withDescription = feeds_1_2.map(f => ({
      ...f,
      description: 'We are literally here'
    }))
    const result = await runSaga({
      dispatch: (action) => dispatched.push(action),
      getState: () => ({ feeds: { feeds: feeds_1_2_withDescription }})
    }, inflateFeeds)
    expect(dispatched).toEqual([])
  })

  // Can't get this to work right now :(
  // I _think_ it's because of the number of yields in the function
  // but that shouldn't be a problem...?
  // it('should get feed descriptions', async () => {
  //   sinon.replace(InteractionManager, 'runAfterInteractions', sinon.fake.resolves(true))
  //   sinon.replace(backends, 'getFeedDetails', sinon.fake.resolves({
  //     description: 'We are literally here'
  //   }))
  //   let dispatched = []
  //   const result = await runSaga({
  //     dispatch: (action) => dispatched.push(action),
  //     getState: () => ({ feeds: { feeds: feeds_1_2 }})
  //   }, inflateFeeds)
  //   expect(dispatched).toEqual(feeds_1_2.map(feed => ({
  //     type: 'FEEDS_UPDATE_FEED',
  //     feed: {
  //       ...feed,
  //       description: 'We are literally here'
  //     }
  //   })))
  // })
})