const RNFS = require('react-native-fs')
import { Dimensions, Platform } from 'react-native'

export function deepEqual (a, b, ignoreNull = false) {
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
    if (!deepEqual(a[key], b[key], ignoreNull)) {
      return false
    }
  }
  return true
}

export function getCachedImagePath (item) {
  return `${RNFS.DocumentDirectoryPath}/${item._id}.jpg`
}

export const isIphoneX = () => {
  let d = Dimensions.get('window');
  const { height, width } = d;

  return (
    Platform.OS === 'ios' &&
      // Accounting for the height in either orientation
      (height === 812 || width === 812)
  );
}

export function id () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}
