import {Dimensions} from 'react-native'

import {getNames} from '../utils/colors'

const entities = require('entities')

let deviceWidth
let deviceHeight

export function createItemStyles (item, prevStyles) {
  let title = {
    isMonochrome: Math.random() > 0.5
  }
  const isMainColorDarker = Math.random() > 0.6
  let isCoverImageColorDarker = Math.random() > 0.4
  // const color = pickOne(getNames(), isMainColorDarker ? 'Darker' : '', prevStyles && prevStyles.color)
  const color = item.feed_color
  title.color = color
  // title.color = 'white'

  if (!deviceWidth || !deviceHeight) {
    const {height, width} = Dimensions.get('window')
    deviceHeight = height
    deviceWidth = width
  }

  let isBW = false
  let isMultiply = false
  let isScreen = false
  if (Math.random() > 0.7) {
    if (Math.random() > 0.5) {
      isScreen = true
      isCoverImageColorDarker = true
    } else {
      isMultiply = true
      isCoverImageColorDarker = false
    }
    title.isMonochrome = true
    // title.isMonochrome = Math.random() > 0.3 && !(prevStyles && prevStyles.isMonochrome)
    if (Math.random() > 0.4) {
      isBW = true
    }
  // } else if (Math.random() > 0.9) {
  //   isBW = true
  } else {
    title.isMonochrome = true
  }

  let isContain = false
  let isCoverInline = false

  const fonts = getFontClasses()

  // this is an attempt to rationalise font sizes for larger screens
  // (account for landscape)
  // if (Math.min(deviceWidth, deviceHeight) > 500) {
  //   title.fontSizeAsWidthDivisor = title.fontSizeAsWidthDivisor * (deviceWidth / 500)
  //   title.widthPercentage = 100 - (Math.floor(Math.random() * Math.max([0, (50 - item.title.length / 2)])))
  // }

  title.interBolded = shouldInterBold(entities.decode(item.title))
  // this is probably just too ugly to be allowed...
  // title.interStyled = title.interBolded && Math.random() > 0.5
  title.textAlign = (item.showCoverImage && !isCoverInline && Math.random() > 0.5) || Math.random() > 0.8
    ? 'center'
    : 'left'
  title.title = item.title
  title.isVertical = isCoverInline ? false : shouldBeVertical(entities.decode(item.title))
  title.isInline = !title.isVertical && Math.random() > 0.4
  title.isUpperCase = item.title.length < 80 &&
    ((fonts.heading.substring(0, 14) === 'headerFontSans2' && Math.random() > 0.5) ||
      (fonts.heading.substring(0, 14) === 'headerFontSans' && Math.random() > 0.7) ||
      Math.random() > 0.8)
  title.lineHeightAsMultiplier = title.isUpperCase ?
    0.9 + Math.random() * 0.1 :
    1 + Math.random() * 0.1
  title.invertBG = Math.random() > 0.8 && !isCoverInline && !isScreen
  title.invertedBGMargin = Math.floor(Math.random() * 3)
  title.isItalic = !title.isUpperCase && Math.random() > 0.7
  title.bg = !title.invertBG &&
    !isCoverInline &&
    !isBW &&
    !isScreen &&
    !isContain &&
    !title.isVertical &&
    item.title.length < 80 &&
    Math.random() > 0.5
  title.hasShadow = !title.bg &&
      !isCoverInline &&
      !isMultiply
  title.valign = isContain ? 'top-bottom' : // isContain means image is in the middle
    ((item.showCoverImage && Math.random() > 0.3) ||
      title.bg ||
      Math.random() > 0.5 ?
        'middle' :
        ['top', 'bottom'][Math.floor(Math.random() * 2)])
  title.isBold = title.isMonochrome ?
      Math.random() > 0.8 :
      Math.random() > 0.8
  // title.borderWidth = title.invertBG || title.isVertical || isContain ? 0 :
  //   (Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0 )

  // to stop the predominance of white on black titles
  // if (title.invertBG) {
  //   title.isMonochrome = Math.random() > 0.7
  // }

  if (!title.bg && !title.invertBG) {
    title.excerptInvertBG = Math.random() > 0.7
  }

  title.excerptFullWidth = isCoverInline || Math.random() > 0.5
  title.excerptHorizontalAlign = ['left', 'center', 'right'][Math.floor(Math.random() * 3)]

  // title.borderWidth = title.textAlign === 'center' &&
  //   !title.bg &&
  //   !title.invertBG &&
  //   Math.random() > 0.5 ? 1 : 0

  const dropCapSize = Math.floor(Math.random() * 3) + 2

  return {
    fontClasses: fonts,
    border: hasBorder(),
    hasColorBlockquoteBG: Math.random() > 0.5,
    dropCapFamily: Math.random() > 0.5 ? 'body' : 'header',
    dropCapIsMonochrome: Math.random() > 0.8,
    dropCapSize: Math.floor(Math.random() * 5) + 2,
    dropCapIsDrop: dropCapSize > 3 || Math.random() > 0.5,
    dropCapIsBold: dropCapSize < 4 && Math.random() > 0.5,
    dropCapIsStroke: Math.random() > 0.5,
    color,
    isMainColorDarker,
    isCoverImageColorDarker,
    isCoverInline,
    showCoverImage: false,
    coverImage: {
      showCoverImage: false,
      isBW,
      isMultiply,
      isScreen,
      isCoverImageColorDarker,
      color: pickOne(getNames()),
      resizeMode: isContain ? 'contain' : 'cover',
      align: ['left', 'center', 'right', 'center', 'center'][Math.floor(Math.random() * 5)],
      isInline: isCoverInline
    },
    title
  }
}

