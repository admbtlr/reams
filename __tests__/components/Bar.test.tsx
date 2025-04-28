import React from 'react'
import { render } from '../test-utils-helpers'
import { Bar } from '@/components/Bar'

// Mock the useColor hook
jest.mock('@/hooks/useColor', () => ({
  useColor: jest.fn(() => '#123456')
}))

describe('Bar Component', () => {
  const mockItem = {
    _id: '1',
    title: 'Test Item',
    url: 'https://example.com',
    content_html: '<p>Test content</p>',
    date_published: '2023-01-01',
    authors: [],
    tags: []
  }

  it('renders correctly with the expected style', () => {
    const { getByTestId } = render(
      <Bar 
        item={mockItem}
        testID="test-bar"
      />
    )
    
    const barElement = getByTestId('test-bar')
    
    expect(barElement).toBeTruthy()
    expect(barElement.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: '#123456',
        borderRadius: 10,
        height: 20,
        width: 100
      })
    )
  })
})