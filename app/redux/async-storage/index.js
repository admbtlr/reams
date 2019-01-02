import { AsyncStorage } from 'react-native'

export async function getItemAS (key) {

}

export async function getItemsAS (keys) {
  if (typeof keys[0] === 'object') {
    keys = keys.map(item => item._id)
  }
  const keyVals = await AsyncStorage.multiGet(keys)
  return keyVals.map(keyVal => JSON.parse(keyVal[1]))
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
  return AsyncStorage.multiSet(keyVals)
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
