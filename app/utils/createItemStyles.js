import {Dimensions} from 'react-native'

import {deepEqual} from '../utils/'
import {colors} from '../utils/color-definitions'
import {getNames} from '../utils/colors'

const entities = require('entities')

let deviceWidth
let deviceHeight

export function createItemStyles (item, prevStyles) {
  let title = {
    isMonochrome: Math.random() > 0.3
  }
  const isMainColorDarker = Math.random() > 0.6
  const isMainColorDesaturated = Math.random() > 0.6
  let isCoverImageColorDarker = Math.random() > 0.4
  const isCoverImageColorDesaturated = isMainColorDarker ? false : Math.random() > 0.2
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
    if (Math.random() > 0.2) {
      isBW = true
    }
  } else if (Math.random() > 0.9) {
    isBW = true
  } else {
    // title.isMonochrome = Math.random() > 0.5
  }

  let isContain = false
  let isCoverInline = false
  if (item.title &&
    (item.imageDimensions && item.imageDimensions.height < deviceHeight * 0.7)) {
    Math.random() > 0.4 ? isCoverInline = true : isContain = true
    isScreen = isMultiply = false
  }

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
  title.maximiseFont = isCoverInline || Math.random() > 0.5
  title.textAlign = (item.showCoverImage && !isCoverInline && Math.random() > 0.5) || Math.random() > 0.8
    ? 'center'
    : 'left'
  title.title = item.title
  title.isVertical = isCoverInline ? false : shouldBeVertical(entities.decode(item.title))
  title.isInline = !title.isVertical && Math.random() > 0.5
  title.isUpperCase = (fonts[0].substring(0, 14) === 'headerFontSans' && Math.random() > 0.7) || Math.random() > 0.8
  title.lineHeightAsMultiplier = title.isUpperCase ?
    0.7 + Math.random() * 0.2 :
    0.9 + Math.random() * 0.2
  title.invertBG = Math.random() > 0.8 && !isCoverInline
  title.isItalic = !title.isUpperCase && Math.random() > 0.7
  title.bg = !title.invertBG && !isCoverInline && !isBW && !isContain && !title.isVertical && Math.random() > 0.5
  title.hasShadow = !title.bg &&
      !isCoverInline &&
      !isMultiply
  title.valign = isContain ? 'top-bottom' : // isContain means image is in the middle
    ((item.showCoverImage && Math.random() > 0.3) || Math.random() > 0.5 ?
      'middle' :
      ['top', 'bottom'][Math.floor(Math.random() * 2)])
  title.isBold = title.isMonochrome ?
      Math.random() > 0.5 :
      Math.random() > 0.3
  // title.borderWidth = title.invertBG || title.isVertical || isContain ? 0 :
  //   (Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0 )
  title.borderWidth = 0

  // to stop the predominance of white on black titles
  // if (title.invertBG) {
  //   title.isMonochrome = Math.random() > 0.7
  // }

  if (!title.bg && !title.invertBG) {
    title.excerptInvertBG = Math.random() > 0.7
  }

  title.excerptFullWidth = isCoverInline || Math.random() > 0.5
  title.excerptHorizontalAlign = ['left', 'center', 'right'][Math.floor(Math.random() * 3)]

  return {
    fontClasses: fonts,
    border: hasBorder(),
    hasColorBlockquoteBG: Math.random() > 0.5,
    dropCapFamily: Math.random() > 0.5 ? 'body' : 'header',
    dropCapIsMonochrome: Math.random() > 0.5,
    dropCapSize: Math.floor(Math.random() * 2) + 2,
    dropCapIsDrop: Math.random() > 0.3,
    dropCapIsBold: Math.random() > 0.5,
    dropCapIsStroke: Math.random() > 0.8,
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
      color: pickOne(getNames(), color),
      resizeMode: isContain ? 'contain' : 'cover',
      align: ['left', 'center', 'right', 'center', 'center'][Math.floor(Math.random() * 5)],
      isInline: isCoverInline
    },
    title
  }
}

export function createCoverImageStyles (item) {
  let styles = {
    isContain: false,
    isCoverInline: false
  }
  if (item.title &&
    (item.imageDimensions && item.imageDimensions.height < deviceHeight * 0.7)) {
    // TODO base this decision on title length
    Math.random() > 0.2 ? styles.isCoverInline = true : styles.isContain = true
    style.isScreen = styles.isMultiply = false
  }
}

const shouldBeVertical = (title) => {
  const words = title.split(' ')
  if (proportionWordsOver12Chars(words) > 0.25 ||
    (title.length < 72 && words.length < 6 && titleVariance(words) < 1.5) ||
    (words.length < 4 && Math.random() > 0.5)) {
    return true
  } else {
    return false
  }
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
  let headerClass = 'headerFont'
  let bodyClass = 'bodyFont'
  if (Math.random() > 0.3) {
    // sans heading, serif body
    // headerClass += 'Sans' + (Math.floor((Math.random() * 3)) + 1)
    headerClass += 'Sans1'
    bodyClass += 'Serif' + (Math.floor((Math.random() * 3)) + 1)
  } else {
    // serif heading, sans body
    // headerClass += 'Serif' + (Math.floor((Math.random()*3))+1)
    headerClass += 'Serif1'
    bodyClass += 'Sans' + (Math.floor((Math.random()*2))+1)
  }
  return [headerClass, bodyClass]
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