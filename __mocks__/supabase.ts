import { supabase } from '../storage/supabase'

jest.mock('../storage/supabase')

const mockedSupabase = jest.mocked(supabase)

// mockedSupabase.auth.getSession.mockResolvedValue({ 
//   data: { 
//     session: { 
//       access_token: 'access_token',
//       refresh_token: 'refresh_token',
//       expires_in: 1,
//       token_type: 'token_type',
//       user: { 
//         app_metadata: {}, 
//         user_metadata: {}, 
//         aud: '', 
//         created_at: '123',
//         id: '1' 
//       } 
//     } 
//   },
//   error: null
// })

export const mockReturnValue = {
  url: new URL('https://url.com'),
  headers: {},
  insert: jest.fn().mockResolvedValue({ error: null }),
  select: jest.fn().mockResolvedValue({ error: null }),
  upsert: jest.fn().mockResolvedValue({ error: null }),
  update: jest.fn().mockResolvedValue({ error: null }),
  delete: jest.fn().mockResolvedValue({ error: null })
}

export default mockedSupabase