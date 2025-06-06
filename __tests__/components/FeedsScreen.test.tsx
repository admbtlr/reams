import React from 'react'
import { fireEvent, waitFor } from '@testing-library/react-native'
import { render } from '../test-utils-helpers'
import FeedsScreen from '@/components/FeedsScreen'
import { ItemType } from '@/store/items/types'
import { ModalContext } from '@/components/ModalProvider'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { View, Text } from 'react-native'

// Mock dependencies
jest.mock('@/utils/dimensions', () => ({
  getMargin: jest.fn(() => 16),
  getInset: jest.fn(() => 8),
  getStatusBarHeight: jest.fn(() => 40),
  fontSizeMultiplier: jest.fn(() => 1),
  hasNotchOrIsland: jest.fn(() => false)
}))

jest.mock('@/utils/colors', () => ({
  hslString: jest.fn(() => '#333333')
}))

jest.mock('@/utils/', () => ({
  id: jest.fn(() => 'mock-id-12345')
}))

jest.mock('@/utils/rizzle-button-icons', () => ({
  getRizzleButtonIcon: jest.fn(() => null)
}))

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  push: jest.fn()
}

// Mock modal context
const mockModalContext = {
  openModal: jest.fn(),
  closeModal: jest.fn(),
  isModalVisible: false,
  modalParams: null
}

// Mock components that might be problematic
jest.mock('@/components/NewFeedsList', () => 'MockNewFeedsList')
jest.mock('@/components/SourceExpanded', () => 'MockSourceExpanded')
jest.mock('@/components/SearchBar', () => 'MockSearchBar')
jest.mock('@/components/SourceContracted', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  return function MockSourceContracted(props) {
    return (
      <View testID={`feed-${props._id}`}>
        <Text>{props.title}</Text>
      </View>
    )
  }
})

