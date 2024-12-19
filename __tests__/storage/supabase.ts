import { create } from 'react-test-renderer'
import { getSavedItems } from '../../storage/supabase'
import { createSavedItem } from '../../utils/test-helpers'

jest.mock('@supabase/supabase-js')


jest.mock('../../utils/uuid', () => ({
  uuidv4: () => '1234',
  uuidv5: () => '5678'
}))

describe ('getSavedItems', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    const { createClient }  = require('@supabase/supabase-js')
    createClient.mockImplementation(() => ({
      from: () => ({
        select: () => ({
          eq: () => ({}),
          in: () => ({
            error: null,
            data: [{
              item_id: '1',
              saved_at: '2024-02-17 15:59:01.232+00'
            },
            {
              item_id: '2',
              saved_at: '2024-02-18 15:59:01.232+00'
            },
            {
              item_id: '3',
              saved_at: '2024-02-19 15:59:01.232+00'
            }]
          })
        })
      })
    }))

    console.log(createClient)
  })
  
  it('should getSavedItems correctly', async () => {
    const items = await getSavedItems([{
      ...createSavedItem('1'),
      url: 'http://example.com'
    }])
    expect(items).toEqual([
      { ...createSavedItem('3') },
      { ...createSavedItem('2') },
      {
        ...createSavedItem('1'),
        url: 'http://example.com'
      },
    ])
  })

  it('should remove remotely unsaved items on getSavedItems correctly', async () => {
    const items = await getSavedItems([{
      ...createSavedItem('4')
    }])
    expect(items).toEqual([
      { ...createSavedItem('3') },
      { ...createSavedItem('2') },
      { ...createSavedItem('1') }, 
    ])
  })

})