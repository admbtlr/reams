import { createClient } from '@supabase/supabase-js'
import Config from 'react-native-config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Database } from '../supabase.types'
import log from '../../utils/log'

export * from './items'
export * from './feeds'
export * from './categories'
export * from './annotations'
export * from './newsletters'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    // ...(Platform.OS !== "web" ? { storage: AsyncStorage as any } : {}),
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export const getUserId = async () => {
  try {
    const { data } = await supabase.auth.getSession()
    return data?.session?.user?.id  
  } catch (error) {
    log('getUserId', error)
    throw error
  }
}

// there are random errors with the supabase client
export const doQuery = async (fn: () => any, retries = 5, timeout = 5000): Promise<{ data: {}|[], error: {}}> => {
  try {
    // console.log('Inside doQuery, running fn')
    const { data, error } = await Promise.race([
      fn(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
    ])
    // console.log('Inside doQuery, fn completed. Data: ' + JSON.stringify(data).substring(0, 50))
    if (error) {
      throw error
    }
    return { data, error }
  } catch (error: any) {
    console.log('Inside doQuery, error: ' + JSON.stringify(error))
    if (retries > 0) {
      // log('doQuery, retrying', error)
      return await doQuery(fn, retries - 1)
    } else {
      if (error.title !== 'Error: URLSearchParams.set is not implemented') {
        log('doQuery', error)
        throw error
      }
      return { data: {}, error }
    }
  }
}

export interface SourceDB {
  _id: string
  url: string
  title: string
  description: string | null
  root_url?: string | null
  color: string | null
  favicon_url: string | null
  favicon_size: string | null
  didError?: boolean | null
  subscribe_url?: string | null
  read_count?: number | null
  next_nudge?: number | null
  is_nudge_active?: boolean | null
}


