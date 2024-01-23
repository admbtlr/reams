import React from 'react'
import { render, waitFor } from '../../test-utils'
import AppStateListener from '../../components/AppStateListener'

jest.mock('@react-native-community/clipboard')
jest.mock('react-native-shared-group-preferences', () => ({
  getItem: jest.fn().mockImplementation(async (type) => {
    return type === 'page' ? 
      '[{ "url": "www.page1.com", "title": "Page 1" }]' :
      'www.feed.com'
  }),
  setItem: jest.fn().mockImplementation(async () => {
    return null
  })
}))

const saveURL = jest.fn()
const saveFeed = jest.fn()
const addMessage = jest.fn()
const fetch = jest.fn()

test('renders correctly', async () => {
  const { toJSON } = render(<AppStateListener saveURL={saveURL} addMessage={addMessage} />)
  expect(toJSON()).toMatchSnapshot()
  await waitFor(() => expect(saveURL).toHaveBeenCalledWith('www.page1.com', 'Page 1'))
})

// test('retrieves page', async () => {
//   render(<AppStateListener saveURL={saveURL} addMessage={addMessage}/>)
//   await waitFor(() => expect(saveURL).toHaveBeenCalledWith('www.page1.com'))
// })
