import { AsyncStorage } from 'react-native'
import log from '../../utils/log'

// export async function getItemAS (key) {

// }

export async function getItemsAS (keys) {
  if (typeof keys[0] === 'object') {
    keys = keys.map(item => item._id)
  }
  try {
    const keyVals = await AsyncStorage.multiGet(keys)
    return keyVals.map(keyVal => JSON.parse(keyVal[1]))
  } catch (err) {

  }
}

export async function setItemAS (item) {

}

export async function updateItemAS (item) {
  return AsyncStorage.mergeItem(item._id, JSON.stringify(item))
}

export async function setItemsAS (items) {
  const keyVals = items.map(item => [
    item._id,
    JSON.stringify(item)
  ])
  try {
    return AsyncStorage.multiSet(keyVals)
  } catch (err) {
    log(err)
  }
}

export async function deleteItemAS (key) {

}

export async function deleteItemsAS (items) {
  const keys = items.map(item => item._id)
  return AsyncStorage.multiRemove(keys)
}

export async function clearItemsAS (keys) {
  return AsyncStorage.clear()
}