export function setCoverInline (oldStyles) {
  let styles = { ...oldStyles }
  styles.isCoverInline = true
  styles.showCoverImage = true
  styles.coverImage.isInline = true
  styles.title.textAlign = 'left'
  styles.title.isVertical = false
  styles.title.invertBG = false
  styles.title.bg = false
  styles.title.hasShadow = false
  styles.coverImage.isScreen = false
  styles.coverImage.isMultiply = false
  styles.coverImage.isBW = false
  styles.coverImage.showCoverImage = true
  return styles
}

export function setCoverAlign (align, oldStyles) {
  let styles = oldStyles
  styles.coverImage.align = align
  return styles
}

export function setTitleVAlign (valign, oldStyles) {
  let styles = oldStyles
  styles.title.valign = valign
  return styles
}

export function getStylesCompressionMap () {
  return {
    fontClasses: {
      heading: 'h',
      body: 'b'
    },
    border: 'b',
    hasColorBlockquoteBG: 'hCBBG',
    dropCapFamily: 'dCF',
    dropCapIsMonochrome: 'dCIM',
    dropCapSize: 'dCS',
    dropCapIsDrop: 'dCID',
    dropCapIsBold: 'dCIB',
    dropCapIsStroke: 'dCIS',
    color: 'c',
    isMainColorDarker: 'iMCD',
    isCoverImageColorDarker: 'iCICD',
    isCoverInline: 'iCI',
    showCoverImage: 'sCI',
    coverImage: {
      showCoverImage: 'sCI',
      isBW: 'iBW',
      isMultiply: 'iM',
      isScreen: 'iS',
      isCoverImageColorDarker: 'iCICD',
      color: 'c',
      resizeMode: 'rM',
      align: 'a',
      isInline: 'iI'
    },
    title: {
      color: 'c',
      interBolded: 'inB',
      textAlign: 'tA',
      title: 't',
      isVertical: 'iV',
      isInline: 'iI',
      isUpperCase: 'iU',
      lineHeightAsMultiplier: 'lHAM',
      invertBG: 'iBG',
      isItalic: 'iIt',
      bg: 'bg',
      hasShadow: 'hS',
      valign: 'va',
      isBold: 'iB',
      borderWidth: 'bW',
      excerptInvertBG: 'eIGB',
      excerptFullWidth: 'eFW',
      excerptHorizontalAlign: 'eHA',
    }
  }
}

export function compressStyles (styles) {
  if (typeof styles !== 'object') return styles
  let compressed = {}
  const map = getStylesCompressionMap()
  let compressedKey
  for (let key in styles) {
    if (typeof styles[key] === 'undefined' ||
      styles[key] === null) {
      continue
    } else if (typeof styles[key] !== 'object') {
      compressedKey = map[key]
      compressed[compressedKey] = styles[key]
    } else {
      compressedKey = map[key]
      compressed[key] = {}
      for (let subKey in styles[key]) {
        let compressedSubKey = map[key][subKey]
        compressed[key][compressedSubKey] = styles[key][subKey]
      }
    }
  }
  return compressed
}

