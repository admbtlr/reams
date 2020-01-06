import { store } from '../redux/store'

const { colors, darker, lighter, desaturated, desaturatedDarker, ui, darkMode } = require('./colors.json')

// taken from https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion#9493060
/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
export function hslToRgb (h, s, l) {
  var r, g, b

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    var hue2rgb = function hue2rgb (p, q, t) {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s
    var p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   {number}  r       The red color value
 * @param   {number}  g       The green color value
 * @param   {number}  b       The blue color value
 * @return  {Array}           The HSL representation
 */
export function rgbToHsl (r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  var max = Math.max(r, g, b), min = Math.min(r, g, b)
  var h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    var d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hexToRgb (hex) {
  const hexArray = hex.length === 3 ? [
    hex[0] + hex[0],
    hex[1] + hex[1],
    hex[2] + hex[2]
  ] : [
    hex[0] + hex[1],
    hex[2] + hex[3],
    hex[4] + hex[5]
  ]
  return hexArray.map(hexVal => parseInt(hexVal, 16))
}

export function hexToHsl (hex) {
  return rgbToHsl(...hexToRgb(hex))
}

export function hslStringToRgbString (hslString) {
  const hsl = normaliseHsl(hslStringToHSL(hslString))
  const rgb = hslToRgb(...hsl)
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]}`
}

export function hslStringToHSL (hslString) {
  let hsl = hslString.substring(4, hslString.length - 1).split(',')
  return [
    hsl[0],
    hsl[1].substring(0, hsl[1].length - 1),
    hsl[2].substring(0, hsl[2].length - 1)
  ]
}

function normaliseHsl (hsl) {
  return [
    hsl[0] / 360,
    hsl[1] / 100,
    hsl[2] / 100
  ]
}

export function hslToHslString (hsl) {
  if (hsl[0] > 1 || hsl[1] > 1 || hsl[2] > 1) {
    hsl = normaliseHsl(hsl)
  }
  let stringified = [hsl[0] * 255 + '', (hsl[1] * 100) + '%', (hsl[2] * 100) + '%']
  return 'hsl(' + stringified.join(',') + ')'
}

export function hslToBlendColor (hsl) {
  if (hsl[0] > 1 || hsl[1] > 1 || hsl[2] > 1) {
    hsl = normaliseHsl(hsl)
  }
  let rgb = hslToRgb(...hsl)
  rgb = rgb.map((num) => num / 255)
  rgb.push(1)
  return rgb
}

export function hslStringToBlendColor (hslString) {
  return hslToBlendColor(hslStringToHSL(hslString))
}

export function getNames () {
  return Object.keys(colors)
}

export function getHues () {
  return Object.values(colors).reduce((color, accum) => {
    accum.push(/hsl\(([0-9]*),/.exec(color)[1])
    return accum
  }, [])
}

export function blendColor (colorName, modifier = '') {
  return hslStringToBlendColor(hslString(colorName, modifier))
}

export function hslString (color, modifier = '', alpha) {
  if (typeof color === 'object') {
    let lightness = color[2]
    // if (modifier === 'darkmode') {
    if (modifier === 'darkmodable' &&
      (store && store.getState().webView.isDarkBackground)) {
      lightness = lightness < 30 ?
        50 + (30 - lightness) :
        lightness
    }
    return `hsl(${color[0]}, ${color[1]}%, ${lightness}%)`
  }
  let palette
  switch (modifier) {
    case 'darker':
      palette = darker
      break
    case 'lighter':
      palette = lighter
      break
    case 'desaturated':
      palette = desaturated
      break
    case 'desaturatedDarker':
      palette = desaturatedDarker
      break
    default:
      palette = colors
  }
  color = palette[color] ||
    ((store && store.getState().webView.isDarkBackground) ? darkMode[color] : ui[color])
  if (alpha) {
    color = color.replace('hsl', 'hsla').replace(')', `${alpha})`)
  }
  return color
}
