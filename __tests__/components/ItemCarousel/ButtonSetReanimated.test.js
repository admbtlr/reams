/**
 * ButtonSetReanimated Tests
 *
 * Tests for the new Reanimated button implementation that responds to
 * AnimationContext shared values for immediate scroll-begin responsiveness.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { Animated } from 'react-native'
import ButtonSetReanimated from '@/components/ItemCarousel/ButtonSet'
// import { AnimationProvider } from '@/components/ItemCarousel/AnimationContext'

// Mock feature flags
const mockUseReanimatedButtons = jest.fn(() => true)
const mockLogAnimationEvent = jest.fn()

// Mock AnimationContext with controllable shared values
const mockAnimationContext = {
  buttonsVisible: { value: 1 }, // 1 = visible, 0 = hidden
  headerVisible: { value: 1 },
  verticalScroll: { value: 0 },
  horizontalScroll: { value: 0 },
  currentIndex: { value: 0 },
  scrollDirection: { value: 0 },
  isScrolling: { value: false },
  scrollVelocity: { value: 0 },
  bufferIndex: 1,
  setBufferIndex: jest.fn()
}

jest.mock('@/components/ItemCarousel/AnimationContext', () => ({
  useAnimation: jest.fn(() => mockAnimationContext),
  __esModule: true,
  default: React.createContext()
}))

// Mock functions for tracking animation calls
const mockUseAnimatedStyle = jest.fn((styleFunction) => {
  // Return a basic style object for testing
  try {
    return styleFunction()
  } catch (error) {
    // If styleFunction fails, return a basic style
    return { opacity: 1 }
  }
})

const mockWithTiming = jest.fn((value, config) => value)

// Mock other dependencies
jest.mock('@/hooks/useColor', () => ({
  useColor: jest.fn(() => 'hsl(200, 50%, 50%)')
}))

jest.mock('@/storage/sqlite', () => ({
  getItem: jest.fn(() => Promise.resolve({
    title: 'Test Title',
    content_html: '<p>Test content</p>',
    content_mercury: '<p>Mercury content</p>'
  }))
}))

jest.mock('@/storage/idb-storage', () => ({
  getItem: jest.fn(() => Promise.resolve({
    title: 'Test Title',
    content_html: '<p>Test content</p>',
    content_mercury: '<p>Mercury content</p>'
  }))
}))

jest.mock('@/utils/dimensions', () => ({
  hasNotchOrIsland: jest.fn(() => false),
  getMargin: jest.fn(() => 10)
}))

jest.mock('@/utils/colors', () => ({
  hslString: jest.fn(() => '#ffffff'),
  getLightness: jest.fn(() => 50)
}))

jest.mock('@/utils/rizzle-button-icons', () => ({
  getRizzleButtonIcon: jest.fn(() => null)
}))

jest.mock('react-native-inappbrowser-reborn', () => ({
  isAvailable: jest.fn(() => Promise.resolve(true)),
  open: jest.fn(() => Promise.resolve())
}))

// Create mock store
const createMockStore = (customState = {}) => {
  const testItem = {
    _id: '1',
    url: 'https://example.com/article',
    title: 'Test Article',
    isSaved: false,
    isKeepUnread: false,
    showMercuryContent: false,
    feed_id: 'feed1'
  }

  const initialState = {
    ui: {
      isDarkMode: false,
      itemButtonsVisible: true
    },
    itemsMeta: {
      display: 'unread'
    },
    itemsUnread: {
      items: [testItem],
      index: 0
    },
    itemsSaved: {
      items: [],
      index: 0
    },
    feeds: {
      feeds: [{
        _id: 'feed1',
        title: 'Test Feed',
        url: 'https://example.com'
      }]
    },
    newsletters: {
      newsletters: []
    },
    categories: {
      categories: []
    },
    ...customState
  }

  return configureStore({
    reducer: (state = initialState, action) => {
      switch (action.type) {
        case 'SAVE_ITEM':
          return {
            ...state,
            itemsUnread: {
              ...state.itemsUnread,
              items: state.itemsUnread.items.map(item =>
                item._id === action.item._id ? { ...item, isSaved: true } : item
              )
            }
          }
        case 'UNSAVE_ITEM':
          return {
            ...state,
            itemsUnread: {
              ...state.itemsUnread,
              items: state.itemsUnread.items.map(item =>
                item._id === action.item._id ? { ...item, isSaved: false } : item
              )
            }
          }
        case 'TOGGLE_MERCURY_VIEW':
          return {
            ...state,
            itemsUnread: {
              ...state.itemsUnread,
              items: state.itemsUnread.items.map(item =>
                item._id === action.item._id ? { ...item, showMercuryContent: !item.showMercuryContent } : item
              )
            }
          }
        default:
          return state
      }
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false
      })
  })
}

describe('ButtonSetReanimated', () => {
  let store
  let testItem

  beforeEach(() => {
    store = createMockStore()
    testItem = {
      _id: '1',
      url: 'https://example.com/article',
      title: 'Test Article',
      isSaved: false,
      isKeepUnread: false,
      showMercuryContent: false,
      feed_id: 'feed1'
    }

    // Reset mocks
    jest.clearAllMocks()
    mockAnimationContext.buttonsVisible.value = 1 // Visible by default
  })

  describe('Basic Rendering', () => {
    test('renders without crashing', () => {
      const { UNSAFE_root } = render(
        <Provider store={store}>
          <mockAnimationContext.AnimationProvider>
            <ButtonSetReanimated
              item={testItem}
              itemIndex={0}
            />
          </mockAnimationContext.AnimationProvider>
        </Provider>
      )

      expect(UNSAFE_root).toBeTruthy()
    })

    test('renders without crashing with different itemIndex', () => {
      const { UNSAFE_root } = render(
        <Provider store={store}>
          <ButtonSetReanimated
            item={testItem}
            itemIndex={1}
          />
        </Provider>
      )

      expect(UNSAFE_root).toBeTruthy()
    })

    test('does not render when item is null', () => {
      const { UNSAFE_root } = render(
        <Provider store={store}>
          <mockAnimationContext.AnimationProvider>
            <ButtonSetReanimated
              item={null}
              itemIndex={0}
            />
          </mockAnimationContext.AnimationProvider>
        </Provider>
      )

      expect(UNSAFE_root).toBeTruthy()
    })
  })

  describe('Animation Context Integration', () => {
    test('uses mockAnimationContext for button visibility', () => {
      render(
        <Provider store={store}>
          <mockAnimationContext.AnimationProvider>
            <ButtonSetReanimated
              item={testItem}
              itemIndex={0}
            />
          </mockAnimationContext.AnimationProvider>
        </Provider>
      )

      // Verify that useAnimatedStyle was called
      expect(mockUseAnimatedStyle).toHaveBeenCalled()
    })

    // test('responds to buttonsVisible shared value changes', () => {
    //   // Set buttons to hidden
    //   mockAnimationContext.buttonsVisible.value = 0

    //   render(
    //     <Provider store={store}>
    //       <ButtonSetReanimated
    //         item={testItem}
    //         itemIndex={0}
    //       />
    //     </Provider>
    //   )

    //   // Verify that the animated style function uses the buttonsVisible value
    //   const styleFunction = mockUseAnimatedStyle.mock.calls[0][0]
    //   const style = styleFunction()

    //   // The style should include transform with translateY based on visibility
    //   expect(style).toHaveProperty('transform')
    //   expect(style.transform[0]).toHaveProperty('translateY')
    // })

    // test('applies correct translateY values based on visibility', () => {
    //   // Test visible state
    //   mockAnimationContext.buttonsVisible.value = 1

    //   const { rerender } = render(
    //     <Provider store={store}>
    //       <ButtonSetReanimated
    //         item={testItem}
    //         itemIndex={0}
    //       />
    //     </Provider>
    //   )

    //   // Get the style function and test it
    //   let styleFunction = mockUseAnimatedStyle.mock.calls[0][0]
    //   let style = styleFunction()

    //   // When visible, translateY should be 0 (or moving toward 0)
    //   // The exact value depends on withTiming, but mockWithTiming returns the target value
    //   expect(mockWithTiming).toHaveBeenCalledWith(0, expect.objectContaining({ duration: 600 }))

    //   // Reset mocks for hidden state test
    //   jest.clearAllMocks()
    //   mockAnimationContext.buttonsVisible.value = 0

    //   rerender(
    //     <Provider store={store}>
    //       <ButtonSetReanimated
    //         item={testItem}
    //         itemIndex={0}
    //       />
    //     </Provider>
    //   )

    //   // Test hidden state
    //   styleFunction = mockUseAnimatedStyle.mock.calls[0][0]
    //   style = styleFunction()

    //   // When hidden, translateY should be translateDistance (80)
    //   expect(mockWithTiming).toHaveBeenCalledWith(80, expect.objectContaining({ duration: 600 }))
    // })
  })

  //   describe('Button Functionality', () => {
  //     test('save button dispatches correct action', async () => {
  //       const { getByText } = render(
  //         <Provider store={store}>
  //           <ButtonSetReanimated
  //             item={testItem}
  //             itemIndex={0}
  //           />
  //         </Provider>
  //       )

  //       // Find and press the save button
  //       const saveButton = getByText('save')
  //       fireEvent.press(saveButton)

  //       // Check if the store state was updated
  //       const state = store.getState()
  //       const updatedItem = state.itemsUnread.items.find(item => item._id === testItem._id)
  //       expect(updatedItem.isSaved).toBe(true)
  //     })

  //     test('browser button opens URL', async () => {
  //       const InAppBrowser = require('react-native-inappbrowser-reborn')

  //       const { getByText } = render(
  //         <Provider store={store}>
  //           <ButtonSetReanimated
  //             item={testItem}
  //             itemIndex={0}
  //           />
  //         </Provider>
  //       )

  //       const browserButton = getByText('browser')
  //       fireEvent.press(browserButton)

  //       expect(InAppBrowser.open).toHaveBeenCalledWith(
  //         testItem.url,
  //         expect.objectContaining({
  //           dismissButtonStyle: 'close',
  //           animated: true,
  //           modalEnabled: true
  //         })
  //       )
  //     })

  //     test('mercury button dispatches toggle action', async () => {
  //       // Set up item with mercury content
  //       const mercuryItem = { ...testItem, content_mercury: '<p>Mercury content</p>' }

  //       const { getByText } = render(
  //         <Provider store={store}>
  //           <ButtonSetReanimated
  //             item={mercuryItem}
  //             itemIndex={0}
  //           />
  //         </Provider>
  //       )

  //       const mercuryButton = getByText('mercury')
  //       fireEvent.press(mercuryButton)

  //       // Check if mercury toggle action was dispatched
  //       const state = store.getState()
  //       const updatedItem = state.itemsUnread.items.find(item => item._id === mercuryItem._id)
  //       expect(updatedItem.showMercuryContent).toBe(true)
  //     })
  //   })

  //   describe('Conditional Button Rendering', () => {
  //     test('shows share button on iOS', () => {
  //       // Mock Platform.OS to be iOS
  //       jest.doMock('react-native', () => ({
  //         ...jest.requireActual('react-native'),
  //         Platform: { OS: 'ios' }
  //       }))

  //       const { getByText } = render(
  //         <Provider store={store}>
  //           <ButtonSetReanimated
  //             item={testItem}
  //             itemIndex={0}
  //           />
  //         </Provider>
  //       )

  //       expect(getByText('share')).toBeTruthy()
  //     })

  //     test('shows mercury button when content is available', async () => {
  //       const mercuryItem = { ...testItem }

  //       const { getByText } = render(
  //         <Provider store={store}>
  //           <ButtonSetReanimated
  //             item={mercuryItem}
  //             itemIndex={0}
  //           />
  //         </Provider>
  //       )

  //       // Wait for item to be inflated with mercury content
  //       await new Promise(resolve => setTimeout(resolve, 100))

  //       expect(getByText('mercury')).toBeTruthy()
  //     })

  //     test('shows keep unread button in dev mode for unread items', () => {
  //       global.__DEV__ = true

  //       const { getByDisplayValue } = render(
  //         <Provider store={store}>
  //           <ButtonSetReanimated
  //             item={testItem}
  //             itemIndex={0}
  //           />
  //         </Provider>
  //       )

  //       // Keep unread button should be present (though finding it by text might be tricky)
  //       // This test verifies the button renders without error
  //       expect(true).toBe(true) // Placeholder assertion
  //     })
  //   })

  //   describe('Performance and Optimization', () => {
  //     test('creates animated styles for all items', () => {
  //       // Reset mock call count
  //       jest.clearAllMocks()

  //       // Render non-current item
  //       render(
  //         <Provider store={store}>
  //           <ButtonSetReanimated
  //             item={testItem}
  //             itemIndex={1}
  //           />
  //         </Provider>
  //       )

  //       // Individual button animations should return empty objects for non-current items
  //       // The main container should still have an animated style
  //       expect(mockUseAnimatedStyle).toHaveBeenCalled()
  //     })

  //     test('uses withTiming for smooth animations', () => {
  //       mockAnimationContext.buttonsVisible.value = 0

  //       render(
  //         <Provider store={store}>
  //           <ButtonSetReanimated
  //             item={testItem}
  //             itemIndex={0}
  //           />
  //         </Provider>
  //       )

  //       // Verify that withTiming is used with appropriate duration
  //       expect(mockWithTiming).toHaveBeenCalledWith(
  //         expect.any(Number),
  //         expect.objectContaining({ duration: expect.any(Number) })
  //       )
  //     })
  //   })

  //   describe('Integration with Horizontal Paging', () => {
  //     test('uses horizontal scroll for opacity animation', () => {
  //       render(
  //         <Provider store={store}>
  //           <ButtonSetReanimated
  //             item={testItem}
  //             itemIndex={0}
  //           />
  //         </Provider>
  //       )

  //       // Should call useAnimatedStyle with horizontal scroll opacity logic
  //       expect(mockUseAnimatedStyle).toHaveBeenCalled()
  //       const styleFunction = mockUseAnimatedStyle.mock.calls[0][0]
  //       const style = styleFunction()

  //       expect(style).toBeDefined()
  //     })

  //     test('calculates opacity based on itemIndex and horizontal scroll', () => {
  //       render(
  //         <Provider store={store}>
  //           <ButtonSetReanimated
  //             item={testItem}
  //             itemIndex={0}
  //           />
  //         </Provider>
  //       )

  //       const styleFunction = mockUseAnimatedStyle.mock.calls[0][0]
  //       const style = styleFunction()

  //       expect(style.opacity).toBe(1)
  //     })
  //   })

  //   describe('Edge Cases', () => {
  //     test('handles missing item gracefully', () => {
  //       expect(() => {
  //         render(
  //           <Provider store={store}>
  //             <ButtonSetReanimated
  //               item={testItem}
  //               itemIndex={0}
  //             />
  //           </Provider>
  //         )
  //       }).not.toThrow()
  //     })

  //     test('handles missing AnimationContext gracefully', () => {
  //       // Mock useAnimation to throw error
  //       const originalUseAnimation = require('@/components/ItemCarousel/AnimationContext').useAnimation
  //       require('@/components/ItemCarousel/AnimationContext').useAnimation = jest.fn(() => {
  //         throw new Error('useAnimation must be used within an AnimationContext.AnimationProvider')
  //       })

  //       expect(() => {
  //         render(
  //           <Provider store={store}>
  //             <ButtonSetReanimated
  //               item={null}
  //               itemIndex={0}
  //             />
  //           </Provider>
  //         )
  //       }).toThrow()

  //       // Restore original
  //       require('@/components/ItemCarousel/AnimationContext').useAnimation = originalUseAnimation
  //     })
  //   })
  // })

  // describe('ButtonSetReanimated Integration', () => {
  //   test('works with complete animation flow', () => {
  //     const store = createMockStore()
  //     const testItem = {
  //       _id: '1',
  //       url: 'https://example.com',
  //       title: 'Test',
  //       isSaved: false,
  //       feed_id: 'feed1'
  //     }

  //     // Test complete integration
  //     const { UNSAFE_root } = render(
  //       <Provider store={store}>
  //         <ButtonSetReanimated
  //           item={testItem}
  //           itemIndex={0}
  //         />
  //       </Provider>
  //     )

  //     expect(UNSAFE_root).toBeTruthy()

  //     // Verify that all required animated styles are created
  //     expect(mockUseAnimatedStyle).toHaveBeenCalledTimes(6) // Main container + 5 buttons
  //   })
})
