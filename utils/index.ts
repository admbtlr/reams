import * as FileSystem from 'expo-file-system'
import {
  Animated,
  Dimensions,
  Image,
  Platform
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import DeviceInfo from 'react-native-device-info'
import { Item } from '../store/items/types'
import { hslString } from './colors'
// import uuid from 'uuid'

const uuid = require('uuid')

let deviceId: string

export function deepEqual (a: any, b: any, ignoreNull = false) {
  try {
    if (!(a instanceof Object) || !(b instanceof Object)) {
      // compare by value
      return a === b
    }
    let ka = Object.keys(a)
    let kb = Object.keys(b)
    let key, i
    // ignore null and undefined values
    if (ignoreNull) {
      ka = ka.filter((x) => a[x] != null)
      kb = kb.filter((x) => b[x] != null)
    }
    // having the same number of owned properties (keys incorporates
    // hasOwnProperty)
    if (ka.length !== kb.length) {
      return false
    }
    // the same set of keys (although not necessarily the same order),
    ka.sort()
    kb.sort()
    // cheap key test
    for (i = ka.length - 1; i >= 0; i--) {
      if (ka[i] !== kb[i]) {
        return false
      }
    }
    // equivalent values for every corresponding key, and
    // possibly expensive deep test
    for (i = ka.length - 1; i >= 0; i--) {
      key = ka[i]
      // strying to stop errors going deep into animating transforms
      if (key === 'transform' ||
        a[key] instanceof Animated.Value) {
        return true
      }
      if (!deepEqual(a[key], b[key], ignoreNull)) {
        return false
      }
    }
    return true
  } catch (e) {
    console.log(e)
    return false
  }

}

export function diff (a: Item, b: Item, changes = {}) {
  changes = oneWayDiff (a, b, changes)
  return oneWayDiff(b, a, changes)
}

function oneWayDiff (a: any, b: any, changes: { [key: string]: any}) {
  for (var key in a) {
    if (changes[key] !== undefined) continue
    if (key === 'item') {
      changes[key] = diff(a[key], b[key])
    } else {
      if (a[key] !== b[key]) {
        changes[key] = {
          old: a[key],
          new: b[key]
        }
      }
    }
  }
  return changes
}

export function deviceCanHandleAnimations () {
  if (deviceId === undefined) {
    deviceId = DeviceInfo.getDeviceId()
  }
  if (deviceId.startsWith('iPad')) {
    const number = deviceId.substring(4).split(',')[0]
    return Number.parseInt(number) > 5
  } else if (deviceId.startsWith('iPhone')) {
    const number = deviceId.substring(6).split(',')[0]
    return Number.parseInt(number) > 10
  }
  return true
}

export function getCachedCoverImagePath (item: Item | string) {
  const id = typeof item === 'object'
    ? item._id
    : item
  return `${FileSystem.documentDirectory}${id}.jpg`
}

export function getCachedFeedIconPath (id: string) {
  return `${FileSystem.documentDirectory}feed-icons/${id}.png`
}

export function getRenderedFeedIconPath (id: string) {
  return `${FileSystem.documentDirectory}feed-icons/rendered/${id}.png`
}

export async function fileExists (path: string) {
  const fileInfo = await FileSystem.getInfoAsync(path)
  return fileInfo.exists
}

export function getImageDimensions (path: string) {
  return new Promise((resolve, reject) => {
    Image.getSize(path, (imageWidth, imageHeight) => {
      resolve({
        width: imageWidth,
        height: imageHeight
      })
    }, (error) => {
      // log(error)
      reject(error)
    })
  })
}

export async function isFirstLaunch () {
  const setLaunchDate = (date: string) => {
    AsyncStorage.setItem('launchDate', date)
  }

  try {
    const launchDate = await AsyncStorage.getItem('launchDate')
    if (launchDate === null) {
      setLaunchDate(String(Date.now()))
      return true
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

export const hasNotchOrIsland = () => {
  let d = Dimensions.get('window');
  const { height, width } = d;
  const heights = [812, 844, 896, 852, 932]

  return (
    Platform.OS === 'ios' &&
      // Accounting for the height in either orientation
      (heights.includes(height) || heights.includes(width))
  )
}

export const isIpad = () => {
  return Platform.OS === 'ios' && getSmallestDimension() > 700
}

export const isPortrait = () => Dimensions.get('window').height > Dimensions.get('window').width

let screenWidth: number, screenHeight : number

const getDimensions = () => {
  // this is a remnant from before we supported both screen orientations
  // and we were cacheing the dimensions
  screenWidth = Dimensions.get('window').width
  screenHeight = Dimensions.get('window').height
}

const getSmallestDimension = () => {
  getDimensions()
  return Math.min(screenWidth, screenHeight)
}

export const fontSizeMultiplier: any = () => {
  if (Platform.OS === 'web') return 1
  getDimensions()
  const smallestDimension = getSmallestDimension()
  // this happens for the schare extension
  if (screenWidth === 0 && screenHeight === 0) return 1
  return screenWidth * screenHeight < 310000 ?
    0.85 : // this is iPhone 8 at this point
    smallestDimension < 768 ? 1 : (smallestDimension / 768).toPrecision(4)
}

export const getInset = () => {
  const width = getSmallestDimension()
  return width < 768 ?
    width * 0.05 :
    width * 0.1
}

export const getMargin = () => {
  if (Platform.OS === 'web') return 10
  const width = getSmallestDimension()
  return width * 0.05  / (width > 768 ? width / 768 : 1)
}

export const getStatusBarHeight = () => 70 * fontSizeMultiplier() + 
  (hasNotchOrIsland() && isPortrait() ? 44 : 22)

export function id (item?: any) {
  if (item && typeof item === 'string' || item?.url) {
    return uuid.v5(item.url || item, uuid.v5.URL)
  } else {
    return uuid.v4()
  }
}

export function getFeedColor () {
  // const { desaturated } = require('./colors.json')
  // const colorNames = Object.keys(desaturated)
  // const taken = feeds.length < 12 ?
  //   feeds.map(feed => feed.color) :
  //   undefined
  // let randomIndex = Math.floor(Math.random() * colorNames.length)
  // while (taken && taken.indexOf(colorNames[randomIndex]) !== -1) {
  //   randomIndex = Math.floor(Math.random() * colorNames.length)
  // }
  // return colorNames[randomIndex]
  
  // return [Math.round(Math.random() * 360), 20, 50]
  return hslString('rizzleFG').replace('hsl(', '').replace(')', '').split(',').map((n: String) => Number.parseInt(n.replace('%', '')))
}

export function pgTimestamp (date: Date = new Date(Date.now())) {
  return date.toISOString().replace('T',' ').replace('Z','').replace(/\.\d{3}/,'')
}