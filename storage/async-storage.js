import AsyncStorage from '@react-native-async-storage/async-storage'
import log from '../utils/log'

// export async function getItemAS (key) {

// }

export async function getItems (keys) {
  if (typeof keys[0] === 'object') {
    keys = keys.map(item => item._id)
  }
  try {
    const keyVals = await AsyncStorage.multiGet(keys)
    const mapped = keyVals.map(keyVal => JSON.parse(keyVal[1]))
    return mapped
  } catch (err) {
    log('getItemsIDB', err)
  }
}

export async function setItem (item) {

}

export async function updateItem (item) {
  return await AsyncStorage.mergeItem(item._id, JSON.stringify(item))
}

export async function updateItems (items) {
  for (item in items) {
    await updateItemAS(item)
  }
  return true
}

export async function setItems (items) {
  const keyVals = items.map(item => [
    item._id,
    JSON.stringify(item)
  ])
  try {
    return AsyncStorage.multiSet(keyVals)
  } catch (err) {
    log('setItemsIDB' + err)
  }
}

export async function deleteItem (key) {

}

export async function deleteItems (items) {
  const keys = items.map(item => item._id)
  try {
    return AsyncStorage.multiRemove(keys)
  } catch (err) {
    log('deleteItemsAS: ' + err)
  }
}

export async function clearItems (keys) {
  return AsyncStorage.clear()
}

export async function isIgnoredUrl (url) {
  const now = Math.round(Date.now() / 1000)
  let isIgnoredUrl = false
  try {
    let ignoredUrls = await AsyncStorage.getItem('ignoredUrls')
    ignoredUrls = ignoredUrls ? JSON.parse(ignoredUrls) : []
    ignoredUrls = pruneOldIgnoredUrls(ignoredUrls)
    isIgnoredUrl = ignoredUrls.find(ignored => ignored.url === url) !== undefined
    if (!isIgnoredUrl) {
      ignoredUrls.push({
        date: now,
        url
      })
    }
    await AsyncStorage.setItem('ignoredUrls', JSON.stringify(ignoredUrls))
  } catch (err) {
    log('addIgnoredUrl: ' + err)
  } finally {
    return isIgnoredUrl
  }
}

function pruneOldIgnoredUrls (ignoredUrls) {
  const now = Math.round(Date.now() / 1000)
  return ignoredUrls.filter(ignored => (now - ignored.date) < (60 * 60 * 24 * 7))
}