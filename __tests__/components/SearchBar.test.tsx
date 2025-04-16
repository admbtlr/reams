import React from 'react'
import { fireEvent } from '@testing-library/react-native'
import { render } from '../test-utils'
import SearchBar from '@/components/SearchBar'
import { ItemType } from '@/store/items/types'

// Mock dependencies
jest.mock('@/utils/dimensions', () => ({
  getMargin: jest.fn(() => 10),
  fontSizeMultiplier: jest.fn(() => 1),
  getInset: jest.fn(() => 20)
}))

jest.mock('@/utils/styles', () => ({
  textInfoStyle: jest.fn(() => ({
    fontFamily: 'IBMPlexSans',
    fontSize: 14,
    color: '#333333'
  })),
  textInputStyle: jest.fn(() => ({
    fontFamily: 'IBMPlexSans',
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#333333'
  }))
}))

// Mock selectors
jest.mock('@/sagas/selectors', () => ({
  getDisplay: jest.fn(() => 'unread')
}))

describe('SearchBar Component', () => {
  // Create a mock navigation object
  const mockNavigation = {
    navigate: jest.fn()
  }

  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks()
  })

  it('renders correctly with all expected elements', () => {
    const { getByText } = render(
      <SearchBar navigation={mockNavigation} />
    )
    
    // Check for static text
    expect(getByText('Search for:')).toBeTruthy()
    
    // Check for the Go button
    expect(getByText('Go')).toBeTruthy()
  })

  it('updates term state when text is entered', () => {
    const { getByTestId } = render(
      <SearchBar navigation={mockNavigation} />
    )
    
    // Find the TextInput by testID
    const textInput = getByTestId('search-input')
    
    // Enter text in the input
    fireEvent.changeText(textInput, 'React Native')
    
    // Verify the input received the value
    expect(textInput.props.value).toBe('React Native')
  })

  it('dispatches search actions and navigates when Go button is pressed', () => {
    const { getByText, getByTestId, store } = render(
      <SearchBar navigation={mockNavigation} />
    )
    
    // Find the TextInput by testID
    const textInput = getByTestId('search-input')
    
    // Type in the search term
    fireEvent.changeText(textInput, 'React Native')
    
    // Press the Go button
    const goButton = getByText('Go')
    fireEvent.press(goButton)
    
    // Check if the correct actions were dispatched
    const actions = store.getActions()
    expect(actions).toContainEqual({
      type: 'SET_SEARCH_TERM',
      term: 'React Native'
    })
    
    expect(actions).toContainEqual({
      type: 'UPDATE_CURRENT_INDEX',
      index: 0,
      displayMode: 'unread'
    })
    
    // Check if navigation was called with the correct params
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Items', expect.objectContaining({
      toItems: true
    }))
  })

  it('handles empty search terms', () => {
    const { getByText, store } = render(
      <SearchBar navigation={mockNavigation} />
    )
    
    // Press the Go button without entering any text
    const goButton = getByText('Go')
    fireEvent.press(goButton)
    
    // Check if search action was dispatched with empty term
    const actions = store.getActions()
    expect(actions).toContainEqual({
      type: 'SET_SEARCH_TERM',
      term: ''
    })
    
    // Navigation should still be called
    expect(mockNavigation.navigate).toHaveBeenCalled()
  })
})