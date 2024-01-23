import { runSaga } from 'redux-saga'
import sinon from 'sinon'

import {
  CREATE_CATEGORY,
  CREATE_CATEGORY_REMOTE,
  DELETE_CATEGORY,
  UPDATE_CATEGORIES,
  UPDATE_CATEGORY,
} from '../../store/categories/types'
import * as backends from '../../backends'
import * as utils from '../../utils'

import { getCategories, createCategory } from '../../sagas/categories'

const categories = [{
  id: 1,
  _id: '123',
  name: 'Category 1',
  feeds: ['feed_1', 'feed_2']
}, {
  id: 2,
  _id: '123',
  name: 'Category 2',
  feeds: ['feed_1', 'feed_2']
}]

const incomingCategories = [{
  id: 1,
  name: 'Category 1',
  feed_ids: [1, 2]
}, {
  id: 2,
  name: 'Category 2',
  feed_ids: [1, 2]
}]

const feeds = [{
  id: 1,
  _id: 'feed_1',
  name: 'Feed 1',
}, {
  id: 2,
  _id: 'feed_2',
  name: 'Feed 2',
}]

beforeEach(() => {
  sinon.restore()
})

describe('getCategories', () => {
  it('should get categories from backend and merge with state', async () => {
    let dispatched = []
    sinon.replace(utils, 'id', sinon.fake.returns('123'))
    sinon.replace(backends, 'getCategories', sinon.fake.resolves(incomingCategories))
    const result = await runSaga({
      dispatch: (action) => dispatched.push(action),
      getState: () => ({ 
        feeds: { feeds }, categories: { categories: [categories[0]] }
      })
    }, getCategories)
    expect(dispatched).toEqual([
      {
        type: UPDATE_CATEGORIES,
        categories
      }
    ])

  })

  it('should handle no categories', async () => {
    let dispatched = []
    sinon.replace(utils, 'id', sinon.fake.returns('123'))
    sinon.replace(backends, 'getCategories', sinon.fake.resolves([]))
    const result = await runSaga({
      dispatch: (action) => dispatched.push(action),
      getState: () => ({ 
        feeds: { feeds }, categories: { categories: [categories[0]] }
      })
    }, getCategories)
    expect(dispatched).toEqual([
      {
        type: UPDATE_CATEGORIES,
        categories: []
      }
    ])
  })

  it('should create categories remotely', async () => {
    let dispatched = []
    const result = await runSaga({
      dispatch: (action) => {
        return dispatched.push(action)
      },
      getState: () => ({ 
        remoteActionQueue: { actions: [] }
      })
    }, createCategory, { category: categories[0] })
    expect(dispatched).toEqual([
      {
        type: CREATE_CATEGORY_REMOTE,
        category: categories[0]
      }
    ])
  })
})

