import React, { useEffect } from 'react'
import {
  Animated
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
  const cachedCoverImageId = useSelector((state: RootState) => !!feedId ?
    state.feedsLocal.feeds.find(fl => fl._id === feed?._id)?.cachedCoverImageId :
    state.itemsSaved.items.find(i => i._id === itemId)?.cachedCoverImageId)

  const coverImageItem = !!feedId ? useSelector((state: RootState) => state.itemsUnread.items
      .filter(i => i.feed_id === feedId))
      .find(i => i.banner_image) :
      item?.banner_image ? item : undefined
  
  const maybeRemoveOrUpdateCoverImage = async () => {
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
    const imageId = cachedCoverImageId || coverImageItem?._id
    return imageId ?
      getCachedCoverImagePath(imageId) :
      null
  }

  const coverImageDimensions = coverImageItem?.imageDimensions
  const color = feed ? feed.color : 'black'

  const coverImagePath = getCoverImagePath()

  return (color && !!coverImagePath && coverImageDimensions && coverImageDimensions.width !== 0 && width !== 0) ?
    <Animated.View style={{ width, height }}>
      <Animated.Image
        source={{ uri: `file://${coverImagePath}` }}
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


