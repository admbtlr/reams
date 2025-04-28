import React from 'react'
import { fireEvent } from '@testing-library/react-native'
import { render } from '../test-utils-helpers'
import RadioButtons from '@/components/RadioButtons'

// Mock dependencies
jest.mock('@/utils/dimensions', () => ({
  getMargin: jest.fn(() => 10)
}))

jest.mock('@/utils/colors', () => ({
  hslString: jest.fn((color) => {
    switch(color) {
      case 'logo1': return '#FF0000'
      case 'rizzleText': return '#333333'
      case 'white': return '#FFFFFF'
      default: return '#000000'
    }
  })
}))

jest.mock('@/utils/styles', () => ({
  textInfoStyle: jest.fn(() => ({
    fontFamily: 'IBMPlexSans',
    fontSize: 14,
    lineHeight: 18
  }))
}))

jest.mock('@/utils/rizzle-button-icons', () => ({
  getRizzleButtonIcon: jest.fn((icon, color) => <></>)
}))

describe('RadioButtons Component', () => {
  // Sample data for testing
  const radioData = [
    { value: 1, label: 'Option 1' },
    { value: 2, label: 'Option 2' },
    { value: 3, label: 'Option 3' }
  ]

  it('renders all options correctly', () => {
    const { getAllByText } = render(
      <RadioButtons 
        data={radioData}
        selected={1}
        onSelect={jest.fn()}
      />
    )
    
    // Check if all options are rendered
    expect(getAllByText(/Option \d/)).toHaveLength(3)
    expect(getAllByText('Option 1')).toHaveLength(1)
    expect(getAllByText('Option 2')).toHaveLength(1)
    expect(getAllByText('Option 3')).toHaveLength(1)
  })

  it('highlights the selected option', () => {
    const { getAllByText } = render(
      <RadioButtons 
        data={radioData}
        selected={2}
        onSelect={jest.fn()}
      />
    )
    
    // Get all option elements
    const option1 = getAllByText('Option 1')[0]
    const option2 = getAllByText('Option 2')[0]
    const option3 = getAllByText('Option 3')[0]
    
    // Check if Option 2 has the selected color (white text on selected background)
    expect(option1.props.style.color).toBe('#333333') // Not selected
    expect(option2.props.style.color).toBe('#FFFFFF') // Selected
    expect(option3.props.style.color).toBe('#333333') // Not selected
  })

  it('calls onSelect with correct value when an option is pressed', () => {
    const onSelectMock = jest.fn()
    const { getByText } = render(
      <RadioButtons 
        data={radioData}
        selected={1}
        onSelect={onSelectMock}
      />
    )
    
    // Press Option 3
    fireEvent.press(getByText('Option 3'))
    
    // Check if onSelect was called with the correct value
    expect(onSelectMock).toHaveBeenCalledWith(3)
  })

  it('renders options with icons when provided', () => {
    // Create test data with icons
    const dataWithIcons = [
      { value: 1, label: 'Option 1', icon: 'icon1' },
      { value: 2, label: 'Option 2', icon: 'icon2' }
    ]
    
    const { getByText } = render(
      <RadioButtons 
        data={dataWithIcons}
        selected={1}
        onSelect={jest.fn()}
      />
    )
    
    // Verify the component renders without errors when icons are provided
    expect(getByText('Option 1')).toBeTruthy()
    expect(getByText('Option 2')).toBeTruthy()
    
    // Check that getRizzleButtonIcon was called with correct props
    const { getRizzleButtonIcon } = require('@/utils/rizzle-button-icons')
    expect(getRizzleButtonIcon).toHaveBeenCalledWith('icon1', '#FFFFFF')
    expect(getRizzleButtonIcon).toHaveBeenCalledWith('icon2', '#333333')
  })

  it('applies proper styling for selected vs unselected items', () => {
    const { UNSAFE_getAllByType } = render(
      <RadioButtons 
        data={radioData}
        selected={2}
        onSelect={jest.fn()}
      />
    )
    
    // Get all the View containers for radio options
    const containers = UNSAFE_getAllByType('View').filter(
      view => view.props.style && 
      typeof view.props.style === 'object' && 
      'borderWidth' in view.props.style
    )
    
    // Should have 3 option containers
    expect(containers).toHaveLength(3)
    
    // Check the backgrounds (selected item should have logo1 color)
    expect(containers[0].props.style.backgroundColor).toBe('#FFFFFF') // Unselected
    expect(containers[1].props.style.backgroundColor).toBe('#FF0000') // Selected (Option 2)
    expect(containers[2].props.style.backgroundColor).toBe('#FFFFFF') // Unselected
  })
})