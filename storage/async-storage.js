import AsyncStorage from '@react-native-async-storage/async-storage'
import log from '../utils/log'

// export async function getItemAS (key) {

// }

export async function getItemsAS (keys) {
  if (typeof keys[0] === 'object') {
    keys = keys.map(item => item._id)
  }
  try {
    const keyVals = await AsyncStorage.multiGet(keys)
    const mapped = keyVals.map(keyVal => JSON.parse(keyVal[1]))
    return mapped
  } catch (err) {
    log('getItemsAS', err)
  }
}

export async function setItemAS (item) {

}

export async function updateItemAS (item) {
  return await AsyncStorage.mergeItem(item._id, JSON.stringify(item))
}

export async function updateItemsAS (items) {
  for (item in items) {
    await updateItemAS(item)
  }
  return true
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