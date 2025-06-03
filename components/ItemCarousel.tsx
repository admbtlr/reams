import { Item, ItemType, SAVE_ITEM, SET_DISPLAY_MODE, TOGGLE_MERCURY_VIEW, UNSAVE_ITEM, UPDATE_CURRENT_INDEX } from '../store/items/types'
import React, { Fragment, useState, useRef, useCallback, useEffect, useMemo } from 'react'
import ItemsScreenOnboarding from './ItemsScreenOnboarding'
import {
  Animated
} from 'react-native'
import SwipeableViews from './SwipeableViews'
import TopBars from './TopBars'
import SourceExpanded from './SourceExpanded'
import ButtonsContainer from '../containers/Buttons'
import { getClampedScrollAnim, onScrollEnd, setClampedScrollListener, setScrollListener } from '../utils/animation-handlers'
import EmptyCarousel from './EmptyCarousel'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { UPDATE_ONBOARDING_INDEX } from '../store/config/types'
import { ADD_ITEM_TO_CATEGORY } from '../store/categories/types'
import { RootState } from '../store/reducers'
import { Feed } from '../store/feeds/types'
import { getIndex, getItems } from '../utils/get-item'

export const BUFFER_LENGTH = 5

// a kind of memoisation, but not for performance reasons
// persisting the buffered items makes it easier to decorate
// them with clampedScrollAnims
let bufferedItems: Item[]

const getBufferedItems = (items: Item[], index: number, displayMode: ItemType, feeds: Feed[]) => {
  const bufferStart = index === 0 ? index : index - 1
  const bufferEnd = index + BUFFER_LENGTH > items.length - 1 ?
    items.length :
    index + BUFFER_LENGTH + 1
  const buffered = items.slice(bufferStart, bufferEnd)
  const mapItem = (item: Item) => ({
    _id: item._id,
    isDecorated: item.isDecorated
  })
  if (!bufferedItems || JSON.stringify(buffered.map(mapItem)) !==
    JSON.stringify(bufferedItems.map(mapItem))) {
    bufferedItems = buffered
  }
  if (displayMode === ItemType.saved) {
    return bufferedItems
  } else {
    return bufferedItems.map(bi => {
      const feed = feeds && feeds.length > 0 && feeds.find(f => f._id === bi.feed_id)
      return {
        ...bi,
        isFeedMercury: feed && feed.isMercury
      }
    })
  }
}

class Emitter {
  listeners: { type: string, callback: () => void, id: string }[]
  constructor() {
    this.listeners = []
  }
  on(type: string, callback: () => void, id: string) {
    this.listeners.push({
      type,
      callback,
      id
    })
  }
  emit(type: string) {
    this.listeners.filter(l => l.type === type)
      .forEach(l => l.callback())
  }
  off(id: string) {
    this.listeners = this.listeners.filter(l => l.id !== id)
  }

}

