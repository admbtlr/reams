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

// a kind of memoisation, but not for performance reasons
// persisting the buffered items makes it easier to decorate
// them with clampedScrollAnims
// let bufferedItems

// const getBufferedItems = (items, index, displayMode, feeds) => {
//   const bufferStart = index === 0 ? index : index - 1
//   const bufferEnd = index + BUFFER_LENGTH > items.length - 1 ?
//     items.length :
//     index + BUFFER_LENGTH + 1
//   const buffered = items.slice(bufferStart, bufferEnd)
//   const mapItem = item => ({
//     _id: item._id,
//     isDecorated: item.isDecorated
//   })
//   if (!bufferedItems || JSON.stringify(buffered.map(mapItem)) !==
//     JSON.stringify(bufferedItems.map(mapItem))) {
//     bufferedItems = buffered
//   }
//   if (displayMode === ItemType.saved) {
//     return bufferedItems
//   } else {
//     return bufferedItems.map(bi => {
//       const feed = feeds && feeds.length > 0 && feeds.find(f => f._id === bi.feed_id)
//       return {
//         ...bi,
//         isFeedMercury: feed && feed.isMercury
//       }
//     })
//   }
// }


class ItemCarousel extends React.Component {

  emitter: Emitter

  constructor(props) {
    super(props)
    this.props = props

    // this.index = -1,
    //   this.items = []
    // this.bufferIndex = -1
    this.selectedText = undefined

    // this.state = {
    //   panAnim: new Animated.Value(0)
    // }

    this.emitter = new Emitter()

    // this.updateCarouselIndex = this.updateCarouselIndex.bind(this)
    this.onTextSelection = this.onTextSelection.bind(this)
    this.updateIndex = this.updateIndex.bind(this)
  }

  // _stringifyBufferedItems(items, index, displayMode, feeds, includeMercury = false) {
  //   return JSON
  //     .stringify(getBufferedItems(items, index, displayMode, feeds)
  //       .map(item => includeMercury ? {
  //         _id: item._id,
  //         isDecorated: item.isDecorated
  //       } : item._id))
  // }


  // initIndex() {
  //   this.index = this.initialIndex = this.props.index
  //   this.bufferIndex = this.index === 0 ? 0 : 1
  // }

  updateIndex(index) {
    const lastIndex = this.index
    this.index = index
    this.selectedText = undefined
    this.props.updateCurrentIndex(index, lastIndex, this.props.displayMode, this.props.isOnboarding)
  }

  onScrollEnd(scrollOffset) {
    // console.log('Scroll end')
    onScrollEnd(scrollOffset)
    // const item = bufferedItems.find(bi => bi._id === item_id)
    // if (item) {
    //   item.scrollManager.onScrollEnd(scrollOffset)
    // }
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
      // this.initIndex()

      // this.bufferedItems = getBufferedItems(items, index, displayMode, feeds)

      // do something with setPanAnim on the ToolbarContainer
      return (
        <AnimationProvider>
          <BufferedItemsProvider>
            <SwipeableViews
              emitter={this.emitter}
              isOnboarding={isOnboarding}
              onScrollEnd={this.onScrollEnd}
              onTextSelection={this.onTextSelection}
              updateIndex={this.updateIndex}
            />
            {/* {!isItemsOnboardingDone &&
              !isOnboarding &&
              numItems > 0 &&
              <ItemsScreenOnboarding />} */}
            <TopBars
              emitter={this.emitter}
            />
            <ButtonSets isOnboarding={isOnboarding} />
          </BufferedItemsProvider>
        </AnimationProvider>
      )
    } else {
      return (
        <AnimationProvider>
          <EmptyCarousel
            displayMode={displayMode}
            navigation={navigation}
            toggleDisplayMode={toggleDisplayMode}
          />
        </AnimationProvider>
      )
    }
  }
}

export default ItemCarousel
