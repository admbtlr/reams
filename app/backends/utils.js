import log from '../utils/log'

// break a long array into several arrays of maxlength chunkSize
export function chunkArray (arr, chunkSize = 100) {
  let chunkStart = 0
  let chunkEnd
  let chunkedArray = []
  while (chunkStart < arr.length) {
    if (chunkStart + chunkSize < arr.length) {
      chunkEnd = chunkStart + chunkSize
    } else {
      chunkEnd = arr.length
    }
    chunkedArray.push(arr.slice(chunkStart, chunkEnd))
    chunkStart = chunkEnd
  }
  return chunkedArray
}

export async function getItemsByIds (itemIds, url, itemMapFunction, callback, fetchConfig) {
  const chunkedItemsIds = chunkArray(itemIds)
  const promises = chunkedItemsIds.map(itemIdChunk => {
    let chunkUrl = url + itemIdChunk.reduce((accum, id) => `${accum}${typeof id === 'object' ? id.id : id},`, '')
    return fetch(chunkUrl, fetchConfig)
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText)
        }
        return response
      })
      .then((response) => response.json())
      .then((json) => {
        const items = json.feed_items ? json.feed_items : json
        callback(items.map(itemMapFunction))
        return true
      })
      .catch(e => {
        // debugger
        log('getItemsByIds', e)
      })
  })
  return Promise.all(promises)
    .then(_ => true)
}

