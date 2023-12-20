import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Item } from '../store/items/types'
import { Database } from './supabase.types'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../.env.web'

const supabaseUrl = SUPABASE_URL
const supabaseAnonKey = SUPABASE_ANON_KEY

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




