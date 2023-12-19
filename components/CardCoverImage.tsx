import React, { useEffect, useState } from 'react'
import {
  Animated, Image, Platform
} from 'react-native'
import {fileExists, getCachedCoverImagePath} from '../utils'
import { useSelector } from 'react-redux'
import { RootState } from 'store/reducers'

interface Props {
  feedId: string | undefined
  itemId: string | undefined
  removeCachedCoverImage: (id: string) => void
  setCachedCoverImage: (id: string, imageId: string) => void
  width: number
  height: number
}

export default function CardCoverImage ({feedId, itemId, removeCachedCoverImage, setCachedCoverImage, width, height}: Props) {

  const feed = feedId ? useSelector((state: RootState) => state.feeds.feeds.find(f => f._id === feedId)) : undefined
  const item = itemId ? useSelector((state: RootState) => state.itemsSaved.items.find(i => i._id === itemId)) : undefined
  const feeds = useSelector((state: RootState) => state.feeds.feeds)
  const feedsLocal = useSelector((state: RootState) => state.feedsLocal)
  const unreadItems = useSelector((state: RootState) => state.itemsUnread.items)
  const savedItems = useSelector((state: RootState) => state.itemsSaved.items)
  const cachedCoverImageId = !!feedId ?
    feedsLocal.feeds.find(fl => fl._id === feed?._id)?.cachedCoverImageId :
    savedItems.find(i => i._id === itemId)?.cachedCoverImageId
  const coverImageItem = !!feedId ? 
    unreadItems.filter(i => i.feed_id === feedId).find(i => i.banner_image) :
    item?.banner_image ? 
      item : 
      undefined
  const [imageDimensions, setImageDimensions] = useState({width: 0, height: 0}) // only used on web
  if (Platform.OS === 'web' && coverImageItem?.banner_image) {
    Image.getSize(coverImageItem.banner_image, (width, height) => {
      if (width !== imageDimensions.width || height !== imageDimensions.height) {
        setImageDimensions({width, height})
      }
    })
  }   

  const maybeRemoveOrUpdateCoverImage = async () => {
    if (Platform.OS === 'web') return
    const path = getCoverImagePath()
    if (!path) return
    const exists = await fileExists(path)
    if (!exists) {
      removeCachedCoverImage(feedId || itemId || '')
    } else if (coverImageItem && !cachedCoverImageId) {
      setCachedCoverImage(feedId || itemId || '', coverImageItem?._id)
    }
  }

  useEffect(() => {
    maybeRemoveOrUpdateCoverImage()
  }, [coverImageItem, cachedCoverImageId])

  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextProps.feed?.feedLocal?.cachedCoverImageId !== 
  //     this.props.feed?.feedLocal?.cachedCoverImageId
  // }

  const getCoverImagePath = () => {
    if (Platform.OS === 'web') {
      return coverImageItem?.banner_image
    } else {
      const imageId = cachedCoverImageId || coverImageItem?._id
      return imageId ?
        getCachedCoverImagePath(imageId) :
        null  
    }
  }

  const coverImageDimensions = Platform.OS === 'web' ? imageDimensions : coverImageItem?.imageDimensions
  const color = feed ? feed.color : 'black'

  const coverImagePath = getCoverImagePath()

  return (color && !!coverImagePath && coverImageDimensions && coverImageDimensions.width !== 0 && width !== 0) ?
    <Animated.View style={{ width, height }}>
      <Animated.Image
        source={{ uri: coverImagePath }}
        style={{
          alignSelf: 'center',
          width,
          height,
          position: 'absolute',
        }}
      /> 
    </Animated.View> :
    null

}


