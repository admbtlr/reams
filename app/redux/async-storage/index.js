import { AsyncStorage } from 'react-native'
import log from '../../utils/log'

// export async function getItemAS (key) {

// }

export async function getItemsAS (keys) {
  if (typeof keys[0] === 'object') {
    keys = keys.map(item => item._id)
  }
  try {
    console.log(keys)
    const keyVals = await AsyncStorage.multiGet(keys)
    console.log(keyVals)
    return keyVals.map(keyVal => JSON.parse(keyVal[1]))
  } catch (err) {
    log('getItemsAS: ' + err)
  }
}

export async function setItemAS (item) {

}

export async function updateItemAS (item) {
  return await AsyncStorage.mergeItem(item._id, JSON.stringify(item))
}

export async function setItemsAS (items) {
  const keyVals = items.map(item => [
    item._id,
    JSON.stringify(item)
  ])
  try {
    return AsyncStorage.multiSet(keyVals)
  } catch (err) {
    log('setItemsAS' + err)
  }
}

export async function deleteItemAS (key) {

}

export async function deleteItemsAS (items) {
  const keys = items.map(item => item._id)
  try {
    return AsyncStorage.multiRemove(keys)
  } catch (err) {
    log('deleteItemsAS: ' + err)
  }
}

export async function clearItemsAS (keys) {
  return AsyncStorage.clear()
}