// Create a navigation wrapper similar to the Feeds component in App.tsx
const TestNavigator = () => {
  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="FeedsScreen"
          component={FeedsScreen}
          initialParams={{ navigation: mockNavigation }}
        />
        <Stack.Screen
          name="ModalWithGesture"
          component={View}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Create mock state for tests
const createMockState = (hasFeeds = true) => ({
  itemsMeta: {
    display: ItemType.unread,
    allLoaded: false,
    currentIndex: 0,
    lastUpdated: Date.now()
  },
  feeds: {
    feeds: hasFeeds ? [
      {
        _id: 'feed-1',
        title: 'Test Feed 1',
        url: 'https://example.com/feed1',
        unreadCount: 1,
        readCount: 0,
        isNudgeActive: false,
        isMuted: false
      },
      {
        _id: 'feed-2',
        title: 'Test Feed 2',
        url: 'https://example.com/feed2',
        unreadCount: 1,
        readCount: 0,
        isNudgeActive: false,
        isMuted: false
      }
    ] : []
  },
  feedsLocal: {
    feeds: hasFeeds ? [
      { _id: 'feed-1' },
      { _id: 'feed-2' }
    ] : []
  },
  newsletters: {
    newsletters: hasFeeds ? [
      {
        _id: 'newsletter-1',
        title: 'Newsletter 1',
        url: 'https://example.com/newsletter1',
        unreadCount: 1,
        readCount: 0,
        isNudgeActive: false,
        isMuted: false
      },
      {
        _id: 'newsletter-2',
        title: 'Newsletter 2',
        url: 'https://example.com/newsletter2',
        unreadCount: 1,
        readCount: 0,
        isNudgeActive: false,
        isMuted: false
      }
    ] : []
  },
  categories: {
    categories: [
      { _id: 'cat-1', name: 'Category 1', isSystem: false, sourceIds: ['feed-1'], itemIds: [] },
      { _id: 'cat-2', name: 'Category 2', isSystem: false, sourceIds: ['feed-2'], itemIds: [] },
      { _id: 'system-cat', name: 'System Category', isSystem: true, sourceIds: [], itemIds: [] }
    ]
  },
  config: {
    orientation: 'portrait'
  },
  itemsUnread: {
    items: hasFeeds ? [
      {
        _id: 'item-1',
        feed_id: 'feed-1',
        title: 'Item 1',
        url: 'https://example.com/feed1/item1',
        created_at: Date.now(),
        isDecorated: true
      },
      {
        _id: 'item-2',
        feed_id: 'feed-2',
        title: 'Item 2',
        url: 'https://example.com/feed2/item2',
        created_at: Date.now(),
        isDecorated: true
      }
    ] : [],
    index: 0,
    lastUpdated: Date.now()
  },
  itemsSaved: {
    items: [],
    index: 0,
    lastUpdated: Date.now()
  },
  ui: {
    isDarkMode: false,
    fontSize: 14,
    showButtonLabels: true,
    imageViewerVisible: false,
    searchTerm: '',
    helpTipShown: null
  }
})

describe('FeedsScreen Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Basic test to verify the component renders within NavigationContainer
  it('renders within NavigationContainer without crashing', () => {
    const { queryByTestId } = render(
      <ModalContext.Provider value={mockModalContext}>
        <TestNavigator />
      </ModalContext.Provider>,
      { preloadedState: createMockState(true) }
    )

    // This test will pass if there's no error during rendering
    expect(queryByTestId('feeds-screen')).toBeTruthy()
  })

  // Test for displaying feed items when feeds exist
  it('displays feed items in sections when feeds exist', () => {
    const { queryByTestId, queryByText } = render(
      <ModalContext.Provider value={mockModalContext}>
        <TestNavigator />
      </ModalContext.Provider>,
      { preloadedState: createMockState(true) }
    )

    // Check section headers
    expect(queryByText('RSS')).toBeTruthy()
    expect(queryByText('Newsletters')).toBeTruthy()
    expect(queryByText('Tags')).toBeTruthy()

    // Check feed items are rendered
    expect(queryByTestId('feed-feed-1')).toBeTruthy()
    expect(queryByTestId('feed-feed-2')).toBeTruthy()

    // Check newsletter items are rendered
    expect(queryByTestId('feed-newsletter-1')).toBeTruthy()
    expect(queryByTestId('feed-newsletter-2')).toBeTruthy()
  })

  // Test for empty state when no feeds exist
  // it('displays empty state when no feeds exist', () => {
  //   const { queryByText, queryByTestId } = render(
  //     <ModalContext.Provider value={mockModalContext}>
  //       <TestNavigator />
  //     </ModalContext.Provider>,
  //     { preloadedState: createMockState(false) }
  //   )

  //   // Check empty state message
  //   expect(queryByText(/Add feeds from your favourite websites/)).toBeTruthy()

  //   // Ensure feed items are not rendered
  //   expect(queryByTestId('feed-feed-1')).toBeFalsy()
  //   expect(queryByTestId('feed-feed-2')).toBeFalsy()
  // })

  // // Tests for section headers and content
  // it('renders section headers correctly', () => {
  //   const { queryByText } = render(
  //     <ModalContext.Provider value={mockModalContext}>
  //       <TestNavigator />
  //     </ModalContext.Provider>,
  //     { preloadedState: createMockState(true) }
  //   )

  //   // Check section headers are rendered
  //   expect(queryByText('Websites')).toBeTruthy()
  //   expect(queryByText('Newsletters')).toBeTruthy()
  //   expect(queryByText('Tags')).toBeTruthy()
  // })

  // it('renders the all items section', () => {
  //   const { queryByText } = render(
  //     <ModalContext.Provider value={mockModalContext}>
  //       <TestNavigator />
  //     </ModalContext.Provider>,
  //     { preloadedState: createMockState(true) }
  //   )

  //   // Check the "All Unread" section is rendered
  //   expect(queryByText('All Unread')).toBeTruthy()
  // })

  // it('renders saved items mode when display is set to saved', () => {
  //   const savedState = {
  //     ...createMockState(true),
  //     itemsMeta: {
  //       display: ItemType.saved
  //     }
  //   }

  //   const { queryByText } = render(
  //     <ModalContext.Provider value={mockModalContext}>
  //       <TestNavigator />
  //     </ModalContext.Provider>,
  //     { preloadedState: savedState }
  //   )

  //   // Should show "All Saved" instead of "All Unread"
  //   expect(queryByText('All Saved')).toBeTruthy()

  //   // Should not show Websites or Newsletters sections in saved mode
  //   expect(queryByText('Websites')).toBeFalsy()
  //   expect(queryByText('Newsletters')).toBeFalsy()
  // })

  // // Tests for interactive elements with testIDs
  // it('renders add buttons with correct testIDs', () => {
  //   const { queryByTestId } = render(
  //     <ModalContext.Provider value={mockModalContext}>
  //       <TestNavigator />
  //     </ModalContext.Provider>,
  //     { preloadedState: createMockState(true) }
  //   )

  //   // Check that the Add buttons for feeds and categories are rendered
  //   expect(queryByTestId('add-feeds-button')).toBeTruthy()
  //   expect(queryByTestId('add-category-button')).toBeTruthy()
  // })

  // it('renders search button with correct testID', () => {
  //   const { queryByTestId } = render(
  //     <ModalContext.Provider value={mockModalContext}>
  //       <TestNavigator />
  //     </ModalContext.Provider>,
  //     { preloadedState: createMockState(true) }
  //   )

  //   // Check search button is rendered
  //   expect(queryByTestId('search-button')).toBeTruthy()
  // })

  // it('toggles search bar visibility when search button is pressed', async () => {
  //   const { queryByTestId, getByTestId } = render(
  //     <ModalContext.Provider value={mockModalContext}>
  //       <TestNavigator />
  //     </ModalContext.Provider>,
  //     { preloadedState: createMockState(true) }
  //   )

  //   // Initially, search bar container should not be visible
  //   expect(queryByTestId('search-bar-container')).toBeFalsy()

  //   // Find and press the search button
  //   const searchButton = getByTestId('search-button')
  //   fireEvent.press(searchButton)

  //   // After pressing, the search bar container should become visible
  //   // Note: This may be flaky due to animations; might need waitFor
  //   await waitFor(() => {
  //     expect(queryByTestId('search-bar-container')).toBeTruthy()
  //   })
  // })

})