export function expandStyles (compressed) {
  let styles = {}
  const map = getStylesCompressionMap()
  let key, subKey
  for (let compressedKey in compressed) {
    key = Object.keys(map).find(k => map[k] === compressedKey)
      || compressedKey // keys whose values are objects are not compressed
    if (typeof compressed[compressedKey] === 'undefined' ||
      compressed[compressedKey] === null) {
      continue
    } else if (typeof compressed[compressedKey] !== 'object') {
      styles[key] = compressed[compressedKey]
    } else {
      styles[compressedKey] = {}
      for (let compressedSubKey in compressed[compressedKey]) {
        subKey = Object.keys(map[key]).find(k => {
          return map[k] === compressedSubKey
        })
        styles[key][subKey] = styles[key][compressedSubKey]
      }
    }
  }
  return styles
}

const shouldBeVertical = (title) => {
  const words = title.split(' ')
  return words.length < 6 && titleVariance(words) <= 1.5
  // if (proportionWordsOver12Chars(words) > 0.25 ||
  //   (title.length < 72 && words.length < 6 && titleVariance(words) < 1.5) ||
  //   (words.length < 4 && Math.random() > 0.5)) {
  //   return true
  // } else {
  //   return false
  // }
}

const proportionWordsOver12Chars = (words) => {
  let over = 0
  words.forEach((word) => {
    if (word.length >= 12) over += 1
  })
  return over / words.length
}

const titleVariance = (words) => {
  const wordsSorted = words
    .sort((a, b) => b.length - a.length)
  const average = Math.round(wordsSorted.reduce((avg, word) => avg + word.length, 0) / wordsSorted.length)
  return wordsSorted.reduce((variance, word) => variance + Math.abs(average - word.length), 0) / wordsSorted.length
}

const shouldInterBold = (title) => {
  const words = title.split(' ')
  let common = uncommon = 0
  words.forEach(word => {
    if (commonWords.find(cw => cw === word.toLowerCase())) {
      common++
    } else {
      uncommon++
    }
  })
  const commonWordRatio = common / uncommon
  if (commonWordRatio > 0.5 && common > 3) {
    return words.map(word => !commonWords.find(cw => cw === word.toLowerCase()))
  }
  return false
}

const getFontClasses = function () {
  let heading = 'headerFont'
  let body = 'bodyFont'
  if (Math.random() > 0.3) {
    // sans heading, serif body
    // heading += 'Sans' + (Math.floor((Math.random() * 3)) + 1)
    heading += 'Sans' + (Math.floor((Math.random() * 3)) + 1)
    body += 'Serif' + (Math.floor((Math.random() * 3)) + 1)
  } else {
    // serif heading, sans body
    // heading += 'Serif' + (Math.floor((Math.random()*3))+1)
    heading += 'Serif1'
    body += 'Sans' + (Math.floor((Math.random()*2))+1)
  }
  return {heading, body}
}

const isMultiply = function () {
  return Math.random() > 0.5
}

const hasBorder = function () {
  return Math.random() > 0.7
}

const pickOne = function (arr, notThisOne) {
  const primaries = ['red1', 'blue1', 'yellow1']
  if (notThisOne) {
    isPrimary = arr.find(primary => notThisOne.substring(0, primary.length) === primary)
    if (!isPrimary) {
      let attempt = primaries[Math.round(Math.random() * 2)]
      return attempt
    }
  }
  let attempt = arr[Math.round(Math.random() * (arr.length - 1))]
  while (attempt === 'black' || attempt === 'white' || attempt === notThisOne) {
    attempt = arr[Math.round(Math.random() * (arr.length - 1))]
  }
  return attempt
}

// const colors = () => {
//   // red1: hsl(355, 56%, 63%),
//   // red2: hsl(341, 56%, 49%),
//   // orange1: hsl(23, 100%, 60%),
//   // orange2: hsl(33, 93%, 54%),
//   // yellow1: hsl(49, 100%, 50%),
//   // yellow2: hsl(65, 90%, 64%),
//   // green1: hsl(167, 80%, 55%),
//   // blue1: hsl(226, 68%, 57%),
//   // blue2: hsl(198, 90%, 44%),
//   // purple1: hsl(298, 32%, 56%),
//   // purple2: hsl(320, 82%, 66%),
//   // brown1: hsl(9, 61%, 71%)

