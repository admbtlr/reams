import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import Config from 'react-native-config'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = Config.SUPABASE_URL
const supabaseAnonKey = Config.SUPABASE_ANON_KEY

console.log('CONFIG', Config)

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    storage: AsyncStorage as any,
  },
})

