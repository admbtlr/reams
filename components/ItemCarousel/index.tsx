import { ItemType, Item } from '@/store/items/types'
import React, { Fragment } from 'react'
import ItemsScreenOnboarding from '@/components/ItemsScreenOnboarding'
import {
  Animated
} from 'react-native'
import TopBars from './TopBars'
import { getClampedScrollAnim, onScrollEnd, setClampedScrollListener, setScrollListener } from '@/utils/animation-handlers'
import EmptyCarousel from './EmptyCarousel'
import { AnimationProvider } from './AnimationContext'
import { BufferedItemsProvider } from './BufferedItemsContext'
import SwipeableViews from './SwipeableViews'
import ButtonSets from './ButtonSets'
import Emitter from './Emitter'

export const BUFFER_LENGTH = 5

class ItemCarousel extends React.Component {

  emitter: Emitter

  constructor(props) {
    super(props)
    this.props = props

    this.selectedText = undefined

    this.emitter = new Emitter()

    // this.updateCarouselIndex = this.updateCarouselIndex.bind(this)
    this.onTextSelection = this.onTextSelection.bind(this)
    this.updateIndex = this.updateIndex.bind(this)
  }

  updateIndex(index) {
    const lastIndex = this.index
    this.index = index
    this.selectedText = undefined
    this.props.updateCurrentIndex(index, lastIndex, this.props.displayMode, this.props.isOnboarding)
  }

  onScrollEnd(scrollOffset) {
    onScrollEnd(scrollOffset)
  }

  onTextSelection(selectedText) {
    this.selectedText = selectedText
  }

  render() {
    const {
      displayMode,
      isOnboarding,
      numItems,
      toggleDisplayMode,
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
            updateIndex={this.updateIndex}
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
        <AnimationProvider>
          <EmptyCarousel
            displayMode={displayMode}
            navigation={navigation}
          />
        </AnimationProvider>
      )
    }
  }
}

export default ItemCarousel