//   // return [
//   //   {
//   //     name: 'red1',
//   //     hex: '#D66D75',
//   //     rgba: 'rgba(214, 109, 117, 0.4)'
//   //   },
//   //   {
//   //     name: 'red2',
//   //     hex: '#C33764',
//   //     rgba: 'rgba(195, 55, 100, 0.4)'
//   //   },
//   //   {
//   //     name: 'orange1',
//   //     hex: '#FF8235',
//   //     rgba: 'rgba(255, 128, 0, 0.4)'
//   //   },
//   //   {
//   //     name: 'orange2',
//   //     hex: '#F7971E',
//   //     rgba: 'rgba(247, 151, 30, 0.4)'
//   //   },
//   //   {
//   //     name: 'yellow1',
//   //     hex: '#FFD200',
//   //     rgba: 'rgba(255, 210, 0, 0.4)'
//   //   },
//   //   {
//   //     name: 'yellow2',
//   //     hex: '#e8f651',
//   //     rgba: 'rgba(232, 245, 80, 0.4)'
//   //   },
//   //   {
//   //     name: 'green1',
//   //     hex: '#30E8BF',
//   //     rgba: 'rgba(48, 232, 191, 0.4)'
//   //   },
//   //   {
//   //     name: 'blue1',
//   //     hex: '#4568DC',
//   //     rgba: 'rgba(69, 104, 220, 0.4)'
//   //   },
//   //   {
//   //     name: 'blue2',
//   //     hex: '#0b99d5',
//   //     rgba: 'rgba(11, 153, 213, 0.4)'
//   //   },
//   //   {
//   //     name: 'purple1',
//   //     hex: '#B06AB3',
//   //     rgba: 'rgba(176, 106, 179, 0.4)'
//   //   },
//   //   {
//   //     name: 'purple2',
//   //     hex: '#ef61c0',
//   //     rgba: 'rgba(239, 97, 192, 0.4)'
//   //   },
//   //   {
//   //     name: 'brown1',
//   //     hex: '#E29587',
//   //     rgba: 'rgba(226, 149, 135, 0.4)'
//   //   }
//   // ]
//   return [
//     {
//     	name: 'red1',
//     	hsl: 'hsl(355, 56%, 63%),'
//     }, {
//     	name: 'red2',
//     	hsl: 'hsl(341, 56%, 49%),'
//     }, {
//     	name: 'orange1',
//     	hsl: 'hsl(23, 100%, 60%),'
//     }, {
//     	name: 'orange2',
//     	hsl: 'hsl(33, 93%, 54%),'
//     }, {
//     	name: 'yellow1',
//     	hsl: 'hsl(49, 100%, 50%),'
//     }, {
//     	name: 'yellow2',
//     	hsl: 'hsl(65, 90%, 64%),'
//     }, {
//     	name: 'green1',
//     	hsl: 'hsl(167, 80%, 55%),'
//     }, {
//     	name: 'blue1',
//     	hsl: 'hsl(226, 68%, 57%),'
//     }, {
//     	name: 'blue2',
//     	hsl: 'hsl(198, 90%, 44%),'
//     }, {
//     	name: 'purple1',
//     	hsl: 'hsl(298, 32%, 56%),'
//     }, {
//     	name: 'purple2',
//     	hsl: 'hsl(320, 82%, 66%),'
//     }, {
//     	name: 'brown1',
//     	hsl: 'hsl(9, 61%, 71%)'
//     }
//   ]

// }

const commonWords = [
  'the',
  'of',
  'and',
  'to',
  'a',
  'in',
  'for',
  'is',
  'on',
  'that',
  'by',
  'this',
  'with',
  'i',
  'you',
  'it',
  'not',
  'or',
  'be',
  'are',
  'from',
  'at',
  'as',
  'your',
  'all',
  'have',
  'more',
  'an',
  'was',
  'we',
  'will',
  'home',
  'can',
  'us',
  'about',
  'if',
  'my',
  'has',
  'but',
  'our',
  'one',
  'other',
  'do',
  'no',
  'they',
  'he',
  'up',
  'may',
  'what',
  'which',
  'their',
  'out',
  'use',
  'any',
  'there',
  'see',
  'only',
  'so',
  'his',
  'when',
  'here',
  'who',
  'also',
  'now',
  'get',
  'am',
  'been',
  'would',
  'how',
  'were',
  'me',
  'some',
  'these',
  'its',
  'like',
  'than',
  'had',
  'into',
  'them',
  'should',
  'her',
  'such',
  'after',
  'then'
]