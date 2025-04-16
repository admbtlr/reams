import React from 'react'
import { fireEvent } from '@testing-library/react-native'
import { render } from '../test-utils'
import XButton from '@/components/XButton'

// Mock the fontSizeMultiplier function
jest.mock('@/utils/dimensions', () => ({
  fontSizeMultiplier: jest.fn(() => 1)
}))

describe('XButton Component', () => {
  it('renders correctly with light mode', () => {
    const { getByTestId } = render(
      <XButton 
        isLight={true} 
        onPress={jest.fn()}
        testID="x-button"
      />
    )
    expect(getByTestId('x-button')).toBeTruthy()
  })

  it('renders correctly with dark mode', () => {
    const { getByTestId } = render(
      <XButton 
        isLight={false} 
        onPress={jest.fn()}
        testID="x-button"
      />
    )
    expect(getByTestId('x-button')).toBeTruthy()
  })

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn()
    const { getByTestId } = render(
      <XButton 
        isLight={true} 
        onPress={onPressMock}
        testID="x-button"
      />
    )
    
    fireEvent.press(getByTestId('x-button'))
    expect(onPressMock).toHaveBeenCalledTimes(1)
  })
})