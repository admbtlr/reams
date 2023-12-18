import { supabase } from '../storage/supabase'

jest.mock('../storage/supabase')

const mockedSupabase = jest.mocked(supabase, true)

export default mockedSupabase