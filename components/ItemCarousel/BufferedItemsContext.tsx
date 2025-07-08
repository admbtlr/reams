import React, { createContext, useContext, ReactNode, useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { Item, ItemType } from '@/store/items/types'
import { useSelector } from 'react-redux'
import { getIndex, getItems } from '@/utils/get-item'
import { Feed } from '@/store/feeds/types'
import { RootState } from '@/store/reducers'
import { BUFFER_LENGTH } from '.'
import { useAnimation } from './AnimationContext'

interface BufferedItemsContextType {
  bufferedItems: Item[]
  bufferStartIndex: number
}

interface BufferedItemsProviderProps {
  children: ReactNode
}

const BufferedItemsContext = createContext<BufferedItemsContextType | null>(null)

export const BufferedItemsProvider: React.FC<BufferedItemsProviderProps> = ({ children }) => {
  const items = useSelector(getItems, (oldItems: Item[], newItems: Item[]) => (
    JSON.stringify(oldItems.map(i => i._id)) === JSON.stringify(newItems.map(i => i._id))
  ))
  const feeds = useSelector((state: RootState) => state.feeds.feeds, (oldFeeds: Feed[], newFeeds: Feed[]) => (
    JSON.stringify(oldFeeds.map(f => f._id)) === JSON.stringify(newFeeds.map(f => f._id))
  ))
  const currentIndex = useSelector(getIndex)
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)
  const { setBufferIndex } = useAnimation()

  const mapItem = (item: Item) => ({
    _id: item._id,
    isDecorated: item.isDecorated
  })

  // old version, with index
  // const getBufferedItems = useMemo(() => () => {
  //   const bufferStart = bufferStartIndex === 0 ? bufferStartIndex : bufferStartIndex - 1
  //   const bufferEnd = bufferStart + BUFFER_LENGTH > items.length - 1 ?
  //     items.length :
  //     bufferStart + BUFFER_LENGTH + 1
  //   const buffered = items.slice(bufferStart, bufferEnd)
  //   if (displayMode === ItemType.saved) {
  //     return buffered
  //   } else {
  //     return buffered.map(bi => {
  //       const feed = feeds && feeds.length > 0 && feeds.find(f => f._id === bi.feed_id)
  //       return {
  //         ...bi,
  //         isFeedMercury: feed && feed.isMercury
  //       }
  //     })
  //   }
  // }, [items, index, displayMode, feeds])

  const [bufferedItems, setBufferedItems] = useState<Item[]>([])
  const [bufferStartIndex, setBufferStartIndex] = useState<number>(0)


  const calculateBufferStartIndex = useCallback(() => {
    // Calculate buffer position based on current Redux index
    const relativeIndex = currentIndex - bufferStartIndex
    if (relativeIndex === BUFFER_LENGTH) {
      return bufferStartIndex + BUFFER_LENGTH - 1
    } else if (relativeIndex === 0) {
      return Math.max(0, bufferStartIndex - 1)
    } else {
      return bufferStartIndex
    }
  }, [currentIndex, bufferStartIndex])

  const getBufferedItems = useMemo(() => () => {
    // do we need to calculate a new buffer?
    const bufferStart = calculateBufferStartIndex()
    const bufferEnd = bufferStart + BUFFER_LENGTH > items.length - 1 ?
      items.length :
      bufferStart + BUFFER_LENGTH
    const buffered = items.slice(bufferStart, bufferEnd)
    if (displayMode === ItemType.saved) {
      return buffered
    } else {
      return buffered.map(bi => {
        const feed = feeds && feeds.length > 0 && feeds.find(f => f._id === bi.feed_id)
        return {
          ...bi,
          isFeedMercury: feed && feed.isMercury
        }
      })
    }
  }, [items, displayMode, feeds, calculateBufferStartIndex])

  const stringifyItems = useCallback((items: Item[], includeMercury: boolean = false) => {
    return JSON
      .stringify(items
        .map(item => includeMercury ? {
          _id: item._id,
          isDecorated: item.isDecorated
        } : item._id))
  }, [])

  useEffect(() => {
    const newBufferedItems = getBufferedItems()
    if (stringifyItems(newBufferedItems) !== stringifyItems(bufferedItems)) {
      const newBufferStartIndex = calculateBufferStartIndex()
      setBufferedItems(newBufferedItems)
      if (newBufferStartIndex !== bufferStartIndex) {
        setBufferStartIndex(newBufferStartIndex)
      }
    }
  }, [items, currentIndex, displayMode, getBufferedItems, stringifyItems, bufferedItems, calculateBufferStartIndex, bufferStartIndex])
  //}, [items, bufferStartIndex, displayMode, getBufferedItems, stringifyItems, bufferedItems, calculateBufferStartIndex])

  const value = useMemo(() => ({
    bufferedItems,
    bufferStartIndex
  }), [bufferedItems, bufferStartIndex])

  return (
    <BufferedItemsContext.Provider value={value}>
      {children}
    </BufferedItemsContext.Provider>
  )
}

export const useBufferedItems = (): BufferedItemsContextType => {
  const context = useContext(BufferedItemsContext)
  if (!context) {
    throw new Error('useBufferedItems must be used within a BufferedItemsProvider')
  }
  return context
}
