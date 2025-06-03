import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { Animated } from 'react-native'
import ItemCarousel from '../../components/ItemCarousel'
import { ItemType } from '../../store/items/types'

// Mock utils functions
jest.mock('../../utils/get-item', () => ({
  getItems: jest.fn((state) => state.itemsUnread.items),
  getIndex: jest.fn((state) => state.itemsUnread.index)
}))

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    push: jest.fn(),
    navigate: jest.fn(),
    goBack: jest.fn()
  })
}))

// Mock components
jest.mock('../../components/SwipeableViews', () => {
  const React = require('react')
  const { View, Text, Animated } = require('react-native')
  return function SwipeableViews({ items, updateCarouselIndex, setPanAnim, setScrollAnim, onScrollEnd, onTextSelection }) {
    React.useEffect(() => {
      if (setPanAnim) setPanAnim(new Animated.Value(0))
      if (setScrollAnim) setScrollAnim(new Animated.Value(0))
    }, [])

    return (
      <View testID="swipeable-views">
        <Text>SwipeableViews with {items?.length} items</Text>
        <Text onPress={() => updateCarouselIndex && updateCarouselIndex(1)} testID="change-index">
          Change Index
        </Text>
        <Text onPress={() => onScrollEnd && onScrollEnd(100)} testID="scroll-end">
          Scroll End
        </Text>
        <Text onPress={() => onTextSelection && onTextSelection('selected text')} testID="text-selection">
          Text Selection
        </Text>
      </View>
    )
  }
})

jest.mock('../../components/TopBars', () => {
  const React = require('react')
  const { View, Text } = require('react-native')
  return function TopBars({ setClampedScrollAnimSetterAndListener, setScrollAnimSetterAndListener, setBufferIndexChangeListener }) {
    React.useEffect(() => {
      if (setClampedScrollAnimSetterAndListener) {
        setClampedScrollAnimSetterAndListener(jest.fn(), jest.fn())
      }
      if (setScrollAnimSetterAndListener) {
        setScrollAnimSetterAndListener(jest.fn(), jest.fn())
      }
      if (setBufferIndexChangeListener) {
        setBufferIndexChangeListener(jest.fn())
      }
    }, [])

    return (
      <View testID="top-bars">
        <Text>TopBars</Text>
      </View>
    )
  }
})

jest.mock('../../containers/Buttons', () => {
  const React = require('react')
  const { View, Text } = require('react-native')
  return function ButtonsContainer() {
    return (
      <View testID="buttons-container">
        <Text>ButtonsContainer</Text>
      </View>
    )
  }
})

jest.mock('../../components/EmptyCarousel', () => {
  const React = require('react')
  const { View, Text } = require('react-native')
  return function EmptyCarousel({ displayMode, toggleDisplayMode }) {
    return (
      <View testID="empty-carousel">
        <Text>Empty Carousel - {displayMode}</Text>
        <Text onPress={() => toggleDisplayMode && toggleDisplayMode(displayMode)} testID="toggle-display">
          Toggle Display
        </Text>
      </View>
    )
  }
})

jest.mock('../../components/ItemsScreenOnboarding', () => {
  const React = require('react')
  const { View, Text } = require('react-native')
  return function ItemsScreenOnboarding() {
    return (
      <View testID="items-screen-onboarding">
        <Text>Items Screen Onboarding</Text>
      </View>
    )
  }
})

jest.mock('../../components/SourceExpanded', () => {
  const React = require('react')
  const { View, Text } = require('react-native')
  return function SourceExpanded() {
    return (
      <View testID="source-expanded">
        <Text>Source Expanded</Text>
      </View>
    )
  }
})

// Mock utils
jest.mock('../../utils/animation-handlers', () => ({
  getClampedScrollAnim: jest.fn((anim) => anim),
  onScrollEnd: jest.fn(),
  setClampedScrollListener: jest.fn(),
  setScrollListener: jest.fn()
}))

const createMockItem = (id, feedId = 'feed1') => ({
  _id: id,
  feed_id: feedId,
  title: `Test Item ${id}`,
  url: `https://example.com/item/${id}`,
  created_at: Date.now(),
  isDecorated: true,
  showMercuryContent: false
})

