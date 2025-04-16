import React from 'react'
import { fireEvent, act } from '@testing-library/react-native'
import { Text } from 'react-native'
import { render } from '../test-utils'
import TextButton from '@/components/TextButton'

// Mock dependencies
jest.mock('@/utils/colors', () => ({
  hslString: jest.fn((color) => {
    switch(color) {
      case 'rizzleText': return '#333333'
      case 'buttonBG': return '#FFFFFF'
      default: return '#000000'
    }
  })
}))

jest.mock('@/utils/dimensions', () => ({
  fontSizeMultiplier: jest.fn(() => 1),
  getInset: jest.fn(() => 20)
}))

jest.mock('@/components/BackgroundGradient', () => ({
  BackgroundGradient: () => null
}))

// Mock LayoutAnimation to avoid test errors
jest.mock('react-native/Libraries/LayoutAnimation/LayoutAnimation', () => ({
  configureNext: jest.fn(),
  Presets: { spring: {} }
}))

describe('TextButton Component', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(
      <TextButton 
        text="Button Text"
        testID="test-button"
      />
    )
    
    expect(getByText('Button Text')).toBeTruthy()
  })

  it('calls onPress when clicked', () => {
    const onPressMock = jest.fn()
    const { getByTestId } = render(
      <TextButton 
        text="Click Me"
        onPress={onPressMock}
        testID="test-button"
      />
    )
    
    fireEvent.press(getByTestId('test-button'))
    expect(onPressMock).toHaveBeenCalledTimes(1)
  })

  it('applies custom styles', () => {
    const { getByTestId } = render(
      <TextButton 
        text="Styled Button"
        bgColor="#FF0000"
        fgColor="#FFFFFF"
        buttonStyle={{ marginTop: 10 }}
        testID="test-button"
      />
    )
    
    const button = getByTestId('test-button')
    expect(button.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: '#FF0000',
        marginTop: 10
      })
    )
  })

  it('renders as disabled when isDisabled is true', () => {
    const onPressMock = jest.fn()
    const { getByTestId, getByText } = render(
      <TextButton 
        text="Disabled Button"
        isDisabled={true}
        onPress={onPressMock}
        testID="test-button"
      />
    )
    
    const textElement = getByText('Disabled Button')
    expect(textElement.props.style).toEqual(
      expect.objectContaining({
        opacity: 0.6
      })
    )
    
    // React Native doesn't expose the disabled prop directly in test queries
    // Instead, check if the component has the correct aria attributes
    const button = getByTestId('test-button')
    
    // Just verify the press doesn't trigger the onPress callback when disabled
    fireEvent.press(button)
    expect(onPressMock).not.toHaveBeenCalled()
  })

  it('renders with an icon', () => {
    const icon = <Text testID="icon">🔍</Text>
    const { getByTestId } = render(
      <TextButton 
        text="Button with Icon"
        icon={icon}
        testID="test-button"
      />
    )
    
    expect(getByTestId('icon')).toBeTruthy()
  })

  it('toggles expanded state when expandable and clicked', () => {
    // Mock Platform.OS to avoid LayoutAnimation issues
    const Platform = require('react-native/Libraries/Utilities/Platform')
    Platform.OS = 'ios'
    
    const onExpandMock = jest.fn()
    const iconCollapsed = <Text testID="icon-collapsed">+</Text>
    const iconExpanded = <Text testID="icon-expanded">-</Text>
    
    const { getByTestId, queryByTestId, getByText, rerender } = render(
      <TextButton 
        text="Expandable Button"
        isExpandable={true}
        iconCollapsed={iconCollapsed}
        iconExpanded={iconExpanded}
        onExpand={onExpandMock}
        testID="expandable-button-content"
      />
    )
    
    // Initially collapsed
    expect(getByTestId('icon-collapsed')).toBeTruthy()
    expect(queryByTestId('icon-expanded')).toBeNull()
    
    // Trigger expand
    fireEvent.press(getByText('Expandable Button'))
    
    // After expanding
    expect(onExpandMock).toHaveBeenCalledWith(true)
  })

  it('renders with inverted colors when isInverted is true', () => {
    const { getByTestId, getByText } = render(
      <TextButton 
        text="Inverted Button"
        isInverted={true}
        bgColor="#FFFFFF" // Normal background
        fgColor="#000000" // Normal foreground
        testID="test-button"
      />
    )
    
    const textElement = getByText('Inverted Button')
    // For inverted button, text color should be the normal background color
    expect(textElement.props.style).toEqual(
      expect.objectContaining({
        color: '#FFFFFF'
      })
    )
    
    // And button background should be the normal foreground color
    const button = getByTestId('test-button')
    expect(button.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: '#000000'
      })
    )
  })
})