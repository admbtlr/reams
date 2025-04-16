import React, { useEffect, useState } from 'react'
import {
  Animated, Image, Platform
} from 'react-native'
import {fileExists, getCachedCoverImagePath} from '../utils'
import { useSelector } from 'react-redux'
import { RootState } from 'store/reducers'
import { useDispatch } from 'react-redux'
import { REMOVE_CACHED_COVER_IMAGE, SET_CACHED_COVER_IMAGE } from '../store/feeds/types'
import log from '../utils/log'

interface Props {
  feedId: string | undefined
  itemId: string | undefined
  width: number
  height: number
  testID?: string
}

export default function CardCoverImage ({feedId, itemId, width, height, testID}: Props) {
  const dispatch = useDispatch()
  const feed = feedId ? useSelector((state: RootState) => state.feeds.feeds.find(f => f._id === feedId)) : undefined
  const itemSaved = itemId ? useSelector((state: RootState) => state.itemsSaved.items.find(i => i._id === itemId)) : undefined
  const itemUnread = itemId ? useSelector((state: RootState) => state.itemsUnread.items.find(i => i._id === itemId)) : undefined
  const item = itemSaved || itemUnread
  const feeds = useSelector((state: RootState) => state.feeds.feeds)
  const feedsLocal = useSelector((state: RootState) => state.feedsLocal)
  const unreadItems = useSelector((state: RootState) => state.itemsUnread.items)
  const savedItems = useSelector((state: RootState) => state.itemsSaved.items)
  const cachedCoverImageId = !!feedId &&
    feedsLocal.feeds.find(fl => fl._id === feed?._id)?.cachedCoverImageId    
  const coverImageItem = !!feedId ? 
    unreadItems.filter(i => i.feed_id === feedId).find(i => i.coverImageUrl) :
    item?.hasCoverImage ? 
      item : 
      undefined
  const [imageDimensions, setImageDimensions] = useState({width: 0, height: 0}) // only used on web
  if (Platform.OS === 'web' && coverImageItem?.coverImageUrl) {
    Image.getSize(coverImageItem.coverImageUrl, (width, height) => {
      if (width !== imageDimensions.width || height !== imageDimensions.height) {
        setImageDimensions({width, height})
      }
    })
  }   

  const setCachedCoverImage = (sourceId: string, cachedCoverImageId: string) => {
    return dispatch({
      type: SET_CACHED_COVER_IMAGE,
      id: sourceId,
      cachedCoverImageId
    })
  }
  const removeCachedCoverImage = (feedId: string) => {
    return dispatch({
      type: REMOVE_CACHED_COVER_IMAGE,
      id: feedId
    })
  }

  const maybeRemoveOrUpdateCoverImage = async () => {
    if (Platform.OS === 'web') return
    const path = getCoverImagePath()
    if (!path) return
    try {
      const exists = await fileExists(path)
      if (!exists) {
        removeCachedCoverImage(feedId || itemId || '')
      } else if (coverImageItem && !cachedCoverImageId) {
        setCachedCoverImage(feedId || itemId || '', coverImageItem?._id)
      }  
    } catch (e) {
      log('maybeRemoveOrUpdateCoverImage', e)
    }
  }

  useEffect(() => {
    if (!feedId) return // don't need to try and cache cover image for saved items
    maybeRemoveOrUpdateCoverImage()
  }, [coverImageItem, cachedCoverImageId])

  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextProps.feed?.feedLocal?.cachedCoverImageId !== 
  //     this.props.feed?.feedLocal?.cachedCoverImageId
  // }

  const getCoverImagePath = () => {
    if (Platform.OS === 'web') {
      return coverImageItem?.coverImageUrl
    } else {
      const imageId = cachedCoverImageId || coverImageItem?._id || item?._id
      return imageId ?
        getCachedCoverImagePath(imageId) :
        null  
    }
  }

  const coverImageDimensions = Platform.OS === 'web' ? imageDimensions : coverImageItem?.imageDimensions
  const color = feed ? feed.color : 'black'

  const coverImagePath = getCoverImagePath()

  return (color && !!coverImagePath && coverImageDimensions && coverImageDimensions.width !== 0 && width !== 0) ?
    <Animated.View testID={testID} style={{ width, height }}>
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


