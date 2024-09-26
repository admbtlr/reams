import React, { useEffect } from "react";
import { getColors } from 'react-native-image-colors'
import * as FileSystem from 'expo-file-system'
import { fileExists } from "../utils";
import { hexToHsl, hslToHslString } from "../utils/colors";
import log from "../utils/log";

export function useColor(url: string) {
  const [color, setColor] = React.useState<string>()

  useEffect(() => {
    const getColor = async () => {

      // resolve any redirects
      const response = await fetch(url)
      if (response.url !== url) {
        url = response.url
      }

      // read the icon in as base64
      const matches = url?.match(/:\/\/(.*?)\//)
      const host = matches?.length !== undefined && matches.length > 1 ? matches[1] : null
      if (host === null) return
      const path = `${FileSystem.documentDirectory}favicons/${host}.png`
      const faviconExists = await fileExists(path)
      if (!faviconExists) return
      try {
        let iconBase64 = await FileSystem.readAsStringAsync(path, { encoding: FileSystem.EncodingType.Base64 })
        iconBase64 = 'data:image/png;base64,' + iconBase64
        const colors = await getColors(iconBase64, {
          cache: true,
          key: host,
          quality: 'highest'
        })
        if (colors.platform === 'ios') {
          // weirdly, 'background' is the best option
          const options = ['background', 'detail', 'primary', 'secondary']
          let i = 0
          let bestColor
          for (let i = 0; i < options.length; i++) {
            bestColor = colors[options[i]]
            if (bestColor !== undefined && bestColor !== '#FFFFFF') {
              break
            }
          }
          if (bestColor) {
            const hslArray = hexToHsl(bestColor.substring(1))
            let hue = hslArray[0]
            let saturation = hslArray[1]
            let lightness = hslArray[2]
            if (Number.parseInt(lightness) && Number.parseInt(lightness) > 75) {
              lightness = 75
            }
            setColor(`hsl(${hue}, ${saturation}%, ${lightness}%)`)  
          }
        }  
      } catch (err) {
        console.error('Error for host ' + host)
        // log(err, 'useColor')
      }
    }
    getColor()
  }, [url])
  

  return color
}