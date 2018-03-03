import {Dimensions} from 'react-native'

import {deepEqual} from '../utils/'
import {colors} from '../utils/color-definitions'
import {getNames} from '../utils/colors'

let deviceWidth

export function createItemStyles (item) {
  let title = {}
  const color = pickOne(getNames())
  title.color = color

  if (!deviceWidth) {
    const {height, width} = Dimensions.get('window')
    deviceWidth = width
  }

  const fonts = getFontClasses()

  let isBW = false
  let isMultiply = false
  if (Math.random() > 0.3) {
    isMultiply = true
    title.isMonochrome = Math.random() > 0.3
    if (Math.random() > 0.2) {
      isBW = true
    }
  } else if (Math.random() > 0.7) {
    isBW = true
  } else {
    title.isMonochrome = Math.random() > 0.5
  }

  let isContain = false
  let isCoverInline = false
  if (Math.random() > 0.9) {
    isContain = true
    isMultiply = false
    isBW = false
    title.color = color
  } else if (Math.random() > 0.9) {
    isCoverInline = true
  }

  const words = item.title.split(' ')

  const longestWord = (text) => {
    let longest = 0
    words.forEach((word) => {
      longest = word.length > longest ? word.length : longest
    })
    return longest
  }

  const titleVariance = (words) => {
    const wordsSorted = words
      .sort((a, b) => b.length - a.length)
    const average = Math.round(wordsSorted.reduce((avg, word) => avg + word.length, 0) / wordsSorted.length)
    return wordsSorted.reduce((variance, word) => variance + Math.abs(average - word.length), 0) / wordsSorted.length
  }

  if (item.title.length < 40 && longestWord(item.title) < 6) {
    title.fontSizeAsWidthDivisor = 6
  } else if (item.title.length < 60 && longestWord(item.title) < 8) {
    title.fontSizeAsWidthDivisor = 7
  } else if (item.title.length < 80 && longestWord(item.title) < 10) {
    title.fontSizeAsWidthDivisor = 8
  } else {
    title.fontSizeAsWidthDivisor = 10
  }

  // this is an attempt to rationalise font sizes for larger screens
  if (deviceWidth > 500) {
    title.fontSizeAsWidthDivisor = title.fontSizeAsWidthDivisor * (deviceWidth / 500)
    title.widthPercentage = 100 - (Math.floor(Math.random() * 50))
  }

  title.lineHeightAsMultiplier = 1.1 + Math.random() * 0.2
  title.maximiseFont = Math.random() > 0.5
  title.textAlign = Math.random() > 0.5
    ? 'center'
    : 'left'
  title.title = item.title
  title.hasShadow = !isContain
  title.isVertical = item.title.length < 72 && words.length < 8 && titleVariance(words) < 1.5
  title.isInline = !title.isVertical && Math.random() > 0.5
  title.isUpperCase = fonts[0].substring(0, 14) === 'headerFontSans' && Math.random() > 0.3
  title.invertBG = Math.random() > 0.8
  title.isBold = title.isMonochrome ? Math.random() > 0.8 : Math.random() > 0.3
  title.isBold = title.isBold ? Math.random() > 0.8 : Math.random() > 0.5
  title.isItalic = Math.random() > 0.8

  return {
    fontClasses: fonts,
    border: hasBorder(),
    hasColorBlockquoteBG: Math.random() > 0.5,
    color,
    isCoverInline,
    coverImage: {
      isBW,
      isMultiply,
      color: pickOne(getNames(), color),
      resizeMode: isContain ? 'contain' : 'cover',
      align: ['left', 'center', 'right'][Math.floor(Math.random() * 3)]
    },
    title: {
      ...title,
      valign: Math.random() > 0.5 ? 'middle' : ['top', 'middle', 'bottom'][Math.floor(Math.random() * 3)],
      bg: !title.invertBG && !isBW && !isMultiply && !isContain && !title.isVertical && Math.random() > 0.7
    }
  }
}

const getFontClasses = function () {
  let headerClass = 'headerFont'
  let bodyClass = 'bodyFont'
  if (Math.random() > 0.3) {
    // sans heading, serif body
    headerClass += 'Sans' + (Math.floor((Math.random() * 3)) + 1)
    bodyClass += 'Serif' + (Math.floor((Math.random() * 2)) + 1)
  } else {
    // serif heading, sans body
    headerClass += 'Serif' + (Math.floor((Math.random()*3))+1)
    bodyClass += 'Sans' + (Math.floor((Math.random()*2))+1)
  }
  let isHeader
  if (Math.random() > 0.8) {

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

export function commonWords () {
  return [
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
    'web',
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
}
