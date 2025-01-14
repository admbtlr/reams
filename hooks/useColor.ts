import React, { useEffect } from "react";
import { getColors } from 'react-native-image-colors'
import * as FileSystem from 'expo-file-system'
import { fileExists } from "../utils";
import { hexToHsl } from "../utils/colors";
import { useDispatch, useSelector } from "react-redux";
import { selectHostColors } from "../store/hostColors/hostColors";
import { Platform } from "react-native";

export function useColor(url: string | undefined) {
  const [color, setColor] = React.useState<string>()
  const dispatch = useDispatch()
  const hostColors = useSelector(selectHostColors)

  useEffect(() => {
    const getColor = async () => {

      if (url === undefined) {
        return 'black'
      }

      if (Platform.OS !== 'web') {
        const response = await fetch(url)
        if (response.url !== url) {
          url = response.url
        }    
      }

      const matches = url?.match(/:\/\/(.*?)\//)
      let host = matches?.length !== undefined && matches.length > 1 ? matches[1] : url

      const cachedColor = hostColors.find(hc => hc.host === host)?.color
      if (cachedColor) {
        setColor(cachedColor)
        return
      }

      try {
        let iconSource
        if (Platform.OS === 'web') {
          iconSource = process.env.EXPO_PUBLIC_API_URL + '/favicon?url=https://' + host
        } else {
          const path = `${FileSystem.documentDirectory}favicons/${host}.png`
          const faviconExists = await fileExists(path)
          if (!faviconExists) return
          iconSource = await FileSystem.readAsStringAsync(path, { encoding: FileSystem.EncodingType.Base64 })
          iconSource = 'data:image/png;base64,' + iconSource  
        }
        if (!iconSource) return
        const colors = await getColors(iconSource, {
          cache: true,
          key: host,
          quality: 'highest'
        })
        let bestColor
        console.log(colors)
        if (colors.platform === 'ios') {
          // weirdly, 'background' is the best option
          const options = ['background', 'primary', 'detail', 'secondary']
          let i = 0
          for (let i = 0; i < options.length; i++) {
            bestColor = colors[options[i]]
            if (bestColor !== undefined && bestColor !== '#FFFFFF') {
              break
            }
          }
        } else if (colors.platform === 'web') {
          bestColor = colors.dominant
        }
        if (bestColor) {
          const color = convertToHsl(bestColor)
          setColor(color)
          dispatch({
            type: 'hostColors/createHostColor', 
            payload: {
              host,
              color
            }
          }) 
        }
      } catch (err) {
        console.error('Error for host ' + host)
        // log(err, 'useColor')
      }
    }
    getColor()
  }, [url])
  
  const convertToHsl = (color: string) => {
    const hslArray = hexToHsl(color.substring(1))
    let hue = hslArray[0]
    let saturation = hslArray[1]
    let lightness = hslArray[2]
    if (Number.parseInt(lightness) && Number.parseInt(lightness) > 75) {
      lightness = 75
    }
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }
  
  return color
}
