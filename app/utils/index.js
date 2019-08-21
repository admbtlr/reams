const RNFS = require('react-native-fs')
import { Animated, Dimensions, Platform } from 'react-native'

export function deepEqual (a, b, ignoreNull = false) {
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
  }

}

export function getCachedImagePath (item) {
  const id = typeof item === 'object'
    ? item._id
    : item
  return `${RNFS.DocumentDirectoryPath}/${id}.jpg`
}

export function getCachedFeedIconPath (id) {
  return `${RNFS.DocumentDirectoryPath}/feed-icons/${id}.png`
}

export const isIphoneX = () => {
  let d = Dimensions.get('window');
  const { height, width } = d;

  return (
    Platform.OS === 'ios' &&
      // Accounting for the height in either orientation
      (height === 812 || width === 812 || height === 896 || width === 896)
  )
}

export function id (item) {
  if (item && typeof item === 'string') {
    return hashFnv32a(item, true)
  } else if (item && item.url) {
    return hashFnv32a(item.url, true) + '-' + (item.feed_id ?
      item.feed_id.split('-')[0] :
      item.created_at)
  } else {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }
}

// https://stackoverflow.com/a/22429679/1788521
function hashFnv32a(str, asString, seed) {
  /*jshint bitwise:false */
  var i, l,
    hval = (seed === undefined) ? 0x811c9dc5 : seed;

  for (i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  if( asString ){
    // Convert to 8 digit hex string
    return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
  }
  return hval >>> 0;
}


export function getFeedColor (feeds) {
  const { desaturated } = require('./colors.json')
  const colorNames = Object.keys(desaturated)
  const taken = feeds.length < 12 ?
    feeds.map(feed => feed.color) :
    undefined
  let randomIndex = Math.floor(Math.random() * colorNames.length)
  while (taken && taken.indexOf(colorNames[randomIndex]) !== -1) {
    randomIndex = Math.floor(Math.random() * colorNames.length)
  }
  return colorNames[randomIndex]
}
