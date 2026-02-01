import ReactNativeBlobUtil from 'react-native-blob-util'
import { Platform } from 'react-native'

const CACHE_DIR = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/image-cache`

/**
 * Initialize the image cache directory
 */
export const initImageCache = async () => {
  try {
    const exists = await ReactNativeBlobUtil.fs.exists(CACHE_DIR)
    if (!exists) {
      await ReactNativeBlobUtil.fs.mkdir(CACHE_DIR)
    }
  } catch (error) {
    console.error('Failed to initialize image cache:', error)
  }
}

/**
 * Generate a filename from a URL
 */
const getFilenameFromUrl = (url: string): string => {
  // Create a simple hash from the URL
  const hash = url.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  // Get file extension from URL
  const urlWithoutQuery = url.split('?')[0]
  const ext = urlWithoutQuery.split('.').pop() || 'jpg'
  
  return `${Math.abs(hash)}.${ext}`
}

/**
 * Cache images for a specific item
 * Returns a map of original URLs to cached file paths
 */
export const cacheImagesForItem = async (
  itemId: string,
  imageUrls: string[]
): Promise<Map<string, string>> => {
  const urlToCachePath = new Map<string, string>()
  
  try {
    await initImageCache()
    
    const itemCacheDir = `${CACHE_DIR}/${itemId}`
    const exists = await ReactNativeBlobUtil.fs.exists(itemCacheDir)
    if (!exists) {
      await ReactNativeBlobUtil.fs.mkdir(itemCacheDir)
    }
    
    // Download all images in parallel
    const downloadPromises = imageUrls.map(async (url) => {
      try {
        const filename = getFilenameFromUrl(url)
        const cachePath = `${itemCacheDir}/${filename}`
        
        // Check if already cached
        const fileExists = await ReactNativeBlobUtil.fs.exists(cachePath)
        if (fileExists) {
          const localPath = Platform.OS === 'android' ? `file://${cachePath}` : cachePath
          urlToCachePath.set(url, localPath)
          return
        }
        
        // Download the image
        const response = await ReactNativeBlobUtil.config({
          path: cachePath,
          fileCache: true,
        }).fetch('GET', url)
        
        const status = response.info().status
        if (status === 200) {
          const localPath = Platform.OS === 'android' ? `file://${cachePath}` : cachePath
          urlToCachePath.set(url, localPath)
        } else {
          console.warn(`Failed to download image: ${url} (status: ${status})`)
        }
      } catch (error) {
        console.error(`Failed to cache image: ${url}`, error)
      }
    })
    
    await Promise.all(downloadPromises)
  } catch (error) {
    console.error('Failed to cache images for item:', error)
  }
  
  return urlToCachePath
}

/**
 * Get cached image path for a specific item and URL
 */
export const getCachedImageForItem = async (
  itemId: string,
  imageUrl: string
): Promise<string | null> => {
  try {
    const filename = getFilenameFromUrl(imageUrl)
    const cachePath = `${CACHE_DIR}/${itemId}/${filename}`
    
    const exists = await ReactNativeBlobUtil.fs.exists(cachePath)
    if (exists) {
      return Platform.OS === 'android' ? `file://${cachePath}` : cachePath
    }
    
    return null
  } catch (error) {
    console.error('Failed to get cached image:', error)
    return null
  }
}

/**
 * Clear cache for a specific item
 */
export const clearCacheForItem = async (itemId: string) => {
  try {
    const itemCacheDir = `${CACHE_DIR}/${itemId}`
    const exists = await ReactNativeBlobUtil.fs.exists(itemCacheDir)
    if (exists) {
      await ReactNativeBlobUtil.fs.unlink(itemCacheDir)
    }
  } catch (error) {
    console.error(`Failed to clear cache for item ${itemId}:`, error)
  }
}

/**
 * Clear the entire image cache
 */
export const clearImageCache = async () => {
  try {
    const exists = await ReactNativeBlobUtil.fs.exists(CACHE_DIR)
    if (exists) {
      await ReactNativeBlobUtil.fs.unlink(CACHE_DIR)
      await ReactNativeBlobUtil.fs.mkdir(CACHE_DIR)
    }
  } catch (error) {
    console.error('Failed to clear image cache:', error)
  }
}

/**
 * Get the size of the image cache
 */
export const getImageCacheSize = async (): Promise<number> => {
  try {
    const exists = await ReactNativeBlobUtil.fs.exists(CACHE_DIR)
    if (!exists) {
      return 0
    }
    
    const items = await ReactNativeBlobUtil.fs.ls(CACHE_DIR)
    let totalSize = 0
    
    for (const item of items) {
      const itemPath = `${CACHE_DIR}/${item}`
      const stat = await ReactNativeBlobUtil.fs.stat(itemPath)
      
      if (stat.type === 'directory') {
        const files = await ReactNativeBlobUtil.fs.ls(itemPath)
        for (const file of files) {
          const filePath = `${itemPath}/${file}`
          const fileStat = await ReactNativeBlobUtil.fs.stat(filePath)
          totalSize += parseInt(fileStat.size, 10)
        }
      } else {
        totalSize += parseInt(stat.size, 10)
      }
    }
    
    return totalSize
  } catch (error) {
    console.error('Failed to get image cache size:', error)
    return 0
  }
}