const createMockStore = (customState = {}) => {
  const items = Array.from({ length: 10 }, (_, i) => createMockItem(`item${i + 1}`))
  
  const initialState = {
    itemsUnread: {
      items,
      index: 0
    },
    itemsSaved: {
      items: [],
      index: 0
    },
    itemsMeta: {
      display: ItemType.unread
    },
    feeds: {
      feeds: [
        { _id: 'feed1', title: 'Test Feed 1', isMercury: true },
        { _id: 'feed2', title: 'Test Feed 2', isMercury: false }
      ]
    },
    config: {
      isOnboarding: false,
      isItemsOnboardingDone: true,
      onboardingLength: 5,
      orientation: 'portrait',
      filter: null
    },
    categories: {
      categories: []
    },
    ...customState
  }

  return configureStore({
    reducer: (state = initialState, action) => {
      if (action.type) {
        // Handle dispatched actions but don't modify state for tests
        return state
      }
      return state
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false
      })
  })
}



describe('ItemCarousel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with items', async () => {
    const items = Array.from({ length: 5 }, (_, i) => createMockItem(`item${i + 1}`))
    const store = createMockStore({
      itemsUnread: {
        items,
        index: 0
      }
    })
    
    render(
      <Provider store={store}>
        <ItemCarousel />
      </Provider>
    )

    expect(screen.getByTestId('swipeable-views')).toBeTruthy()
    expect(screen.getByTestId('top-bars')).toBeTruthy()
    expect(screen.getByTestId('buttons-container')).toBeTruthy()
  })

  it('renders empty carousel when no items', async () => {
    const store = createMockStore({
      itemsUnread: {
        items: [],
        index: 0
      },
      config: {
        isOnboarding: false,
        isItemsOnboardingDone: true,
        onboardingLength: 0,
        orientation: 'portrait'
      }
    })
    
    render(
      <Provider store={store}>
        <ItemCarousel />
      </Provider>
    )

    expect(screen.getByTestId('empty-carousel')).toBeTruthy()
    expect(screen.queryByTestId('swipeable-views')).toBeNull()
  })

  it('handles index changes', async () => {
    const items = Array.from({ length: 5 }, (_, i) => createMockItem(`item${i + 1}`))
    const store = createMockStore({
      itemsUnread: {
        items,
        index: 0
      }
    })
    
    render(
      <Provider store={store}>
        <ItemCarousel />
      </Provider>
    )

    fireEvent.press(screen.getByTestId('change-index'))

    // Component should handle index changes without throwing
    expect(screen.getByTestId('swipeable-views')).toBeTruthy()
  })

  it('handles onboarding mode', async () => {
    const items = Array.from({ length: 5 }, (_, i) => createMockItem(`item${i + 1}`))
    const store = createMockStore({
      itemsUnread: {
        items,
        index: 0
      },
      config: {
        isOnboarding: true,
        isItemsOnboardingDone: false,
        onboardingLength: 5,
        orientation: 'portrait',
        filter: null
      }
    })
    
    render(
      <Provider store={store}>
        <ItemCarousel />
      </Provider>
    )

    expect(screen.getByTestId('swipeable-views')).toBeTruthy()
    expect(screen.queryByTestId('items-screen-onboarding')).toBeNull()
  })

  it('integrates with feeds correctly', async () => {
    const store = createMockStore({
      itemsUnread: {
        items: [
          createMockItem('item1', 'feed1'),
          createMockItem('item2', 'feed2')
        ],
        index: 0
      },
      feeds: {
        feeds: [
          { _id: 'feed1', isMercury: true },
          { _id: 'feed2', isMercury: false }
        ]
      }
    })
    
    render(
      <Provider store={store}>
        <ItemCarousel />
      </Provider>
    )

    expect(screen.getByTestId('swipeable-views')).toBeTruthy()
  })

  it('handles saved items mode', async () => {
    const store = createMockStore({
      itemsMeta: {
        display: ItemType.saved
      },
      itemsSaved: {
        items: [createMockItem('item1', 'feed1')],
        index: 0
      }
    })
    
    render(
      <Provider store={store}>
        <ItemCarousel />
      </Provider>
    )

    expect(screen.getByTestId('swipeable-views')).toBeTruthy()
  })

  it('handles scroll and text selection events', async () => {
    const items = Array.from({ length: 5 }, (_, i) => createMockItem(`item${i + 1}`))
    const store = createMockStore({
      itemsUnread: {
        items,
        index: 0
      }
    })
    
    render(
      <Provider store={store}>
        <ItemCarousel />
      </Provider>
    )

    // Test scroll end
    fireEvent.press(screen.getByTestId('scroll-end'))
    expect(screen.getByTestId('swipeable-views')).toBeTruthy()

    // Test text selection
    fireEvent.press(screen.getByTestId('text-selection'))
    expect(screen.getByTestId('swipeable-views')).toBeTruthy()
  })
})
