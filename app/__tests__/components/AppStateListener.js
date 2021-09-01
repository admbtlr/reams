import React from 'react'
import { render, waitFor } from '../../test-utils'
import AppStateListener from '../../components/AppStateListener'

jest.mock('@react-native-community/clipboard')
jest.mock('react-native-shared-group-preferences', () => ({
  getItem: jest.fn().mockImplementation(async (type) => {
    return type === 'page' ? 
      '[{ "url": "www.page1.com" }, {"url": "www.page2.com"}]' :
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
  const { toJSON } = render(<AppStateListener saveURL={saveURL}/>)
  await expect(toJSON()).toMatchSnapshot()
})

test('retrieves page', async () => {
  render(<AppStateListener saveURL={saveURL} addMessage={addMessage}/>)
  await waitFor(() => expect(saveURL).toHaveBeenCalledWith('www.page1.com'))
})
