import { ItemType, Item } from '@/store/items/types'
import React, { Fragment } from 'react'
import ItemsScreenOnboarding from '@/components/ItemsScreenOnboarding'
import {
  Animated
} from 'react-native'
import TopBars from './TopBars'
import { getClampedScrollAnim, onScrollEnd, setClampedScrollListener, setScrollListener } from '@/utils/animation-handlers'
import EmptyCarousel from './EmptyCarousel'
import SwipeableViews from './SwipeableViews'
import ButtonSets from './ButtonSets'
import Emitter from './Emitter'

import { BUFFER_LENGTH } from './constants'

export { BUFFER_LENGTH }

class ItemCarousel extends React.Component {

  currentItem: Item | undefined
  emitter: Emitter
  selectedText: string | undefined

  constructor(props) {
    super(props)
    this.props = props

    this.selectedText = undefined

    this.emitter = new Emitter()

    // this.updateCarouselIndex = this.updateCarouselIndex.bind(this)
    this.onTextSelection = this.onTextSelection.bind(this)
    // this.updateIndex = this.updateIndex.bind(this)
  }

  // updateIndex(index) {
  //   const lastIndex = this.index
  //   this.index = index
  //   this.selectedText = undefined
  //   this.props.updateCurrentIndex(index, lastIndex, this.props.displayMode, this.props.isOnboarding)
  // }

  updateCurrentItem(item: Item) {
    const prevItem = this.currentItem
    this.selectedText = undefined
    // this.props.updateCurrentItem(item, prevItem, this.props.displayMode, this.props.isOnboarding)
  }

  // onScrollEnd(scrollOffset) {
  //   onScrollEnd(scrollOffset)
  // }

  onTextSelection(selectedText) {
    this.selectedText = selectedText
  }

  render() {
    const {
      displayMode,
      isOnboarding,
      numItems
    } = this.props

    if (numItems > 0 || isOnboarding) {
      return (
        // <AnimationProvider>
        //   <BufferedItemsProvider>
        <>
          <SwipeableViews
            emitter={this.emitter}
            isOnboarding={isOnboarding}
            onScrollEnd={this.onScrollEnd}
            onTextSelection={this.onTextSelection}
          // updateIndex={this.updateIndex}
          />
          <TopBars
            emitter={this.emitter}
            isTitleOnly={false}
          />
          <ButtonSets isOnboarding={isOnboarding} />
        </>
        //   </BufferedItemsProvider>
        // </AnimationProvider>
      )
    } else {
      return (
        <EmptyCarousel
          displayMode={displayMode}
          navigation={navigation}
        />
      )
    }
  }
}

export default ItemCarousel
