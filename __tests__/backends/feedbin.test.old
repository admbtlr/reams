import { fetchItems } from '../../backends/feedbin.js'
global.fetch = require('jest-fetch-mock')

beforeEach(() => {
  fetch.resetMocks()
})

test('gets next page', async () => {
  fetch.mockResponses(
    [
      JSON.stringify({ items: [{id: 1 }]}),
      { headers: { 'Links': '<https://test.com>; rel="next", <def>; rel="last"' } }
    ],
    [
      JSON.stringify({ items: [{id: 2 }]}),
    ])
  await fetchItems(jest.fn(), 'unread', 1)
  expect(fetch.mock.calls[1][0]).toEqual('https://test.com')
})

test('returns paginated results', async () => {
  fetch.mockResponses(
    [
      JSON.stringify({ items: [{id: 1 }]}),
      { headers: { 'Links': '<https://test.com>; rel="next", <def>; rel="last"' } }
    ],
    [
      JSON.stringify({ items: [{id: 2 }]}),
    ])
  const callback = jest.fn()
  await fetchItems(callback, 'unread', 1)
  expect(callback).toHaveBeenCalledWith(
    [
      { 
        "id": 1
      }, { 
        "id": 2
      }
    ]
  )
})