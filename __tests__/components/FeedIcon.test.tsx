import React from 'react'
import { Platform, Image } from 'react-native'
import { render, waitFor, act } from '@testing-library/react-native'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import FeedIcon from '@/components/FeedIcon'

// Mock FileSystem module
jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock/directory/',
  downloadAsync: jest.fn(() => Promise.resolve())
}))

// Mock utility functions
jest.mock('@/utils', () => ({
  fileExists: jest.fn(() => Promise.resolve(true)),
  getCachedFeedIconPath: jest.fn((id) => `/mock/directory/feed-icons/${id}.png`)
}))

// Set up test state
const mockFeed = {
  _id: 'feed-123',
  title: 'Test Feed',
  favicon: {
    url: 'https://example.com/favicon.ico'
  }
}

const mockNewsletter = {
  _id: 'newsletter-123',
  title: 'Test Newsletter',
  favicon: {
    url: 'https://example.com/newsletter-icon.png'
  }
}

const mockReduxState = {
  feeds: {
    feeds: [mockFeed]
  },
  newsletters: {
    newsletters: [mockNewsletter]
  }
}

describe('FeedIcon Component', () => {
  // Save the original Platform.OS value
  const originalPlatformOS = Platform.OS

  beforeEach(() => {
    // Reset any mocks
    jest.clearAllMocks()
  })

  afterAll(() => {
    // Restore Platform.OS
    Platform.OS = originalPlatformOS
  })

  it('renders correctly with a feed ID that exists', async () => {
    // Create a store with our mock data
    const mockStore = configureStore([])
    const store = mockStore(mockReduxState)

    // Render with the store provider directly
    const { getByTestId } = render(
      <Provider store={store}>
        <FeedIcon feedId="feed-123" testID="feed-icon" />
      </Provider>
    )
    
    // Wait for async operations to complete
    await waitFor(() => {
      expect(getByTestId('feed-icon')).toBeTruthy()
    })
  })

  it('renders with newsletter ID', async () => {
    // Create a store with our mock data
    const mockStore = configureStore([])
    const store = mockStore(mockReduxState)

    // Render with the store provider directly
    const { getByTestId } = render(
      <Provider store={store}>
        <FeedIcon feedId="newsletter-123" testID="newsletter-icon" />
      </Provider>
    )
    
    // Wait for async operations to complete
    await waitFor(() => {
      expect(getByTestId('newsletter-icon')).toBeTruthy()
    })
  })

  it('renders nothing when feed ID does not exist', async () => {
    // Create a store with our mock data
    const mockStore = configureStore([])
    const store = mockStore(mockReduxState)

    // Render with the store provider directly
    const { queryByTestId } = render(
      <Provider store={store}>
        <FeedIcon feedId="non-existent-id" testID="non-existent-icon" />
      </Provider>
    )
    
    // Non-existent feeds should render null
    await waitFor(() => {
      expect(queryByTestId('non-existent-icon')).toBeNull()
    })
  })

  it('renders with different size props', async () => {
    // Create a store with our mock data
    const mockStore = configureStore([])
    const store = mockStore(mockReduxState)
    
    // Test isSmall prop
    const { getByTestId: getSmallIcon } = render(
      <Provider store={store}>
        <FeedIcon feedId="feed-123" isSmall testID="small-icon" />
      </Provider>
    )
    
    // Test isSmaller prop
    const { getByTestId: getSmallerIcon } = render(
      <Provider store={store}>
        <FeedIcon feedId="feed-123" isSmaller testID="smaller-icon" />
      </Provider>
    )
    
    // Verify both render
    await waitFor(() => {
      expect(getSmallIcon('small-icon')).toBeTruthy()
      expect(getSmallerIcon('smaller-icon')).toBeTruthy()
    })
  })

  // Removed this test as it's covered by the combined test above

  it('renders with web platform', async () => {
    // Mock Platform.OS as web for this test
    Platform.OS = 'web'
    
    // Create a store with our mock data
    const mockStore = configureStore([])
    const store = mockStore(mockReduxState)
    
    const { getByTestId } = render(
      <Provider store={store}>
        <FeedIcon feedId="feed-123" testID="web-icon" />
      </Provider>
    )
    
    // Verify it renders on web
    await waitFor(() => {
      expect(getByTestId('web-icon')).toBeTruthy()
    })
  })
})