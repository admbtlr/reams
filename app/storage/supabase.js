import AsyncStorage from '@react-native-async-storage/async-storage'
import {createClient} from '@supabase/supabase-js'
import Config from 'react-native-config'

let client = createClient(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY, {
  localStorage: AsyncStorage,
  detectSessionInUrl: false,
})

export default client
