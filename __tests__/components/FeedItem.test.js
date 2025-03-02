import React from 'react'
import { render, screen, waitFor } from '@testing-library/react-native'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import FeedItem from '@/components/FeedItem'
import {Animated} from 'react-native'

const mockStore = configureStore([])

jest.mock('@/storage/sqlite', () => ({
  getItem: jest.fn(() => Promise.resolve({
    title: 'This is the title',
    content_html: '<p>This is the content</p>',
    hasCoverImage: false,
    showCoverImage: false,
    styles: {
      isCoverInline: false,
      fontClasses: {
        heading: 'heading',
        body: 'body',
      }
    }
  })),
}))

class TestErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      console.log('Error in component:', this.state.error);
      return null;
    }
    return this.props.children;
  }
}


describe('FeedItem Component', () => {
  let store
  let initialState

  beforeEach(() => {
    initialState = {
      ui: {
        isDarkMode: false,
        fontSize: 14,
        imageViewerVisible: false,
      },
      config: {
        orientation: 'portrait',
      },
      itemsMeta: {
        display: 'list',
      },
      hostColors: {
        hostColors: [{
          host: 'example.com',
          color: '#000000',
        }],
      },
      feeds: {
        feeds: [],
      },
      newsletters: {
        newsletters: [],
      },
      categories: {
        categories: [],
      },
      items: {
        items: [],
      },
      annotations: {
        annotations: [],
      }
    }

    store = mockStore(initialState)
  })

  it('renders correctly with initial state', async () => {
    render(
      <TestErrorBoundary>
        <Provider store={store}>
          <FeedItem
            item={{
              _id: '1',
              feed_color: '#000000',
              feedTitle: 'Test Feed',
              showMercuryContent: false,
              title: '<p>This is the title</p>',
              isDecorated: true
            }}
            coverImageComponent={<></>}
            setTimerFunction={() => {}}
            panAnim={ new Animated.Value(0) }
            emitter={{ 
              on: () => {},
              off: () => {} 
            }}
          />
        </Provider>
      </TestErrorBoundary>
    )

    const webview = await screen.findByTestId('mock-webview')
    expect(webview).toHaveTextContent('This is the content')
  })

  // it('updates webViewHeight state on updateWebViewHeight call', () => {
  //   const { getByTestId } = render(
  //     <Provider store={store}>
  //       <FeedItem
  //         item={{
  //           _id: '1',
  //           feed_color: '#000000',
  //           feedTitle: 'Test Feed',
  //           showMercuryContent: true,
  //         }}
  //         coverImageComponent={<></>}
  //         setTimerFunction={() => {}}
  //       />
  //     </Provider>
  //   )

  //   const webView = getByTestId('webview')
  //   fireEvent(webView, 'onNavigationStateChange', { height: 2000 })

  //   expect(webView.props.style.height).toBe(2000)
  // })
})