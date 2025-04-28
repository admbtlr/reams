import React from 'react'
import { render, screen, waitFor } from '@testing-library/react-native'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import FeedItem from '../../components/FeedItem'
import { Animated, Text, View } from 'react-native'

// Create a simplified mock store with only what's needed for this test
const createMockStore = (customState = {}) => {
  const initialState = {
    ui: {
      isDarkMode: false,
      fontSize: 14,
      imageViewerVisible: false,
      showButtonLabels: true
    },
    itemsMeta: {
      display: 'list'
    },
    hostColors: {
      hostColors: []
    },
    config: {
      orientation: 'portrait'
    },
    feeds: {
      feeds: []
    },
    newsletters: {
      newsletters: []
    },
    annotations: {
      annotations: []
    },
    categories: {
      categories: []
    }
  }

  return configureStore({
    reducer: (state = initialState, action) => ({ ...state, ...customState }),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Disable serializable check for tests
        immutableCheck: false     // Disable immutable check for tests
      })
  })
}

// Mock SQLite getItem to return item content
jest.mock('../../storage/sqlite', () => ({
  getItem: jest.fn(() => Promise.resolve({
    title: 'Test Title',
    content_html: '<p>This is the content</p>',
    hasCoverImage: false,
    showCoverImage: false,
    styles: {
      isCoverInline: false,
      fontClasses: {
        heading: 'headerFontSerif1',
        body: 'bodyFontSerif1',
      },
      title: {
        bg: false,
        isUpperCase: false,
        isItalic: false,
        isBold: true,
        textAlign: 'left',
        borderWidth: 0,
        fontSize: 32,
        lineHeightAsMultiplier: 1.2,
        valign: 'top',
        isMonochrome: false,
      },
      coverImage: {
        isInline: false
      },
      hasFeedBGColor: false,
      color: 'blue',
      dropCapFamily: 'header',
      dropCapIsMonochrome: false,
      dropCapSize: 2,
      dropCapIsDrop: true,
      dropCapIsBold: true,
      dropCapIsStroke: false
    }
  })),
}))

// Mock IDB storage too
jest.mock('../../storage/idb-storage', () => ({
  getItem: jest.fn(() => Promise.resolve({})),
}))

// Test error boundary to catch and report any errors
class TestErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      console.log('Error in component:', this.state.error)
      return <Text>Error rendering component: {this.state.error.message}</Text>
    }
    return this.props.children
  }
}

describe('FeedItem Component Simplified', () => {
  it('renders with basic props', async () => {
    const store = createMockStore()

    // Create a complete mock emitter
    const mockEmitter = {
      on: jest.fn(),
      off: jest.fn()
    }

    const { getByTestId } = render(
      <Provider store={store}>
        <TestErrorBoundary>
          <FeedItem
            item={{
              _id: '1',
              feed_color: [0, 0, 0],
              feedTitle: 'Test Feed',
              showMercuryContent: false,
              title: 'Test Title',
              isDecorated: true,
              url: 'https://example.com/article',
              created_at: new Date().getTime()
            }}
            coverImageComponent={<View />}
            setTimerFunction={() => { }}
            setScrollOffset={() => { }}
            setScrollAnim={() => { }}
            onScrollEnd={() => { }}
            onTextSelection={() => { }}
            showImageViewer={() => { }}
            panAnim={new Animated.Value(0)}
            emitter={mockEmitter}
            isVisible={true}
          />
        </TestErrorBoundary>
      </Provider>
    )

    // Basic check to see if the component renders
    await waitFor(() => {
      expect(getByTestId('mock-webview')).toBeTruthy()
    }, { timeout: 3000 })
  })
})