const ItemCarousel = () => {
  const feeds = useSelector((state: RootState) => state.feeds.feeds)
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)
  const items = useSelector(getItems)
  const index = useSelector(getIndex)
  const isItemsOnboardingDone = useSelector((state: RootState) => state.config.isItemsOnboardingDone)
  const isOnboarding = useSelector((state: RootState) => state.config.isOnboarding)
  const orientation = useSelector((state: RootState) => state.config.orientation)
  const numItems = useSelector((state: RootState) => state.config.isOnboarding ?
    state.config.onboardingLength :
    items.length
  )

  const dispatch = useDispatch()
  const updateCurrentIndex = (index: number, lastIndex: number, displayMode: ItemType, isOnboarding: boolean) => {
    if (isOnboarding) {
      dispatch({
        type: UPDATE_ONBOARDING_INDEX,
        index,
        lastIndex,
        displayMode
      })
    } else {
      dispatch({
        type: UPDATE_CURRENT_INDEX,
        index,
        lastIndex,
        displayMode
      })
    }
  }
  const toggleDisplayMode = (currentDisplayMode: ItemType) => {
    return dispatch({
      type: SET_DISPLAY_MODE,
      displayMode: currentDisplayMode === ItemType.saved ?
        ItemType.unread :
        ItemType.saved
    })
  }
  const navigation = useNavigation()
  const [panAnim] = useState(() => new Animated.Value(0))

  // Refs for instance variables
  const indexRef = useRef(-1)
  const initialIndexRef = useRef(-1)
  const bufferIndexRef = useRef(-1)
  const selectedTextRef = useRef(undefined)
  const incomingIndexRef = useRef(null)
  const emitterRef = useRef(new Emitter())
  const clampedScrollAnimSetterRef = useRef(null)
  const scrollAnimSetterRef = useRef(null)
  const bufferIndexChangeListenerRef = useRef(null)
  const bufferedItemsRef = useRef(null)

  const initIndex = useCallback(() => {
    indexRef.current = initialIndexRef.current = index
    bufferIndexRef.current = index === 0 ? 0 : 1
  }, [index])

  const setIndex = useCallback((newIndex, bufferIndex) => {
    incomingIndexRef.current = newIndex
    const lastIndex = indexRef.current
    indexRef.current = newIndex
    bufferIndexRef.current = bufferIndex
    selectedTextRef.current = undefined
    bufferIndexChangeListenerRef.current && bufferIndexChangeListenerRef.current(bufferIndexRef.current)
    console.log('setIndex', indexRef.current, bufferIndexRef.current)
    updateCurrentIndex(newIndex, lastIndex, displayMode, isOnboarding)
  }, [updateCurrentIndex, displayMode, isOnboarding])

  const incrementIndex = useCallback(() => {
    setIndex(indexRef.current + 1, bufferIndexRef.current + 1)
  }, [setIndex])

  const decrementIndex = useCallback(() => {
    setIndex(indexRef.current - 1, bufferIndexRef.current - 1)
  }, [setIndex])

  const updateCarouselIndex = useCallback((bufferIndex) => {
    const diff = bufferIndex - bufferIndexRef.current
    setIndex(indexRef.current + diff, bufferIndex)
  }, [setIndex])

  const handleSetPanAnim = useCallback((newPanAnim) => {
    // panAnim is managed by useState, so we don't need to update it here
    // The original setPanAnim was setting state, but we're using a ref-based approach
  }, [])

  const setScrollAnim = useCallback((scrollAnim) => {
    if (clampedScrollAnimSetterRef.current) {
      clampedScrollAnimSetterRef.current(getClampedScrollAnim(scrollAnim))
    }
    if (scrollAnimSetterRef.current) {
      scrollAnimSetterRef.current(scrollAnim)
    }
  }, [])

  const handleOnScrollEnd = useCallback((scrollOffset) => {
    onScrollEnd(scrollOffset)
  }, [])

  const onTextSelection = useCallback((selectedText) => {
    selectedTextRef.current = selectedText
  }, [])

  const setClampedScrollAnimSetterAndListener = useCallback((clampedScrollAnimSetter, clampedScrollAnimListener) => {
    clampedScrollAnimSetterRef.current = clampedScrollAnimSetter
    setClampedScrollListener(clampedScrollAnimListener)
  }, [])

  const setScrollAnimSetterAndListener = useCallback((scrollAnimSetter, scrollAnimListener = null) => {
    scrollAnimSetterRef.current = scrollAnimSetter
    if (scrollAnimListener) {
      setScrollListener(scrollAnimListener)
    }
  }, [])

  const setBufferIndexChangeListener = useCallback((bufferIndexChangeListener) => {
    bufferIndexChangeListenerRef.current = bufferIndexChangeListener
  }, [])

  const onChangeIndex = useCallback((newIndex, lastIndex) => {
    incomingIndexRef.current = newIndex
    updateCurrentIndex(newIndex, lastIndex, displayMode, isOnboarding)
  }, [updateCurrentIndex, displayMode, isOnboarding])

  // Initialize index when component mounts or index changes
  useEffect(() => {
    initIndex()
  }, [initIndex])

  // Equivalent to componentDidUpdate for buffer index change listener
  useEffect(() => {
    bufferIndexChangeListenerRef.current && bufferIndexChangeListenerRef.current(bufferIndexRef.current)
  })

  // Memoize buffered items
  const currentBufferedItems = useMemo(() => {
    return getBufferedItems(items, index, displayMode, feeds)
  }, [items, index, displayMode, feeds])

  // Update bufferedItemsRef when currentBufferedItems changes
  useEffect(() => {
    bufferedItemsRef.current = currentBufferedItems
  }, [currentBufferedItems])

  if (numItems > 0 || isOnboarding) {
    return (
      <Fragment>
        <SwipeableViews
          emitter={emitterRef.current}
          index={index === 0 ? 0 : 1}
          items={currentBufferedItems}
          isOnboarding={isOnboarding}
          navigation={navigation}
          orientation={orientation}
          setPanAnim={handleSetPanAnim}
          setScrollAnim={setScrollAnim}
          onScrollEnd={handleOnScrollEnd}
          onTextSelection={onTextSelection}
          updateCarouselIndex={updateCarouselIndex}
        />
        {!isItemsOnboardingDone &&
          !isOnboarding &&
          numItems > 0 &&
          <ItemsScreenOnboarding />}
        <TopBars
          emitter={emitterRef.current}
          index={index}
          initialBufferIndex={bufferIndexRef.current}
          items={currentBufferedItems}
          panAnim={panAnim}
          setClampedScrollAnimSetterAndListener={setClampedScrollAnimSetterAndListener}
          setScrollAnimSetterAndListener={setScrollAnimSetterAndListener}
          setBufferIndexChangeListener={setBufferIndexChangeListener}
        />
        <ButtonsContainer
          bufferStartIndex={index === 0 ? index : index - 1}
          bufferedItems={currentBufferedItems}
          panAnim={panAnim}
        />
      </Fragment>
    )
  } else {
    return <EmptyCarousel
      displayMode={displayMode}
      navigation={navigation}
    />
  }
}

export default ItemCarousel
