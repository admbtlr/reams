import { delay } from 'redux-saga'
import { call, put, takeEvery, select, spawn } from 'redux-saga/effects'
import { loadMercuryStuff } from '../backends'
const RNFS = require('react-native-fs')
import { Image, InteractionManager } from 'react-native'
import { getCachedImagePath } from '../../utils'
const co = require('co')

import { getItems, getCurrentItem, getDisplay } from './selectors'
import { updateItemInFirestore } from '../firestore'

export function * decorateItems (action) {
  let items
  let item
  let pendingDecoration = [] // a local cache
  let count = 0
  let toDispatch = []

  // this is weird... but it was the only way I could dispatch actions
  // it's not possible from within the co call below
  yield spawn(function * () {
    let items, decoratedCount
    while (true) {
      yield call(delay, 300)
      const dispatchNow = [...toDispatch]
      toDispatch = []
      for (decoration of dispatchNow) {
        yield put({
          type: 'ITEM_DECORATION_SUCCESS',
          ...decoration
        })
        items = yield select(getItems, 'items')
        decoratedCount = items.filter((item) => item.hasLoadedMercuryStuff).length
        // console.log(`DECORATED ${decoratedCount} OUT OF ${items.length}`)
        yield put({
          type: 'ITEM_DECORATION_PROGRESS',
          totalCount: items.length,
          decoratedCount
        })

        const item = items.find(item => item._id === decoration.item._id)
        updateItemInFirestore(item)
      }
    }
  })

  while (true) {
    yield call(delay, 500)
    items = yield select(getItems, 'items')
    if (items.filter(item => item.hasLoadedMercuryStuff).length >= 100) continue
    item = items.find(item => !item.hasLoadedMercuryStuff && !pendingDecoration.find(pd => pd._id === item._id))
    if (item) {
      // console.log(`Got item: ${item.title}`)
      pendingDecoration.push(item)
      const itemToDecorate = item
      setTimeout(() => {
        if (!itemToDecorate) return // somehow item can become undefined here...?
        return co(decorateItem(itemToDecorate)).then((decoration) => {
          pendingDecoration = pendingDecoration.filter(pending => pending._id !== itemToDecorate._id)
          if (decoration) {
            toDispatch.push(decoration)
          }
        }).catch(error => {
          pendingDecoration = pendingDecoration.filter(pending => pending._id !== itemToDecorate._id)
        })
      }, 500)
    }
  }
}

function * loadMercuryForItem (item) {
  let mercuryStuff
  // console.log(`Loading Mercury stuff for ${item._id} (${item.title})`)
  try {
    mercuryStuff = yield loadMercuryStuff(item)
  } catch (error) {
    console.log(error)
  }
  return mercuryStuff
}

export function * decorateItem(item) {
  let imageStuff = {}
  // console.log(`Loading Mercury stuff for ${item._id}...`)
  const mercuryStuff = yield loadMercuryForItem(item)
  // console.log(`Loading Mercury stuff for ${item._id} done`)

  if (!mercuryStuff) {
    return false
  }

  if (mercuryStuff.lead_image_url) {
    let hasCoverImage = yield cacheCoverImage(item, mercuryStuff.lead_image_url)
    if (hasCoverImage) {
      try {
        const imageDimensions = yield getImageDimensions(item)
        imageStuff = {
          hasCoverImage,
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

function cacheCoverImage (item, imageURL) {
  const splitted = imageURL.split('.')
  // const extension = splitted[splitted.length - 1].split('?')[0].split('%')[0]
  // making a big assumption on the .jpg extension here...
  // and it seems like Image adds '.png' to a filename if there's no extension
  const fileName = getCachedImagePath(item)
  // console.log(`Loading cover image for ${item._id}...`)
  return RNFS.downloadFile({
    fromUrl: imageURL,
    toFile: fileName
  }).promise.then((result) => {
    // console.log(`Downloaded file ${fileName} from ${imageURL}, status code: ${result.statusCode}, bytes written: ${result.bytesWritten}`)
    // console.log(`Loading cover image for ${item._id} done`)
    return true
  }).catch((err) => {
    console.log(`Loading cover image for ${item._id} failed :(`)
    console.log(err)
    return false
  })
}

function getImageDimensions (item) {
  return new Promise((resolve, reject) => {
    Image.getSize(`file://${getCachedImagePath(item)}`, (imageWidth, imageHeight) => {
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

