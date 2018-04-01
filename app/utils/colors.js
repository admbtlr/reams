import {colors, colorsHsl, uiColorsHsl} from './color-definitions'

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
export function hslToRgb(h, s, l){
  var r, g, b;

  if(s == 0){
    r = g = b = l; // achromatic
  }else{
    var hue2rgb = function hue2rgb(p, q, t){
      if(t < 0) t += 1;
      if(t > 1) t -= 1;
      if(t < 1/6) return p + (q - p) * 6 * t;
      if(t < 1/2) return q;
      if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export function hslStringToRgbString (hslString) {
  const hsl = hslStringToHSL(hslString)
  const rgb = hslToRgb(...hsl)
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]}`
}

export function hslStringToHSL (hslString) {
  let hsl = hslString.substring(4, hslString.length - 1).split(',')
  hsl[0] = hsl[0] / 360
  hsl[1] = hsl[1].substring(0, hsl[1].length - 1) / 100
  hsl[2] = hsl[2].substring(0, hsl[2].length - 1) / 100
  return hsl
}

export function hslToHslString (hsl) {
  let stringified = [hsl[0] * 255 + '', (hsl[1] * 100) + '%', (hsl[2] * 100) + '%']
  return 'hsl(' + stringified.join(',') + ')'
}

export  function hslToBlendColor (hsl) {
  let rgb = hslToRgb(...hsl)
  rgb = rgb.map((num) => num / 255)
  rgb.push(1)
  return rgb
}

export  function hslStringToBlendColor (hslString) {
  return hslToBlendColor(hslStringToHSL(hslString))
}

export function getNames () {
  return Object.keys(colorsHsl)
}

export function blendColor (colorName) {
  return hslStringToBlendColor(hslString(colorName))
}

export function hslString (colorName) {
  return colorsHsl[colorName] || uiColorsHsl[colorName]
}