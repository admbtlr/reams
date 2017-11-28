import {deepEqual} from '../utils/'

export function createItemStyles (item) {
  let title = {}
  const color = getColor()
  const black = {
    name: 'black',
    hex: '#000000',
    rgba: 'rgba(0,0,0,1)'
  }
  title.color = color

  const fonts = getFontClasses()

  let isBW = false
  let isMultiply = false
  if (Math.random() > 0.5) {
    isMultiply = true
    title.color = Math.random() > 0.8 ? color : black
  } else if (Math.random() > 0.5) {
    isBW = true
    title.color = color
  }

  let isContain = false
  if (Math.random() > 0.9) {
    isContain = true
    isMultiply = false
    isBW = false
    title.color = color
  }

  const longestWord = (text) => {
    const words = text.split(' ')
    let longest = 0
    words.forEach((word) => {
      longest = word.length > longest ? word.length : longest
    })
    return longest
  }

  if (item.title.length < 20 && longestWord(item.title) < 6) {
    title.fontSize = 64
  } else if (item.title.length < 40) {
    title.fontSize = 48
  } else if (item.title.length < 80) {
    title.fontSize = 42
  } else {
    title.fontSize = 36
  }
  title.lineHeight = Math.floor(title.fontSize * (Math.random() * 0.4 + 0.8))
  title.textAlign = Math.random() > 0.5
    ? 'center'
    : 'left'
  title.title = item.title
  title.hasShadow = !isContain
  title.isVertical = item.title.length < 72 && Math.random() > 0.5
  title.isInline = title.isVertical || Math.random() > 0.5
  title.isUpperCase = fonts[0].substring(0, 14) === 'headerFontSans' && Math.random() > 0.3

  return {
    fontClasses: fonts,
    border: hasBorder(),
    hasColorBlockquoteBG: Math.random() > 0.5,
    color,
    coverImage: {
      isBW,
      isMultiply,
      color: pickOne(colors(), color),
      resizeMode: isContain ? 'contain' : 'cover',
      align: ['left', 'center', 'right'][Math.floor(Math.random() * 3)]
    },
    title: {
      ...title,
      valign: Math.random() > 0.5 ? 'center' : ['top', 'middle', 'bottom'][Math.floor(Math.random() * 3)],
      bg: !isBW && !isMultiply && !isContain && !title.isVertical && Math.random() > 0.5 ? true : false
    }
  }
}

const getFontClasses = function () {
  let headerClass = 'headerFont'
  let bodyClass = 'bodyFont'
  if (Math.random() > 0.3) {
    // sans heading, serif body
    headerClass += 'Sans' + (Math.floor((Math.random() * 7)) + 1)
    bodyClass += 'Serif' + (Math.floor((Math.random() * 2)) + 1)
  } else {
    // serif heading, sans body
    headerClass += 'Serif' + (Math.floor((Math.random()*4))+1)
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

const getColor = function () {
  return pickOne(colors())
}

const pickOne = function (arr, notThisOne) {
  let attempt = arr[Math.round(Math.random() * (arr.length - 1))]
  while (deepEqual(attempt, notThisOne)) {
    attempt = arr[Math.round(Math.random() * (arr.length - 1))]
  }
  return attempt
}

const colors = () => {
  return [
    {
      name: 'red1',
      hex: '#D66D75',
      rgba: 'rgba(214, 109, 117, 0.4)'
    },
    {
      name: 'red2',
      hex: '#C33764',
      rgba: 'rgba(195, 55, 100, 0.4)'
    },
    {
      name: 'orange1',
      hex: '#FF8235',
      rgba: 'rgba(255, 128, 0, 0.4)'
    },
    {
      name: 'orange2',
      hex: '#F7971E',
      rgba: 'rgba(247, 151, 30, 0.4)'
    },
    {
      name: 'yellow1',
      hex: '#FFD200',
      rgba: 'rgba(255, 210, 0, 0.4)'
    },
    {
      name: 'yellow2',
      hex: '#e8f651',
      rgba: 'rgba(232, 245, 80, 0.4)'
    },
    {
      name: 'green1',
      hex: '#30E8BF',
      rgba: 'rgba(48, 232, 191, 0.4)'
    },
    {
      name: 'blue1',
      hex: '#4568DC',
      rgba: 'rgba(69, 104, 220, 0.4)'
    },
    {
      name: 'blue2',
      hex: '#0b99d5',
      rgba: 'rgba(11, 153, 213, 0.4)'
    },
    {
      name: 'purple1',
      hex: '#B06AB3',
      rgba: 'rgba(176, 106, 179, 0.4)'
    },
    {
      name: 'purple2',
      hex: '#ef61c0',
      rgba: 'rgba(239, 97, 192, 0.4)'
    },
    {
      name: 'brown1',
      hex: '#E29587',
      rgba: 'rgba(226, 149, 135, 0.4)'
    }
  ]
}

const getGradient = function () {
  const directions = [
    'to left',
    'to bottom'
  ]
  const color2 = getColor()
  return `linear-gradient(${pickOne(directions)}, ${color.rgba}, ${pickOne(colors()).rgba})`
}
