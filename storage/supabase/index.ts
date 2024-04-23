import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import Config from 'react-native-config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Database } from '../supabase.types'
import log from '../../utils/log'
import { Platform } from 'react-native'

export * from './items'
export * from './feeds'
export * from './categories'
export * from './annotations'
export * from './newsletters'

const supabaseUrl = Config.SUPABASE_URL
const supabaseAnonKey = Config.SUPABASE_ANON_KEY

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

// not using this yet, but there are random errors with the supabase client
export const doQuery = async (fn: () => any, retries = 3): Promise<{ data: {}, error: {}}> => {
  try {
    const { data, error } = await fn()
    if (error) {
      throw error
    }
    return { data, error }
  } catch (error) {
    if (retries > 0) {
      log('doQuery, retrying', error)
      return await doQuery(fn, retries - 1)
    } else {
      log('doQuery', error)
      throw error  
    }
  }
}

export interface SourceDB {
  _id: string
  url: string
  title: string
  description: string
  root_url?: string
  color: string
  favicon_url: string
  favicon_size: string
  didError?: boolean
}


