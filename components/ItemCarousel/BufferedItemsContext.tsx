import React, { createContext, useContext, ReactNode, useState, useMemo, useCallback, useEffect, useRef, MutableRefObject } from 'react'
import { Item, ItemInflated, ItemType, MARK_ITEM_READ, UPDATE_CURRENT_ITEM } from '@/store/items/types'
import { useDispatch, useSelector } from 'react-redux'
import { getItems } from '@/utils/get-item'
import { Feed } from '@/store/feeds/types'
import { RootState } from '@/store/reducers'
import { BUFFER_LENGTH } from './constants'
import { getItems as getItemsSqlite } from '@/storage/sqlite'

interface BufferedItemsContextType {
  bufferedItems: ItemInflated[]
  bufferStartIndex: number
  bufferIndexRef: MutableRefObject<number>
  setBufferIndex: (bufferIndex: number) => void
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
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)

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
  // we want to keep track of the buffer index
  // without causing re-renders of the whole carousel
  const bufferIndexRef = useRef(0)
  // keep a cache of inflated items in case we return to them
  const previouslyInflatedRef = useRef<ItemInflated[]>([])
  const previouslyInflatedMaxLength = 20

  const calculateBufferStartIndex = useCallback(() => {
    // Calculate buffer position based on current Redux index
    if (bufferIndexRef.current === BUFFER_LENGTH - 1) {
      // remember that there's an item BEFORE the current Item
      // which is why we have to do -2 instead of just -1 here
      return bufferStartIndex + BUFFER_LENGTH - 2
    } else if (bufferIndexRef.current === 0) {
      return Math.max(0, bufferStartIndex - 1)
    } else {
      return bufferStartIndex
    }
  }, [bufferStartIndex])

  const getBufferedItems = useMemo(() => async () => {
    // do we need to calculate a new buffer?
    const bufferStart = calculateBufferStartIndex()
    const bufferEnd = bufferStart + BUFFER_LENGTH > items.length - 1 ?
      items.length :
      bufferStart + BUFFER_LENGTH
    const buffered = items.slice(bufferStart, bufferEnd) as (Item | ItemInflated)[]

    // extract the inflated items that we already have in the current buffer
    let alreadyInflated
    for (let i = 0; i < buffered.length; i++) {
      if (alreadyInflated = bufferedItems.find(bi => bi._id === buffered[i]._id)) {
        buffered[i] = alreadyInflated
      } else if (alreadyInflated = previouslyInflatedRef.current.find(pi => pi._id === buffered[i]._id)) {
        buffered[i] = alreadyInflated
      }
    }
    const toInflate = buffered.filter(b => !('styles' in b))
    if (toInflate.length > 0) {
      const now = Date.now()
      const inflated = await getItemsSqlite(toInflate)
      console.log(`Time taken to inflate items: ${Date.now() - now}ms`)
      previouslyInflatedRef.current.push(...inflated)
      if (previouslyInflatedRef.current.length > previouslyInflatedMaxLength) {
        previouslyInflatedRef.current = previouslyInflatedRef.current.slice(-previouslyInflatedMaxLength)
      }
      for (let i = 0; i < buffered.length; i++) {
        if (!('styles' in buffered[i])) {
          buffered[i] = inflated.find(inf => inf._id === buffered[i]._id) as ItemInflated
        }
      }
    }
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

  const dispatch = useDispatch()
  const setBufferIndex = (bufferIndex: number) => {
    const previousItem = bufferedItems[bufferIndexRef.current]
    bufferIndexRef.current = bufferIndex
    maybeUpdateBuffer()
    dispatch({
      type: UPDATE_CURRENT_ITEM,
      displayMode,
      item: bufferedItems[bufferIndex]._id,
      previousItemId: previousItem?._id
    })
  }

  const maybeUpdateBuffer = async () => {
    // const newBufferedItems = getBufferedItems()
    // if (stringifyItems(newBufferedItems) !== stringifyItems(bufferedItems)) {
    const newBufferStartIndex = calculateBufferStartIndex()
    if (newBufferStartIndex !== bufferStartIndex) {
      const buffered = await getBufferedItems()
      setBufferedItems(buffered)
      setBufferStartIndex(newBufferStartIndex)
      // TODO: if we're swipe back to the beginning, it's possible that this is wrong
      // e.g. we just had this buffer of absolute indexes: [1, 2, 3, 4, 5]
      // when we swipe back from item 2 to item 1,
      // the buffer gets rebuilt as [0, 1, 2, 3, 4]
      // the currentItem should be 1 (both abs and relative),
      // but since the bufferStartIndex is 0, it gets set to 0 too
      bufferIndexRef.current = bufferStartIndex === 0 ? 0 : bufferStartIndex - 1
    }
    // }
  }

  const inflateAndSetItems = async () => {
    const buffered = await getBufferedItems()
    setBufferedItems(buffered)
  }

  useEffect(() => {
    inflateAndSetItems()
  }, [displayMode])
  //}, [items, bufferStartIndex, displayMode, getBufferedItems, stringifyItems, bufferedItems, calculateBufferStartIndex])

  const value = useMemo(() => ({
    bufferedItems,
    bufferStartIndex,
    bufferIndexRef,
    setBufferIndex
  }), [bufferedItems, bufferStartIndex, bufferIndexRef, setBufferIndex])

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
