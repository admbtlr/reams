import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import Config from 'react-native-config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Item } from '../store/items/types'
import { Database } from './supabase.types'

const supabaseUrl = Config.SUPABASE_URL
const supabaseAnonKey = Config.SUPABASE_ANON_KEY

console.log('CONFIG', Config)

export const supabase = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    storage: AsyncStorage as any,
  },
})

export const getSavedItems = async () => {}

export const getReadItems = async () => {}

export const addReadItem = async (item: Item) => {}

export const addReadItems = async (items: Item[]) => {}

export const addSavedItem = async (item: Item) => {
  const { data, error } = await supabase
    .from('Item')
    .upsert({ _id: item._id, url: item.url }, { onConflict: '_id,url' })
    .select()
  if (error) {
    throw error
  }
  const savedId = data[0]._id
  const { error: savedItemError } = await supabase
    .from('SavedItem')
    .insert({ item_id: savedId })
  if (savedItemError) {
    throw savedItemError
  }
}

export const upsertSavedItems = async (items: Item[]) => {}




