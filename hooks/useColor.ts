import React, { useEffect } from "react";
import { getColors } from 'react-native-image-colors'
import * as FileSystem from 'expo-file-system'
import { fileExists } from "../utils";
import { hexToHsl } from "../utils/colors";
import { useDispatch, useSelector } from "react-redux";
import { selectHostColors } from "../store/hostColors/hostColors";
import { Platform } from "react-native";
import type { IOSImageColors } from "react-native-image-colors/build/types";

export function useColor(urlParam: string | undefined) {
  const [color, setColor] = React.useState<string>()
  const dispatch = useDispatch()
  const hostColors = useSelector(selectHostColors)
  let url = urlParam

  useEffect(() => {
    const getColor = async () => {

      if (url === undefined || url.length === 0) {
        return 'black'
      }

      if (Platform.OS !== 'web') {
        const response = await fetch(url)
        if (response.url !== url) {
          url = response.url
        }
      }

      const matches = url?.match(/:\/\/(.*?)\//)
      const host = matches?.length !== undefined && matches.length > 1 ? matches[1] : url

      const cachedColor = hostColors.find(hc => hc.host === host)?.color
      if (cachedColor) {
        setColor(cachedColor)
        return
      }

      try {
        let iconSource: string
        if (Platform.OS === 'web') {
          iconSource = `${process.env.EXPO_PUBLIC_API_URL}/favicon?url=https://${host}`
        } else {
          const path = `${FileSystem.documentDirectory}favicons/${host}.png`
          const faviconExists = await fileExists(path)
          if (!faviconExists) return
          iconSource = await FileSystem.readAsStringAsync(path, { encoding: FileSystem.EncodingType.Base64 })
          iconSource = `data:image/png;base64,${iconSource}`
        }
        if (!iconSource) return
        const colors = await getColors(iconSource, {
          cache: true,
          key: host,
          quality: 'highest'
        })
        let bestColor: string
        console.log(colors)
        if (colors.platform === 'ios') {
          // weirdly, 'background' is the best option
          const options: (keyof IOSImageColors)[] = ['background', 'primary', 'detail', 'secondary']
          for (let i = 0; i < options.length; i++) {
            bestColor = colors[options[i] as keyof IOSImageColors]
            if (bestColor !== undefined && bestColor !== '#FFFFFF') {
              break
            }
          }
        } else if (colors.platform === 'web' || colors.platform === 'android') {
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
        console.error(`Error for host ${host}`)
        // log(err, 'useColor')
      }
    }

    const matches = url?.match(/:\/\/(.*?)\//)
    const host = matches?.length !== undefined && matches.length > 1 ? matches[1] : url

    const cachedColor = hostColors.find(hc => hc.host === host)?.color
    if (cachedColor) {
      setColor(cachedColor)
      return
    }

    getColor()
  }, [dispatch, hostColors, url])

  const convertToHsl = (color: string) => {
    const hslArray = hexToHsl(color.substring(1))
    const hue = hslArray[0]
    const saturation = hslArray[1]
    let lightness = hslArray[2]
    if (Number.parseInt(lightness) && Number.parseInt(lightness) > 75) {
      lightness = 75
    }
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  return color
}
