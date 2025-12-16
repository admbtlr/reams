import { call, delay, put, select, spawn } from 'redux-saga/effects'
import { loadMercuryStuff } from '../backends'
import * as FileSystem from 'expo-file-system'
import { InteractionManager, Platform } from 'react-native'
import {
  ITEM_DECORATION_FAILURE,
  ITEM_DECORATION_SUCCESS,
  IMAGE_ANALYSIS_DONE,
  ImageStuff,
  Item,
  ItemInflated,
  ItemType,
  MercuryStuff,
  UPDATE_ITEM,
  ItemStyles
} from '../store/items/types'
import { getCachedCoverImagePath, getImageDimensions } from '../utils'
import {
  setCoverInline,
  setCoverAlign,
  setTitleVAlign
} from '../utils/createItemStyles'
import { getCurrentItem, getItem, getNewsletters } from './selectors'
import { faceDetection } from '../utils/face-detection'

import {
  getIndex,
  getItems,
  getDisplay,
  getFeeds,
  getSavedItems
} from './selectors'
import { getItems as getStoredItems, updateItem } from '../storage'
import { Feed, Source } from '../store/feeds/types'
import { Category } from '../store/categories/types'
import { RootState } from '../store/reducers'
import { Filter } from '../store/config/config'
import {
  addMercuryStuffToItem,
  deflateItem,
  removeCachedCoverImageDuplicate,
  setShowCoverImage
} from '../utils/item-utils'
import log from '../utils/log'
import { downloadContent } from '../backends/fastmail'
import { Newsletter } from '../store/newsletters/types'

let pendingDecoration: Item[] = [] // a local cache
let toDispatch = []

const showLogs = true

export const MAX_DECORATION_FAILURES = 3

// Timing instrumentation
interface TimingStats {
  count: number
  totalTime: number
  averageTime: number
}

const timingStats = {
  downloadContent: { count: 0, totalTime: 0, averageTime: 0 } as TimingStats,
  mercury: { count: 0, totalTime: 0, averageTime: 0 } as TimingStats,
  cacheImage: { count: 0, totalTime: 0, averageTime: 0 } as TimingStats,
  faceDetection: { count: 0, totalTime: 0, averageTime: 0 } as TimingStats,
  basicDecoration: { count: 0, totalTime: 0, averageTime: 0 } as TimingStats,
  total: { count: 0, totalTime: 0, averageTime: 0 } as TimingStats
}

function logBasicDecorationStats(
  itemTitle: string,
  basicDuration: number,
  stepTimings: { [key: string]: number }
) {
  // if (stepTimings.downloadContent)
    // console.log(`  Download Content: ${stepTimings.downloadContent}ms`)
  // if (stepTimings.cacheImage)
    // console.log(`  Cache Image: ${stepTimings.cacheImage}ms`)
}

function logFullDecorationStats(itemTitle: string, faceDuration: number) {
  console.log(
    `Image analysis complete for "${itemTitle}" - Face detection: ${faceDuration}ms`
  )
  console.log(`Running averages:`)
  console.log(
    `  Basic Decoration: ${timingStats.basicDecoration.averageTime.toFixed(
      0
    )}ms avg (${timingStats.basicDecoration.count} items)`
  )
  console.log(
    `  Face Detection: ${timingStats.faceDetection.averageTime.toFixed(
      0
    )}ms avg (${timingStats.faceDetection.count} items)`
  )
  console.log(
    `  Total (Basic + Face): ${(
      timingStats.basicDecoration.averageTime +
      timingStats.faceDetection.averageTime
    ).toFixed(0)}ms avg`
  )
}

function updateTimingStats(step: keyof typeof timingStats, duration: number) {
  const stats = timingStats[step]
  stats.count++
  stats.totalTime += duration
  stats.averageTime = stats.totalTime / stats.count
}

