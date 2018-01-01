import { delay } from 'redux-saga'
import { call, put, takeEvery, select, spawn } from 'redux-saga/effects'
import { fetchUnreadItems, markItemRead, loadMercuryStuff } from '../backends'
import 'whatwg-fetch'
import { REHYDRATE } from 'redux-persist/constants'
const RNFS = require('react-native-fs')
import { Image, InteractionManager } from 'react-native'
const co = require('co')

// const getUnreadItems = (state) => state.items.items

const getItems = (state, type) => {
  type = type || state.items.display === 'unread' ? 'items' : state.items.display
  return state.items[type]
}

const getDisplay = (state) => state.items.display

const coverImageCacheDir = RNFS.DocumentDirectoryPath + '/cover-images/'
// const feedWranglerAccessToken = '07de039941196f956e9e86e202574419'

function * markLastItemRead (action) {
  yield delay (100)
  const display = yield select(getDisplay)
  if (display !== 'unread') {
    return
  }
  const lastIndex = action.lastIndex
  const unreadItems = yield select(getItems)
  const item = unreadItems[lastIndex]
  try {
    yield markItemRead(item)
    yield put({
      type: 'ITEM_MARK_READ_SUCCESS',
      item,
      index: lastIndex
    })
  } catch (error) {
    console.log('Mark Item Read Error!')
    yield put({
      type: 'ITEMS_HAS_ERRORED',
      hasErrored: true
    })
  }
}

// function markRead (item) {
//   let url = 'https://feedwrangler.net/api/v2/feed_items/update?'
//   url += 'access_token=' + feedWranglerAccessToken
//   url += '&feed_item_id=' + item.feed_item_id
//   url += '&read=true'
//   return fetch(url)
//     .then((response) => {
//       if (!response.ok) {
//         throw Error(response.statusText)
//       }
//       return response
//     })
//     .then((response) => response.json())
// }

// function * loadMercuryForSurroundingItems (action) {
//   yield delay (100)
//   const items = yield select(getItems)
//   const index = action.index
//   const buffer = 2
//   const from = index - buffer >= 0 ? index - buffer : 0
//   const to = index + buffer < items.length ? index + buffer : items.length

//   for (let i = from; i < to; i++) {
//     yield loadMercuryIfNecessary(items[i])
//   }
// }

function * loadMercuryIfNecessary (item) {
  if (!item.hasLoadedMercuryStuff) {
    return yield loadMercuryForItem(item)
  }
}

function * loadMercuryForItem (item) {
  let mercuryStuff
  console.log(`Loading Mercury stuff for ${item._id} (${item.title})`)
  try {
    mercuryStuff = yield loadMercuryStuff(item)
  } catch (error) {
    console.log(error)
  }
  return mercuryStuff
}

function * saveExternalURL (action) {
  let item = {
    url: action.url,
    _id: Math.random().toString(36).substring(7),
    title: 'Loading...',
    content_html: 'Loading...',
    is_external: true
  }
  yield put({
    type: 'ITEM_SAVE_EXTERNAL_ITEM',
    item
  })
  yield loadMercuryForItem(item)
}

function * fetchItems () {
  const items = yield select(getItems, 'items')
  let latestDate = 0
  if (items.length > 0) {
    latestDate = [ ...items ].sort((a, b) => b.created_at - a.created_at)[0].created_at
  }
  try {
    const unreadItems = yield fetchUnreadItems(latestDate)
    yield put({
      type: 'ITEMS_FETCH_DATA_SUCCESS',
      items: unreadItems
    })
  } catch (error) {
    yield put({
      type: 'ITEMS_HAS_ERRORED',
      hasErrored: true,
      error
    })
  }
}

function * decorateItems (action) {
  const items = yield select(getItems, 'items')
  let count = 0
  let toDispatch = []

  yield spawn(function * () {
    while (true) {
      yield call(delay, 500)
      const dispatchNow = [...toDispatch]
      toDispatch = []
      for (decoration of dispatchNow) {
        yield put({
          type: 'ITEM_DECORATION_SUCCESS',
          ...decoration
        })
      }
    }
  })

  for (let item of items) {
    if (!item.hasLoadedMercuryStuff) {
      yield call(delay, 500)
      InteractionManager.runAfterInteractions(() => {
        return co(decorateItem(item)).then((decoration) => {
          toDispatch.push(decoration)
        })
      })
      count++
    }
  }
}

function * dispatchDecorations () {

}

function * decorateItem(item) {
  let imageStuff = {}
  const mercuryStuff = yield loadMercuryForItem(item)
  const coverImageURL = mercuryStuff.lead_image_url

  if (coverImageURL) {
    let imagePath = yield cacheCoverImage(coverImageURL, item._id)
    if (imagePath) {
      try {
        const imageDimensions = yield getImageDimensions(imagePath)
        imageStuff = {
          imagePath,
          imageDimensions
        }
      } catch (error) {
        console.log(error)
      }
    }
  }

  return {
    item,
    mercuryStuff,
    imageStuff
  }
}

function * createDirIfNecessary (path) {
  return RNFS.exists(path).then((exists) => {
      if (!exists) {
        return RNFS.mkdir(coverImageCacheDir).catch((err) => {
          console.log(err)
        })
      }
    })
}

function cacheCoverImage (imageURL, imageName) {
  const splitted = imageURL.split('.')
  const extension = splitted[splitted.length - 1].split('?')[0]
  const fileName = `${RNFS.DocumentDirectoryPath}/${imageName}.${extension}`
  // yield createDirIfNecessary(coverImageCacheDir)
  return RNFS.downloadFile({
    fromUrl: imageURL,
    toFile: fileName
  }).promise.then((result) => {
    console.log(`Downloaded file ${fileName} from ${imageURL}, status code: ${result.statusCode}, bytes written: ${result.bytesWritten}`)
    return fileName
  }).catch((err) => {
    console.log(err)
  })
}

function getImageDimensions (fileName) {
  return new Promise((resolve, reject) => {
    Image.getSize(`file://${fileName}`, (imageWidth, imageHeight) => {
      resolve({
        width: imageWidth,
        height: imageHeight
      })
    }, (error) => {
      console.log(error)
      reject(error)
    })
  })
}

function pruneCoverImageCache () {
  // const items = yield select(getItems, 'items')
  // const fileNames = readdir
}

/*
  Starts fetchUser on each dispatched `USER_FETCH_REQUESTED` action.
  Allows concurrent fetches of user.
*/
export function * updateCurrentIndex () {
  yield takeEvery('ITEMS_UPDATE_CURRENT_INDEX', markLastItemRead)
  // yield takeEvery('ITEMS_UPDATE_CURRENT_INDEX', loadMercuryForSurroundingItems)
  yield takeEvery('SAVE_EXTERNAL_URL', saveExternalURL)
  yield takeEvery('ITEMS_FETCH_ITEMS', fetchItems)
  yield takeEvery(REHYDRATE, fetchItems)
  yield takeEvery('ITEMS_FETCH_DATA_SUCCESS', decorateItems)
  yield takeEvery('ITEMS_FETCH_DATA_SUCCESS', pruneCoverImageCache)
}
