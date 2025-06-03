import * as FileSystem from 'expo-file-system'
import { Animated, Image } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import DeviceInfo from 'react-native-device-info'
import { Item } from '../store/items/types'
import { hslString } from './colors'
import log from './log'
import { uuidv4, uuidv5 } from './uuid'

// const uuid = require('uuid')

let deviceId: string

export const deepEqual = <T>(a: T, b: T): boolean => {
  if (a === b) {
    return true
  }

  const bothAreObjects =
    a && b && typeof a === "object" && typeof b === "object"

  return Boolean(
    bothAreObjects &&
    Object.keys(a).length === Object.keys(b).length &&
    Object.entries(a).every(([k, v]) => deepEqual(v, b[k as keyof T]))
  )
}

// export function deepEqual(a: any, b: any, ignoreNull = false) {
//   try {
//     if (!(a instanceof Object) || !(b instanceof Object)) {
//       // compare by value
//       return a === b
//     }
//     let ka = Object.keys(a)
//     let kb = Object.keys(b)
//     let key, i
//     // ignore null and undefined values
//     if (ignoreNull) {
//       ka = ka.filter((x) => a[x] != null)
//       kb = kb.filter((x) => b[x] != null)
//     }
//     // having the same number of owned properties (keys incorporates
//     // hasOwnProperty)
//     if (ka.length !== kb.length) {
//       return false
//     }
//     // the same set of keys (although not necessarily the same order),
//     ka.sort()
//     kb.sort()
//     // cheap key test
//     for (i = ka.length - 1; i >= 0; i--) {
//       if (ka[i] !== kb[i]) {
//         return false
//       }
//     }
//     // equivalent values for every corresponding key, and
//     // possibly expensive deep test
//     for (i = ka.length - 1; i >= 0; i--) {
//       key = ka[i]
//       // strying to stop errors going deep into animating transforms
//       if (key === 'transform' || a[key] instanceof Animated.Value) {
//         return true
//       }
//       if (!deepEqual(a[key], b[key], ignoreNull)) {
//         return false
//       }
//     }
//     return true
//   } catch (e) {
//     console.log(e)
//     return false
//   }
// }

export function diff(a: Item, b: Item, changes = {}) {
  changes = oneWayDiff(a, b, changes)
  return oneWayDiff(b, a, changes)
}

function oneWayDiff(a: any, b: any, changes: { [key: string]: any }) {
  for (var key in a) {
    if (changes[key] !== undefined) continue
    if (key === 'item') {
      changes[key] = diff(a[key], b[key])
    } else {
      if (a[key] !== b[key]) {
        changes[key] = {
          old: a[key],
          new: b[key],
        }
      }
    }
  }
  return changes
}

export const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay))

export function deviceCanHandleAnimations() {
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

export function getCachedCoverImagePath(item: Item | string) {
  const id = typeof item === 'object' ? item._id : item
  return `${FileSystem.documentDirectory}${id}.jpg`
}

export function getCachedFeedIconPath(id: string) {
  return `${FileSystem.documentDirectory}feed-icons/${id}.png`
}

export function getRenderedFeedIconPath(id: string) {
  return `${FileSystem.documentDirectory}feed-icons/rendered/${id}.png`
}

export async function fileExists(path: string) {
  try {
    const fileInfo = await FileSystem.getInfoAsync(path)
    return fileInfo.exists
  } catch (error) {
    log('fileExists', error)
    throw error
  }
}

export function getImageDimensions(path: string) {
  return new Promise((resolve, reject) => {
    Image.getSize(
      path,
      (imageWidth, imageHeight) => {
        resolve({
          width: imageWidth,
          height: imageHeight,
        })
      },
      (error) => {
        // log(error)
        reject(error)
      }
    )
  })
}

export async function isFirstLaunch() {
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

export function id(item?: any) {
  if ((item && typeof item === 'string') || item?.url) {
    return uuidv5(item.url || item, uuidv5.URL)
  } else {
    return uuidv4()
  }
}

export function getFeedColor() {
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
  return hslString('rizzleFG')
    .replace('hsl(', '')
    .replace(')', '')
    .split(',')
    .map((n: String) => Number.parseInt(n.replace('%', '')))
}

export function pgTimestamp(date: Date = new Date(Date.now())) {
  return date
    .toISOString()
    .replace('T', ' ')
    .replace('Z', '')
    .replace(/\.\d{3}/, '')
}

export function findUrl(text: string): string | undefined {
  // Regex pattern to match URLs
  const urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

  const match = text.match(urlPattern);
  return match ? match[0] : undefined;
}