function logTimingStats(
  itemTitle: string,
  stepTimings: { [key: string]: number }
) {
  console.log(`\n=== Decoration Timing for "${itemTitle}" ===`)
  console.log(`This item:`)
  if (stepTimings.downloadContent)
    console.log(`  Download Content: ${stepTimings.downloadContent}ms`)
  console.log(`  Mercury API: ${stepTimings.mercury}ms`)
  if (stepTimings.cacheImage)
    console.log(`  Cache Image: ${stepTimings.cacheImage}ms`)
  if (stepTimings.faceDetection)
    console.log(`  Face Detection: ${stepTimings.faceDetection}ms`)
  console.log(`  Total: ${stepTimings.total}ms`)
  console.log(`Running averages:`)
  console.log(
    `  Download Content: ${timingStats.downloadContent.averageTime.toFixed(
      0
    )}ms avg (${timingStats.downloadContent.count} items)`
  )
  console.log(
    `  Mercury API: ${timingStats.mercury.averageTime.toFixed(0)}ms avg (${
      timingStats.mercury.count
    } items)`
  )
  console.log(
    `  Cache Image: ${timingStats.cacheImage.averageTime.toFixed(0)}ms avg (${
      timingStats.cacheImage.count
    } items)`
  )
  console.log(
    `  Face Detection: ${timingStats.faceDetection.averageTime.toFixed(
      0
    )}ms avg (${timingStats.faceDetection.count} items)`
  )
  console.log(
    `  Total Decoration: ${timingStats.total.averageTime.toFixed(0)}ms avg (${
      timingStats.total.count
    } items)`
  )
  console.log('=======================================\n')
}

interface Decoration {
  item: WholeItem
  mercuryStuff: MercuryStuff
  imageStuff: ImageStuff
}

interface BasicImageStuff {
  imageDimensions?: any
}

interface FullImageStuff extends BasicImageStuff {
  faceCentreNormalised?: any
}

interface WholeItem extends Item, ItemInflated {}

export function* decorateItems() {
  let items
  let item
  let count = 0

  // Spawn basic decoration process
  yield spawn(function* () {
    while (true) {
      const nextItem: Item = yield getNextItemToDecorate()
      // console.log('Looking for new item')
      if (nextItem) {
        // consoleLog(`Got item to decorate: ${nextItem.title}`)
        pendingDecoration.push(nextItem)
        if (!nextItem) continue // somehow item can become undefined here...?
        yield decorateItem(nextItem)
      } else {
        yield delay(1000)
      }
    }
  })

  // Spawn independent image analysis process (native platforms only)
  if (Platform.OS !== 'web') {
    yield spawn(function* () {
      while (true) {
        const nextItem: Item = yield getNextItemToAnalyse()
        if (nextItem) {
          yield analyseItem(nextItem)
        } else {
          yield delay(2000)
        }
      }
    })
  }
}

export function* decorateItem(item: Item) {
  // console.log(`Inside decorateItem "${item.title}"`)
  try {
    const result = yield assembleBasicDecoration(item)
    if (result && result.mercuryStuff && !result.mercuryStuff.error) {
      yield applyBasicDecoration(result)
    } else {
      yield decorationFailed(item)
    }
  } catch (error) {
    yield decorationFailed(item)
  }
}

export function* analyseItem(item: Item) {
  try {
    const faceCentreNormalised = yield performImageAnalysisForItem(item)
    if (faceCentreNormalised?.x) {
      yield applyImageAnalysis(item, faceCentreNormalised)
    }
    yield put({
      type: IMAGE_ANALYSIS_DONE,
      item,
      isSaved: item.isSaved
    })
  } catch (error) {
    console.log(`Image analysis failed for "${item.title}":`, error)
  }
}

function* decorationFailed(item: Item) {
  if (!item) return
  consoleLog(
    `Error decorating item "${item.title}", trying again next time around`
  )
  yield call(InteractionManager.runAfterInteractions)
  yield put({
    type: ITEM_DECORATION_FAILURE,
    item,
    isSaved: item.isSaved
  })
  item = yield select(
    getItem,
    item._id,
    item.isSaved ? ItemType.saved : ItemType.unread
  )
  // I don't think this is necessary anymore
  // if (Platform.OS === 'web') {
  //   yield call(updateItemIDB, item)
  // } else {
  //   yield call(updateItemSQLite, item)
  // }
  pendingDecoration = pendingDecoration.filter(
    (pending) => pending._id !== item._id
  )
}

function consoleLog(txt: string) {
  if (showLogs) {
    console.log(txt)
  }
}

export function* assembleBasicDecoration(i: Item): Generator<
  any,
  | {
      item: WholeItem
      mercuryStuff: MercuryStuff
      basicImageStuff: BasicImageStuff
    }
  | boolean,
  any
