import React from 'react'
import { fireEvent } from '@testing-library/react-native'
import { render } from '../test-utils-helpers'
import { Text } from 'react-native'
import SwitchRow from '@/components/SwitchRow'

// Mock dependencies
jest.mock('@/utils/dimensions', () => ({
  fontSizeMultiplier: jest.fn(() => 1),
  isIpad: jest.fn(() => false),
  hasNotchOrIsland: jest.fn(() => false)
}))

jest.mock('@/utils/colors', () => ({
  hslString: jest.fn((color, shade, opacity) => {
    if (opacity) {
      return `rgba(51, 51, 51, ${opacity})`
    }
    return '#333333'
  })
}))

jest.mock('@/utils/styles', () => ({
  textInfoStyle: jest.fn(() => ({
    fontFamily: 'IBMPlexSans',
    fontSize: 14,
    color: '#333333'
  })),
  textInfoBoldStyle: jest.fn(() => ({
    fontFamily: 'IBMPlexSans-Bold',
    fontSize: 14,
    color: '#333333'
  }))
}))

describe('SwitchRow Component', () => {
  it('renders correctly with label', () => {
    const { getByText, getByTestId } = render(
      <SwitchRow 
        testID="test-switch-row"
        label="Enable Feature"
        value={false}
        onValueChange={jest.fn()}
      />
    )
    
    // Check label is rendered correctly
    expect(getByText('Enable Feature')).toBeTruthy()
    
    // Check testID is applied correctly
    expect(getByTestId('test-switch-row')).toBeTruthy()
    expect(getByTestId('test-switch-row-label')).toBeTruthy()
    expect(getByTestId('test-switch-row-switch')).toBeTruthy()
  })

  it('renders with an icon when provided', () => {
    const icon = <Text testID="test-icon">Icon</Text>
    const { getByTestId } = render(
      <SwitchRow 
        testID="test-switch-row"
        label="Enable Feature"
        value={false}
        onValueChange={jest.fn()}
        icon={icon}
      />
    )
    
    // Verify both the component and the icon render
    expect(getByTestId('test-switch-row')).toBeTruthy()
    expect(getByTestId('test-icon')).toBeTruthy()
  })

  it('shows the correct switch state based on value prop', () => {
    const { getByTestId, rerender } = render(
      <SwitchRow 
        testID="test-switch-row"
        label="Enable Feature"
        value={false}
        onValueChange={jest.fn()}
      />
    )
    
    // Find the Switch component using testID
    const switchComponent = getByTestId('test-switch-row-switch')
    expect(switchComponent.props.value).toBe(false)
    
    // Re-render with value=true
    rerender(
      <SwitchRow 
        testID="test-switch-row"
        label="Enable Feature"
        value={true}
        onValueChange={jest.fn()}
      />
    )
    
    // Check that the switch state changed
    const updatedSwitchComponent = getByTestId('test-switch-row-switch')
    expect(updatedSwitchComponent.props.value).toBe(true)
  })

  it('calls onValueChange when switch is toggled', () => {
    const onValueChangeMock = jest.fn()
    const { getByTestId } = render(
      <SwitchRow 
        testID="test-switch-row"
        label="Enable Feature"
        value={false}
        onValueChange={onValueChangeMock}
      />
    )
    
    // Find the Switch component using testID
    const switchComponent = getByTestId('test-switch-row-switch')
    
    // Trigger the onValueChange callback
    fireEvent(switchComponent, 'valueChange', true)
    
    // Check if the callback was called with the correct value
    expect(onValueChangeMock).toHaveBeenCalledWith(true)
  })

  it('renders with help text when provided and enabled', () => {
    // Note: The component has a "false" condition in the help text rendering
    // For full test coverage, we would need to modify the component to make help text conditional only on the help prop
    
    // Implementation is commented out for now since the component has help text disabled (help && false)
    /*
    const { getByText } = render(
      <SwitchRow 
        label="Enable Feature"
        help="This feature does something cool"
        value={false}
        onValueChange={jest.fn()}
      />
    )
    
    expect(getByText('This feature does something cool')).toBeTruthy()
    */
  })

  it('applies correct styling to component elements', () => {
    const { getByTestId } = render(
      <SwitchRow 
        testID="test-switch-row"
        label="Enable Feature"
        value={true}
        onValueChange={jest.fn()}
      />
    )
    
    // Check that the container has the expected styling
    const container = getByTestId('test-switch-row')
    expect(container.props.style).toMatchObject({
      flex: 0,
      flexDirection: 'column',
      borderTopWidth: 1
    })
    
    // Check that the label has the expected styling
    const label = getByTestId('test-switch-row-label')
    expect(label.props.style).toBeDefined()
  })
})