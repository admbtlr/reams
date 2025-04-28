import React from 'react'
import { render, RenderOptions } from '@testing-library/react-native'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import type { RootState } from '@/store/reducers'
import { ReactElement } from 'react'
import rootReducer from '@/store/reducers'
import { setupStore } from '../store'

// Mock redux-persist to avoid storage issues in tests
jest.mock('redux-persist', () => {
  const real = jest.requireActual('redux-persist')
  return {
    ...real,
    persistReducer: jest.fn().mockImplementation((_, reducers) => reducers),
  }
})

// Default mock state - provides a complete state structure for all components
const defaultMockState: Partial<RootState> = {
  ui: {
    isDarkMode: false,
    fontSize: 14,
    showButtonLabels: true,
    imageViewerVisible: false,
    searchTerm: '',
    helpTipShown: null
  },
  config: {
    orientation: 'portrait',
    // Add other common config values here
  },
  itemsMeta: {
    display: 'unread',
    allLoaded: false,
    currentIndex: 0,
    lastUpdated: Date.now()
  },
  hostColors: {
    hostColors: []
  },
  feeds: {
    feeds: []
  },
  feedsLocal: {
    feeds: []
  },
  newsletters: {
    newsletters: []
  },
  categories: {
    categories: []
  },
  itemsUnread: {
    items: [],
    index: 0,
    lastUpdated: Date.now()
  },
  itemsSaved: {
    items: [],
    index: 0,
    lastUpdated: Date.now()
  },
  annotations: {
    annotations: []
  }
}

// Interface for customizing the store in tests
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: ReturnType<typeof configureStore>;
}

/**
 * Custom render function that wraps components with Redux Provider using a real store
 *
 * @param ui - The component to render
 * @param options - Custom render options including preloaded state or custom store
 * @returns The render result with additional helper methods
 *
 * @example
 * // Basic usage with default state
 * const { getByText } = renderWithRedux(<MyComponent />)
 *
 * // Usage with custom state
 * const { getByTestId } = renderWithRedux(<MyComponent />, {
 *   preloadedState: { ui: { isDarkMode: true } }
 * })
 */
/**
 * Deep merge function to properly merge nested objects in the Redux state
 */
function deepMerge(target: any, source: any): any {
  if (typeof source !== 'object' || source === null) {
    return source;
  }

  if (typeof target !== 'object' || target === null) {
    return { ...source };
  }

  // Create a proper result object based on whether target is an array
  const result = Array.isArray(target) ? [...target] : { ...target };

  // Handle arrays differently than objects
  if (Array.isArray(source)) {
    if (Array.isArray(target)) {
      // If both are arrays, return the source array
      return [...source];
    } else {
      // If source is array but target is not, return source array
      return [...source];
    }
  }

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (key in target && typeof source[key] === 'object' && source[key] !== null) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
}

export function renderWithRedux(
  ui: ReactElement,
  {
    preloadedState = {},
    store = setupStore(deepMerge(defaultMockState, preloadedState)),
    ...extendedRenderOptions
  }: ExtendedRenderOptions = {}
) {

  // Debug the state to see what's happening
  // console.log(preloadedState)
  // console.log(deepMerge(defaultMockState, preloadedState))
  // console.log('Test Redux State:', JSON.stringify(store.getState()));

  // Wrap in a Provider
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }

  // Return render result with store and useful extras
  return {
    ...render(ui, { wrapper: Wrapper, ...extendedRenderOptions }),
    store // Expose store for dispatching actions or checking state
  }
}

// Re-export everything from testing-library
export * from '@testing-library/react-native'

// Override render with custom renderWithRedux
export { renderWithRedux as render }

// Add this to make Jest recognize this file as a valid test module
describe('Test Utilities', () => {
  it('should be a valid test module', () => {
    expect(true).toBe(true);
  });
});
