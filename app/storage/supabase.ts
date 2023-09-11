import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import Config from 'react-native-config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Item } from 'store/items/types'

const supabaseUrl = Config.SUPABASE_URL
const supabaseAnonKey = Config.SUPABASE_ANON_KEY

console.log('CONFIG', Config)

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    storage: AsyncStorage as any,
  },
})

export const getSavedItems = async () => {}

export const getReadItems = async () => {}

export const addReadItem = async (item: Item) => {}

export const addReadItems = async (items: Item[]) => {}

export const upsertSavedItem = async (item: Item) => {}

export const upsertSavedItems = async (items: Item[]) => {}




