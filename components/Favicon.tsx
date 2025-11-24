import React from 'react'
import * as FileSystem from 'expo-file-system'
import {
  Image,
  Platform,
  View
} from 'react-native'
import { fileExists } from '../utils'
import log from '../utils/log'

interface props {
  url: string | undefined
  isBW?: boolean | undefined
  isSmall?: boolean | undefined
  isSmaller?: boolean | undefined
}

const EXPO_PUBLIC_CORS_PROXY = process.env.EXPO_PUBLIC_CORS_PROXY
const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL

// Module-level store to track hosts with cached favicons
const cachedHosts = new Set<string>()
let isInitialized = false

// Initialize the cache by reading the favicons directory
const initializeCachedHosts = async () => {
  if (isInitialized) return
  try {
    const dir = `${FileSystem.documentDirectory}favicons/`
    const exists = await fileExists(dir)
    if (exists) {
      const files = await FileSystem.readDirectoryAsync(dir)
      files.forEach(file => {
        const host = file.replace('.png', '')
        cachedHosts.add(host)
      })
    }
    isInitialized = true
  } catch (err) {
    log(err, 'initializeCachedHosts')
  }
}

function Favicon({
  url,
  isBW,
  isSmall,
  isSmaller
}: props) {
  const [faviconPath, setFaviconPath] = React.useState<string | undefined>(() => {
    if (Platform.OS === 'web' || !url) return undefined
    const matches = url.match(/:\/\/(.*?)\//)
    const host = matches?.[1]
    if (host && cachedHosts.has(host)) {
      return `${FileSystem.documentDirectory}favicons/${host}.png`
    }
    return undefined
  })
  const proxiedUrl = url && `${EXPO_PUBLIC_CORS_PROXY}?url=${encodeURIComponent(url)}`

  React.useEffect(() => {
    if (Platform.OS === 'web') return

    const createFaviconDirIfNotExists = async () => {
      const faviconDirExists = await fileExists(`${FileSystem.documentDirectory}favicons/`)
      if (!faviconDirExists) {
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}favicons/`)
      }
    }

    const cacheFavicon = async () => {
      if (url === undefined || proxiedUrl === undefined) return

      // Initialize the cache on first use
      await initializeCachedHosts()

      const response = await fetch(proxiedUrl)
      if (response.url !== url) {
        url = response.url
      }
      const matches = url?.match(/%3A%2F%2F(.*?)%2F/)
      const host = matches?.length !== undefined && matches.length > 1 ? matches[1] : null
      if (host === null) return

      // Check in-memory cache first
      if (cachedHosts.has(host)) {
        const path = `${FileSystem.documentDirectory}favicons/${host}.png`
        setFaviconPath(path)
        return
      }

      await createFaviconDirIfNotExists()
      const path = `${FileSystem.documentDirectory}favicons/${host}.png`
      const faviconExists = await fileExists(path)
      if (!faviconExists) {
        console.log('Favicon doesn\'t exist')
        const apiUrl = EXPO_PUBLIC_API_URL //https://ead3-92-77-119-73.ngrok-free.app/api'
        const proxy = EXPO_PUBLIC_CORS_PROXY //`${apiUrl}/cors-proxy/`
        let faviconUrl = `${apiUrl}/favicon?url=${encodeURIComponent(`https://${host}`)}`
        faviconUrl = Platform.OS === 'web' ?
          `${proxy}?url=${encodeURIComponent(faviconUrl)}` :
          faviconUrl
        try {
          await FileSystem.downloadAsync(faviconUrl, path)
          cachedHosts.add(host)  // Add to cache after successful download
          setFaviconPath(path)
        } catch (err) {
          log(err, 'cacheFavicon')
        }
      } else {
        cachedHosts.add(host)  // Add to cache if file exists
        setFaviconPath(path)
      }
    }
    cacheFavicon()
  }, [])


  if (faviconPath === undefined) {
    return null
  }

  const width = isSmaller ? 18 : isSmall ? 24 : 32
  const height = isSmaller ? 18 : isSmall ? 24 : 32
  let image = faviconPath ? <Image
    width={width}
    height={height}
    // source={{ uri: Platform.OS === 'web' ? feed.favicon?.url : getCachedFeedIconPath(feed._id) }}
    source={{ uri: Platform.OS === 'web' ? proxiedUrl : faviconPath }}
    style={{
      width,
      height,
    }}
  /> : null
  return url ?
    <View style={{
      backgroundColor: 'transparent',//feed ? feed.color : 'white',
      // margin: 10,
      width,
      height,
      marginRight: 3
    }}>
      {image}
    </View> :
    null
}

export default Favicon
