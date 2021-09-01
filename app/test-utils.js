import React from 'react'
import configureMockStore from "redux-mock-store"
import { Provider } from 'react-redux'
import { render } from '@testing-library/react-native'

jest.mock('react-redux', () => {
  const ActualReactRedux = jest.requireActual('react-redux')
  return {
      ...ActualReactRedux,
      useSelector: jest.fn().mockImplementation(() => {
          return mockState;
      }),
  };
})

const mockStore = configureMockStore()
const state = {
  itemsUnread: {
    lastUpdated: 0
  }
}

const AllTheProviders = ({ children }) => {
  return (
    <Provider store={mockStore(state)}>
        {children}
    </Provider>
  )
}

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options })

// re-export everything
export * from '@testing-library/react-native'

// override render method
export { customRender as render }
