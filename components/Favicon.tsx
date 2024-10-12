import React from 'react'
import * as FileSystem from 'expo-file-system'
import {
  Image,
  Platform,
  Text,
  View
} from 'react-native'
import {fileExists, getCachedFeedIconPath} from '../utils'
import { Sepia } from 'react-native-image-filter-kit'
import { useSelector } from 'react-redux'
import { RootState } from '../store/reducers'
import log from '../utils/log'

interface props {
  url: string | undefined
  isBW?: boolean | undefined
  isSmall?: boolean | undefined
  isSmaller?: boolean | undefined
}

const CORS_PROXY = process.env.CORS_PROXY
const API_URL = process.env.API_URL

function Favicon ({
  url,
  isBW,
  isSmall,
  isSmaller
}: props) {
  const [ faviconPath, setFaviconPath ] = React.useState<string>()

  React.useEffect(() => {
    console.log('Favicon!')
  }, [])


  React.useEffect(() => {
    // const fileExists = async (path: string) => {
    //   try {
    //     const fileInfo = await FileSystem.getInfoAsync(path)
    //     return fileInfo.exists  
    //   } catch (error) {
    //     log('fileExists in FavIcon', error)
    //     throw error
    //   }
    // }
    const createFaviconDirIfNotExists = async () => {
      const faviconDirExists = await fileExists(`${FileSystem.documentDirectory}favicons/`)
      if (!faviconDirExists) {
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}favicons/`)
      }
    }
    const cacheFavicon = async () => {
      console.log('Inside cacheFavicon')
      if (url === undefined) return
      const response = await fetch(url)
      if (response.url !== url) {
        url = response.url
      }
      const matches = url?.match(/:\/\/(.*?)\//)
      const host = matches?.length !== undefined && matches.length > 1 ? matches[1] : null
      if (host === null) return
      await createFaviconDirIfNotExists()
      const path = `${FileSystem.documentDirectory}favicons/${host}.png`
      const faviconExists = await fileExists(path)
      if (!faviconExists) {
        console.log('Favicon doesn\'t exist')
        const apiUrl = API_URL //https://ead3-92-77-119-73.ngrok-free.app/api'
        const proxy = CORS_PROXY //`${apiUrl}/cors-proxy/`
        let faviconUrl = `${apiUrl}/favicon?url=${encodeURIComponent(`https://${host}`)}`
        faviconUrl = Platform.OS === 'web' ?
          `${proxy}?url=${encodeURIComponent(faviconUrl)}` :
          faviconUrl
        try {
          await FileSystem.downloadAsync(faviconUrl, path)
          setFaviconPath(path)
        } catch (err) {
          log(err, 'cacheFavicon')
        }
      } else {
        console.log(`Favicon for ${host} exists`)
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
    source={{ uri: faviconPath }}
    style={{
      width,
      height,
    }}
  /> : null
  if (isBW && image !== null) {
    image = <Sepia
      amount={1}
      image={image} />
  }
  return url ?
    <View style={{
      backgroundColor: 'transparent',//feed ? feed.color : 'white',
      // margin: 10,
      width,
      height,
      marginRight: 3
    }}>
      { image }
    </View> :
    null
}

export default Favicon
