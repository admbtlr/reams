import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

let PasswordStorage: any = null

if (Platform.OS === 'web') {
  PasswordStorage = AsyncStorage
} else {
  const EncryptedStorage = require('react-native-encrypted-storage').default
  PasswordStorage = EncryptedStorage
}

export default PasswordStorage

// export const PasswordStroage = {
//   async getItem(key: string) {
//     const value = PlatformStorage.getItem(key) :
//     if (!value) return null
//     return JSON.parse(value)
//   },
//   async setItem(key: string, value: any) {
//     await EncryptedStorage.setItem(key, JSON.stringify(value))
//   },
//   async remove(key: string) {
//     await EncryptedStorage.removeItem(key)
//   },
//   async clear() {
//     await EncryptedStorage.clear()
//   },
// }