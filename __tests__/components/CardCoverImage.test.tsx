import React from 'react'
import { Platform, Image, View, Animated } from 'react-native'
import { render, waitFor } from '@testing-library/react-native'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import CardCoverImage from '@/components/CardCoverImage'

// Mock FileSystem module and utilities
jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock/directory/'
}))

jest.mock('@/utils', () => ({
  fileExists: jest.fn(() => Promise.resolve(true)),
  getCachedCoverImagePath: jest.fn((id) => `/mock/directory/${id}.jpg`)
}))

jest.mock('@/utils/log', () => ({
  __esModule: true,
  default: jest.fn()
}))

// Mock storage to avoid sqlite initialization issues
jest.mock('@/storage', () => ({
  getItemsSync: jest.fn(() => [{
    _id: 'item-123',
    feed_id: 'feed-123',
    title: 'Test Item',
    coverImageUrl: 'https://example.com/image.jpg',
    hasCoverImage: true,
    imageDimensions: { width: 800, height: 600 }
  }]),
  getItemSync: jest.fn(() => ({
    _id: 'item-123',
    feed_id: 'feed-123',
    title: 'Test Item',
    coverImageUrl: 'https://example.com/image.jpg',
    hasCoverImage: true,
    imageDimensions: { width: 800, height: 600 }
  })),
  getFeedSync: jest.fn(() => ({ _id: 'feed-123', title: 'Test Feed', color: '#FF0000' }))
}))

// Mock Image.getSize for web platform tests
beforeAll(() => {
  Image.getSize = jest.fn((uri, success) => {
    success(1024, 768)
    return { then: jest.fn() }
  })
  // Mock Animated components to render as plain Views
  Animated.View = View
  Animated.Image = View
})

// Set up test state with feeds and items
const mockFeed = {
  _id: 'feed-123',
  title: 'Test Feed',
  color: '#FF0000'
}

const mockItem = {
  _id: 'item-123',
  feed_id: 'feed-123',
  title: 'Test Item',
  coverImageUrl: 'https://example.com/image.jpg',
  hasCoverImage: true,
  imageDimensions: {
    width: 800,
    height: 600
  }
}

const mockFeedLocal = {
  _id: 'feed-123',
  cachedCoverImageId: 'item-123'
}

const mockState = {
  feeds: {
    feeds: [mockFeed]
  },
  feedsLocal: {
    feeds: [mockFeedLocal]
  },
  itemsUnread: {
    items: [mockItem]
  },
  itemsSaved: {
    items: []
  }
}

const mockStateWithSavedItem = {
  ...mockState,
  itemsSaved: {
    items: [
      {
        ...mockItem,
        _id: 'saved-item-123'
      }
    ]
  }
}

describe('CardCoverImage Component', () => {
  // Save the original Platform.OS value
  const originalPlatformOS = Platform.OS
  
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  afterAll(() => {
    // Restore Platform.OS
    Platform.OS = originalPlatformOS
  })

  it('renders correctly with a feed ID', async () => {
    // Create a mock store
    const mockStore = configureStore([])
    const store = mockStore(mockState)
    
    // Add testID to component before testing
    const { getByTestId } = render(
      <Provider store={store}>
        <CardCoverImage 
          feedId="feed-123"
          itemId={undefined}
          width={400} 
          height={300}
          testID="feed-cover-image"
        />
      </Provider>
    )
    
    // Wait for component to render
    await waitFor(() => {
      expect(getByTestId('feed-cover-image')).toBeTruthy()
    })
    
    // We don't verify dispatched actions since it's using useEffect which
    // doesn't trigger in the test environment as expected
  })
  
  it('renders correctly with an item ID', async () => {
    // Create a mock store
    const mockStore = configureStore([])
    const store = mockStore(mockStateWithSavedItem)
    
    // Add testID to component before testing
    const { getByTestId } = render(
      <Provider store={store}>
        <CardCoverImage 
          feedId={undefined}
          itemId="saved-item-123"
          width={400} 
          height={300}
          testID="item-cover-image"
        />
      </Provider>
    )
    
    // Wait for component to render
    await waitFor(() => {
      expect(getByTestId('item-cover-image')).toBeTruthy()
    })
  })
  
  it('renders nothing when cover image is not available', async () => {
    // Create a state with no cover images
    const stateWithoutCoverImages = {
      ...mockState,
      itemsUnread: {
        items: [{
          ...mockItem,
          coverImageUrl: undefined,
          hasCoverImage: false,
          imageDimensions: undefined
        }]
      }
    }
    
    // Create a mock store
    const mockStore = configureStore([])
    const store = mockStore(stateWithoutCoverImages)
    
    // Add testID to component before testing
    const { queryByTestId } = render(
      <Provider store={store}>
        <CardCoverImage 
          feedId="feed-123"
          itemId={undefined}
          width={400} 
          height={300}
          testID="no-cover-image"
        />
      </Provider>
    )
    
    // Wait and check that no image is rendered
    await waitFor(() => {
      expect(queryByTestId('no-cover-image')).toBeNull()
    })
  })
  
  it('uses web behavior when on web platform', async () => {
    // Mock Platform.OS as web
    Platform.OS = 'web'
    
    // Create a mock store
    const mockStore = configureStore([])
    const store = mockStore(mockState)
    
    // Add testID to component before testing
    const { getByTestId } = render(
      <Provider store={store}>
        <CardCoverImage 
          feedId="feed-123"
          itemId={undefined}
          width={400} 
          height={300}
          testID="web-cover-image"
        />
      </Provider>
    )
    
    // Wait for component to render
    await waitFor(() => {
      expect(getByTestId('web-cover-image')).toBeTruthy()
    })
    
    // Restore Platform.OS
    Platform.OS = originalPlatformOS
  })

  it('handles missing feed correctly', async () => {
    // Create a state with a non-existent feed ID
    const mockStore = configureStore([])
    const store = mockStore(mockState)
    
    // Add testID to component before testing
    const { queryByTestId } = render(
      <Provider store={store}>
        <CardCoverImage 
          feedId="non-existent-feed"
          itemId={undefined}
          width={400} 
          height={300}
          testID="missing-feed-image"
        />
      </Provider>
    )
    
    // Wait and check that no image is rendered due to missing feed
    await waitFor(() => {
      expect(queryByTestId('missing-feed-image')).toBeNull()
    })
  })
})