import { getSavedItems } from '../../storage/supabase'
import { createSavedItem } from '../../utils/test-helpers'

// This provides a more flexible approach to mock Supabase queries
jest.mock('../../storage/supabase', () => {
  const originalModule = jest.requireActual('../../storage/supabase')
  
  // Create a sequence-based mock for doQuery
  // This approach mocks different responses based on the call sequence
  const mockDoQuery = jest.fn()
    // First query - Gets saved item IDs
    .mockImplementationOnce(() => Promise.resolve({
      data: [
        { item_id: '1', saved_at: '2024-02-17 15:59:01.232+00' },
        { item_id: '2', saved_at: '2024-02-18 15:59:01.232+00' },
        { item_id: '3', saved_at: '2024-02-19 15:59:01.232+00' }
      ],
      error: null
    }))
    // Second query - Gets item details
    .mockImplementationOnce(() => Promise.resolve({
      data: [
        {
          _id: '2',
          url: 'http://example2.com',
          title: 'Item 2',
          feed_id: 'feed1'
        },
        {
          _id: '3',
          url: 'http://example3.com',
          title: 'Item 3',
          feed_id: 'feed1'
        }
      ],
      error: null
    }))
    // Default fallback for any additional calls
    .mockImplementation(() => Promise.resolve({
      data: [],
      error: null
    }))

  // Mock getUserId
  const mockGetUserId = jest.fn().mockResolvedValue('mock-user-id')
  
  return {
    ...originalModule,
    doQuery: mockDoQuery,
    getUserId: mockGetUserId,
    // Re-export the original getSavedItems since we're testing that
    getSavedItems: originalModule.getSavedItems
  }
})

describe('getSavedItems', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should getSavedItems correctly', async () => {
    const items = await getSavedItems([{
      ...createSavedItem('1'),
      url: 'http://example.com'
    }])
    
    // Verify the results
    expect(items.length).toBe(3)
    
    // Check item order (sorted by savedAt, newest first)
    expect(items[0]._id).toBe('3')
    expect(items[1]._id).toBe('2')
    expect(items[2]._id).toBe('1')
    
    // Check specific item properties
    expect(items[0]).toMatchObject({
      _id: '3',
      url: 'http://example3.com',
      title: 'Item 3',
      isSaved: true
    })
    
    expect(items[2]).toMatchObject({
      _id: '1',
      url: 'http://example.com',
      title: 'Item 1',
      isSaved: true
    })
  })
})