> {
  const startTime = Date.now()
  const stepTimings: { [key: string]: number } = {}

  let items: ItemInflated[] = yield call(getStoredItems, [i])
  let itemInflated = items[0]
  let item: WholeItem = { ...i, ...itemInflated }

  // Extract host with redirect resolution (native platforms only)
  if (!item.host && Platform.OS !== 'web') {
    try {
      let resolvedUrl = item.url || item.feed_url
      const response = yield call(fetch, resolvedUrl)
      if (response.url !== resolvedUrl) {
        resolvedUrl = response.url
      }
      const matches = resolvedUrl?.match(/:\/\/(.*?)\//)
      const host =
        matches?.length !== undefined && matches.length > 1
          ? matches[1]
          : resolvedUrl
      item.host = host
    } catch (err) {
      console.error(`Error resolving host for item ${item._id}`, err)
      // Fallback to extracting from original URL
      const matches = item.url?.match(/:\/\/(.*?)\//)
      item.host =
        matches?.length !== undefined && matches.length > 1
          ? matches[1]
          : item.url
    }
  } else if (!item.host) {
    // Web platform: just extract from URL without redirect resolution
    const matches = item.url?.match(/:\/\/(.*?)\//)
    item.host =
      matches?.length !== undefined && matches.length > 1
        ? matches[1]
        : item.url
  }

  // Step 1: Download content (newsletters only)
  if (item.blobId) {
    const downloadStart = Date.now()
    const { content_html, url } = yield call(downloadContent, item)
    const downloadDuration = Date.now() - downloadStart
    stepTimings.downloadContent = downloadDuration
    updateTimingStats('downloadContent', downloadDuration)

    item = {
      ...item,
      content_html,
      url
    }
    yield call(updateItem, item)
    yield put({
      type: UPDATE_ITEM,
      item: deflateItem(item)
    })
  }

  // Step 2: Mercury API call
  const mercuryStart = Date.now()
  const mercuryStuff: MercuryStuff = yield call(loadMercuryStuff, item)
  const mercuryDuration = Date.now() - mercuryStart
  stepTimings.mercury = mercuryDuration
  updateTimingStats('mercury', mercuryDuration)

  if (!mercuryStuff) {
    return false
  }

  // Step 3: Basic image preparation (cache only, no face detection)
  const basicImageStuff: BasicImageStuff = yield call(
    prepareBasicCoverImage,
    item,
    mercuryStuff,
    stepTimings
  )

  // Calculate basic decoration time and log stats
  const basicDuration = Date.now() - startTime
  stepTimings.basic = basicDuration
  updateTimingStats('basicDecoration', basicDuration)
  logBasicDecorationStats(item.title, basicDuration, stepTimings)

  return {
    item,
    mercuryStuff,
    basicImageStuff
  }
}

function* applyBasicDecoration(result: {
  item: WholeItem
  mercuryStuff: MercuryStuff
  basicImageStuff: BasicImageStuff
}) {
  yield call(InteractionManager.runAfterInteractions)
  const displayMode: string = yield select(getDisplay)
  const isSaved = result.item.isSaved
  const deflatedItem = yield call(persistBasicDecoration, result)
  // const deflatedItem = deflateItem(decoratedItem)
  // yield put({
  //   type: ITEM_DECORATION_SUCCESS,
  //   item: deflatedItem,
  //   mercuryStuff: result.mercuryStuff,
  //   imageStuff: result.basicImageStuff,
  //   isSaved,
  //   displayMode
  // })

  // Small delay to ensure Redux state is updated before removing from pending
  // yield delay(100)

  // Check if Redux state was actually updated
  // const updatedItems: Item[] = yield select(getItems, isSaved ? ItemType.saved : ItemType.unread)
  // const updatedItem = updatedItems.find(i => i._id === decoratedItem._id)

  if (result.item) {
    pendingDecoration = pendingDecoration.filter(
      (pending) => pending._id !== result.item._id
    )
  }
}

function* persistBasicDecoration(result: {
  item: WholeItem
  mercuryStuff: MercuryStuff
  basicImageStuff: BasicImageStuff
}) {
  const { basicImageStuff, item, mercuryStuff } = result
  const isWeb = Platform.OS === 'web'
  const decorated = addMercuryStuffToItem(item, mercuryStuff)
  let wholeItem = {
    ...item,
    ...decorated
  }
  const hasCoverImage =
    !!basicImageStuff.imageDimensions?.height ||
    (isWeb && !!wholeItem.coverImageUrl)
  if (hasCoverImage) {
    wholeItem.hasCoverImage = true
    wholeItem.imageDimensions = basicImageStuff.imageDimensions
    wholeItem = setShowCoverImage(wholeItem)
    // Basic styles without face detection positioning
    wholeItem.styles = adjustBasicStylesToCoverImage(wholeItem, mercuryStuff)
    wholeItem = removeCachedCoverImageDuplicate(wholeItem)
  } else {
    console.log(`  No cover image found for "${item.title}"`)
  }
  // Mark item as decorated after basic decoration to prevent re-decoration
  wholeItem.isDecorated = true
  yield call(updateItem, wholeItem)
  const deflated = deflateItem(wholeItem)
  yield put({
    type: UPDATE_ITEM,
    item: deflated
  })
  return deflated
}

function* prepareBasicCoverImage(
  item: Item,
  mercuryStuff: MercuryStuff,
  stepTimings: { [key: string]: number }
): Generator<any, BasicImageStuff, any> {
  let imageStuff: BasicImageStuff = {}
  if (mercuryStuff.lead_image_url && Platform.OS !== 'web') {
    const cacheStart = Date.now()
    let coverImageFile = yield call(
      cacheCoverImage,
      item,
      mercuryStuff.lead_image_url
    )
    const cacheDuration = Date.now() - cacheStart
    stepTimings.cacheImage = cacheDuration
    updateTimingStats('cacheImage', cacheDuration)

    if (coverImageFile) {
      try {
        const imageDimensions = yield call(
          getImageDimensions,
          getCachedCoverImagePath(item)
        )
        imageStuff = {
          imageDimensions
        }
      } catch (error: any) {
        consoleLog(error)
      }
    }
  }
  return imageStuff
}

function* performImageAnalysisForItem(
  item: Item
): Generator<any, { x: number; y: number } | undefined, any> {
  // Get the full item data from storage
  let items: ItemInflated[] = yield call(getStoredItems, [item])
  let itemInflated = items[0]

  const { imageDimensions } = itemInflated
  if (!imageDimensions || Platform.OS === 'web') {
    return
  }

  const coverImageFile = getCachedCoverImagePath(item)
  try {
    // console.log(`Starting face detection for "${item.title}"`)
    // Face detection timing
    const faceStart = Date.now()
    const faceCentreNormalised = yield call(() =>
      faceDetection(coverImageFile!, imageDimensions!)
    )
    const faceDuration = Date.now() - faceStart
    updateTimingStats('faceDetection', faceDuration)
    // console.log(`Face detection completed for "${item.title}" in ${faceDuration}ms`)
    return faceCentreNormalised
  } catch (error: any) {
    console.log(`Face detection error for "${item.title}":`, error)
    return
  }
}

function* applyImageAnalysis(item: Item, faceCentreNormalised: any) {
  yield call(InteractionManager.runAfterInteractions)

  // Get the full item data from storage
  let items: ItemInflated[] = yield call(getStoredItems, [item])
  let itemInflated = items[0]

  // Update item with face detection results
  itemInflated.faceCentreNormalised = faceCentreNormalised
  itemInflated.styles = adjustStylesWithFaceDetection(
    itemInflated.styles,
    faceCentreNormalised
  )

  yield call(updateItem, itemInflated)
}

function adjustBasicStylesToCoverImage(
  item: WholeItem,
  mercuryStuff: MercuryStuff
): {} {
  let styles = { ...item.styles }

  const setImageInline = () =>
    Math.random() > 0.5 ||
    (mercuryStuff.excerpt && mercuryStuff.excerpt.length > 180)

  if (setImageInline()) {
    styles = setCoverInline(styles)
  } else {
    // title.bg has a different meaning for fullbleed cover images
    // check that title is short enough
    styles.title.bg = styles.title.bg && item.title.length < 40
  }
  return styles
}

function adjustStylesWithFaceDetection(
  styles: ItemStyles,
  faceCentreNormalised: any
): any {
  if (faceCentreNormalised) {
    const { x, y } = faceCentreNormalised
    const hAlign = x < 0.333 ? 'left' : x < 0.666 ? 'center' : 'right'
    const vAlign = y < 0.5 ? 'bottom' : 'top'
    styles = setCoverAlign(hAlign, styles)
    styles = setTitleVAlign(vAlign, styles)
  }
  return styles
}

export async function cacheCoverImage(item: Item, imageURL: string) {
  const splitted = imageURL.split('.')
  // const extension = splitted[splitted.length - 1].split('?')[0].split('%')[0]
  // making a big assumption on the .jpg extension here...
  // and it seems like Image adds '.png' to a filename if there's no extension
  const fileName = getCachedCoverImagePath(item)

  try {
    const fileInfo = await FileSystem.getInfoAsync(fileName)
    if (fileInfo.exists) return fileName

    const downloadStart = Date.now()
    await FileSystem.downloadAsync(imageURL, fileName)
    const downloadDuration = Date.now() - downloadStart
    // console.log(`Image download took ${downloadDuration}ms for ${item._id}`)

    return fileName
  } catch (err) {
    consoleLog(`Loading cover image for ${item._id} failed :(`)
    log('cacheCoverImage', err)
    return false
  }
}

function* getNextItemToDecorate() {
  const isItemViable = (item: Item) => {
    if (!item) return false
    const viable =
      item.isDecorated !== true &&
      (!item.decoration_failures ||
        item.decoration_failures < MAX_DECORATION_FAILURES) &&
      !pendingDecoration.find((pd) => pd._id === item._id)

    return viable
  }

  let nextItem
  const displayMode: string = yield select(getDisplay)
  const savedItems: Item[] = yield select(getSavedItems)

  if (displayMode === ItemType.saved) {
    const currentItem: Item = yield select(getCurrentItem, ItemType.saved)
    if (isItemViable(currentItem)) {
      return currentItem
    }
    nextItem = savedItems.find(isItemViable)
    if (nextItem) return nextItem
  }
  // the getItems selector calls utils/get-item/getItems
  // which applies the filter
  const items: Item[] = yield select(getItems, ItemType.unread)
  const index: number = yield select(getIndex, ItemType.unread)
  const feeds: Feed[] = yield select(getFeeds)
  const newsletters: Newsletter[] = yield select(getNewsletters)
  let sourcesWithoutDecoration: Source[] = feeds.filter((feed) => {
    // external items handle their own decoration
    return !items
      .filter((i) => !i.readAt && !i.isExternal && i.feed_id === feed._id)
      .find((item) => item.isDecorated)
  })
  sourcesWithoutDecoration = sourcesWithoutDecoration.concat(
    newsletters.filter((nl) => {
      return !items
        .filter((i) => !i.readAt && !i.isExternal && i.feed_id === nl._id)
        .find((item) => item.isDecorated)
    })
  )
  let count = 0
  const candidateItems = items.filter((item) => {
    return (
      item.isDecorated !== true &&
      (!item.decoration_failures || item.decoration_failures < 3) &&
      // !item.readAt &&
      items.indexOf(item) >= index &&
      items.indexOf(item) < index + 20
    )
  })
  if (candidateItems.length) {
    nextItem = candidateItems.find(
      (item) =>
        item.isDecorated !== true &&
        !pendingDecoration.find((pd) => pd._id === item._id)
    )
    // if (nextItem) {
    //   console.log(`Selected candidate item for decoration: "${nextItem.title}" (isDecorated: ${nextItem.isDecorated})`)
    // }
  }
  if (!nextItem) {
    while (
      sourcesWithoutDecoration.length > 0 &&
      count < sourcesWithoutDecoration.length &&
      !nextItem
    ) {
      const feed = sourcesWithoutDecoration[count++]
      nextItem = items.find(
        (i) =>
          !i.readAt &&
          i.feed_id === feed._id &&
          i.isDecorated !== true &&
          (i.decoration_failures
            ? i.decoration_failures < MAX_DECORATION_FAILURES
            : true) &&
          !pendingDecoration.find((pd) => pd._id === i._id)
      )
      // if (nextItem) {
      //   console.log(`Selected feed item for decoration: "${nextItem.title}" (isDecorated: ${nextItem.isDecorated})`)
      // }
    }
  }
  if (!nextItem) {
    nextItem = savedItems.find(
      (item) =>
        item.isDecorated !== true &&
        item.decoration_failures &&
        item.decoration_failures < MAX_DECORATION_FAILURES &&
        !pendingDecoration.find((pd) => pd._id === item._id)
    )
    // if (nextItem) {
    //   console.log(`Selected saved item for decoration: "${nextItem.title}" (isDecorated: ${nextItem.isDecorated})`)
    // }
  }

  return nextItem
}

function* getNextItemToAnalyse(): Generator<any, Item | null, any> {
  const displayMode: string = yield select(getDisplay)
  const savedItems: Item[] = yield select(getSavedItems)
  const items: Item[] = yield select(getItems, ItemType.unread)

  // Check if an item needs analysis (decorated but no face analysis yet)
  const needsAnalysis = (item: Item) => {
    return item.isDecorated === true && !item.isAnalysed && !!item.hasCoverImage
  }

  // First check current display mode items
  const allItems = displayMode === ItemType.saved ? savedItems : items
  let nextItem = allItems.find(needsAnalysis) || null

  if (!nextItem && displayMode !== ItemType.saved) {
    // Also check saved items if we're in unread mode
    nextItem = savedItems.find(needsAnalysis) || null
  }

  return nextItem
}
