import React, { useEffect } from "react";
import { getColors } from 'react-native-image-colors'
import * as FileSystem from 'expo-file-system'
import { fileExists } from "../utils";
import { hexToHsl } from "../utils/colors";
import { useDispatch, useSelector } from "react-redux";
import { selectHostColors } from "../store/hostColors/hostColors";
import { Platform } from "react-native";
import type { IOSImageColors } from "react-native-image-colors/build/types";

// Map to store pending color analysis promises by host
const pendingAnalysis = new Map<string, Promise<string | undefined>>()

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

      // resolve redirects
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

      // Check if there's already a pending analysis for this host
      if (pendingAnalysis.has(host)) {
        try {
          const result = await pendingAnalysis.get(host)
          if (result) {
            setColor(result)
          }
        } catch (err) {
          console.error(`Error waiting for pending analysis for host ${host}`, err)
        }
        return
      }

      // Create and store the analysis promise
      const analysisPromise = performColorAnalysis(host, dispatch)
      pendingAnalysis.set(host, analysisPromise)

      try {
        const result = await analysisPromise
        if (result) {
          setColor(result)
        }
      } catch (err) {
        console.error(`Error for host ${host}`, err)
      } finally {
        // Clean up the pending promise
        pendingAnalysis.delete(host)
      }
    }

    const matches = url?.match(/:\/\/(.*?)\//)
    const host = matches?.length !== undefined && matches.length > 1 ? matches[1] : url

    let cachedColor = hostColors.find(hc => hc.host === host)?.color
    if (cachedColor) {
      setColor(limitHsl(cachedColor))
      return
    }

    getColor()
  }, [dispatch, hostColors, url])

  const limitHsl = (hslString: string) => {
    // Use regex to extract the h, s, l values
    const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);

    if (!match) {
      throw new Error('Invalid HSL string format');
    }

    const h = parseInt(match[1]);
    const s = Math.min(parseInt(match[2]), 85);
    const l = Math.min(parseInt(match[3]), 85);

    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  return color
}

// Extracted color analysis logic into a separate function
async function performColorAnalysis(host: string, dispatch: any): Promise<string | undefined> {
  try {
    let iconSource: string
    if (Platform.OS === 'web') {
      iconSource = `${process.env.EXPO_PUBLIC_API_URL}/favicon?url=https://${host}`
    } else {
      const path = `${FileSystem.documentDirectory}favicons/${host}.png`
      const faviconExists = await fileExists(path)
      if (!faviconExists) return undefined
      iconSource = await FileSystem.readAsStringAsync(path, { encoding: FileSystem.EncodingType.Base64 })
      iconSource = `data:image/png;base64,${iconSource}`
    }
    if (!iconSource) return undefined

    const colors = await getColors(iconSource, {
      cache: true,
      key: host,
      quality: 'highest'
    })

    let bestColor: string | undefined
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
      const hslArray = hexToHsl(bestColor.substring(1))
      const hue = hslArray[0]
      let saturation = hslArray[1]
      const lightness = hslArray[2]
      const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`

      dispatch({
        type: 'hostColors/createHostColor',
        payload: {
          host,
          color
        }
      })

      return color
    }
  } catch (err) {
    console.error(`Error analyzing color for host ${host}`, err)
    throw err
  }

  return undefined
}
