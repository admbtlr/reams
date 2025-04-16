import React from 'react'
import { render, RenderOptions } from '@testing-library/react-native'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import type { RootState } from '@/store/reducers'
import { ReactElement } from 'react'

// Create a mock store creator with optional middleware
const mockStore = configureStore([])

// Default mock state - extend as needed for your tests
const defaultMockState: Partial<RootState> = {
  ui: {
    isDarkMode: false,
    fontSize: 3,
    showButtonLabels: true
  },
  config: {
    orientation: 'portrait'
  },
  itemsMeta: {
    display: 'list'
  },
  hostColors: {
    hostColors: []
  },
  feeds: {
    feeds: []
  },
  newsletters: {
    newsletters: []
  },
  categories: {
    categories: []
  },
  items: {
    items: []
  },
  annotations: {
    annotations: []
  }
}

// Interface for customizing the store in tests
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>
}

/**
 * Custom render function that wraps components with Redux Provider
 *
 * @param ui - The component to render
 * @param options - Custom render options including preloaded state
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
export function renderWithRedux(
  ui: ReactElement,
  { preloadedState = {}, ...renderOptions }: CustomRenderOptions = {}
) {
  // Merge default state with provided preloaded state
  const state = { ...defaultMockState, ...preloadedState }

  // Create store with merged state
  const store = mockStore(state)

  // Wrap in a Provider
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }

  // Return render result with store and useful extras
  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    store // Expose store for checking dispatched actions
  }
}

// Re-export everything from testing-library
export * from '@testing-library/react-native'

// Override render with custom renderWithRedux
export { renderWithRedux as render }
