import React, { Component, Children } from 'react'
import {
  Animated,
  Dimensions,
  InteractionManager,
  PanResponder,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import FeedItemContainer from '../containers/FeedItem.js'
import OnboardingContainer from '../containers/Onboarding.js'
import { constant, checkIndexBounds, getDisplaySameSlide } from 'react-swipeable-views-core';
import { panHandler } from '../utils/animationHandlers'
import { getItemId } from '../utils/get-item'
import { hslString } from '../utils/colors'

/*
props = {
  decrementIndex,
  incrementIndex,
  isOnboarding(?),
  items,
  setPanAnim
}

state = {
  index
}
*/

// NB `index` in this component is always the virtual index

class SwipeableViews extends Component {
  static whyDidYouRender = true
  constructor (props) {
    super(props)
    this.props = props
    this.panOffset = new Animated.Value(0)
    this.timerFunctions = {}
    // if (!this.props.isOnboarding) {
    //   this.updatePanHandler(this.props.index)
    // }

    this.onMomentumScrollEnd = this.onMomentumScrollEnd.bind(this)
    this.onScrollEndDrag = this.onScrollEndDrag.bind(this)
    this.setScrollIndex = this.setScrollIndex.bind(this)

    this.screenWidth = Dimensions.get('window').width
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (!this.props.items || !nextProps.items) return true
    return JSON.stringify(this.props.items.map(item => item._id)) !==
      JSON.stringify(nextProps.items.map(item => item._id))
  }

  //   // check current and upcoming item ids and see if they're different
  //   // TODO refactor so that this doesn't need items in its props
  //   const { index } = this.props
  //   // index is usually updated in calls to setState(), but if the
  //   // items change, it will be updated in the props that come from
  //   // the ItemCarousel
  //   const nextIndex = nextProps.index !== index ?
  //     nextProps.index :
  //     nextState.index
  //   const currentIds = this.children.map(child => child && child.key).filter(child => child !== undefined)
  //   const nextIds = this.getChildIds(nextIndex, nextItems).map(child => child._id)
  //   const yesNo = !(JSON.stringify(currentIds) === JSON.stringify(nextIds)) ? 'Yes' : 'No'
  //   console.log(`Should SwipeableViews render? ${yesNo}`)

  //   return !(JSON.stringify(currentIds) === JSON.stringify(nextIds))
  // }

  // static getDerivedStateFromProps (props, state) {
  //   const { index, updateTimestamp, virtualBuffer } = props
  //   // the updateTimestamp means that we got a new set of props
  //   // (cumbersome as hell, but I need to know if this render was
  //   // triggered by the parent sending in some props)
  //   if (updateTimestamp === state.lastUpdateTimestamp) return null
  //   const indexVirtual = index === 0 ?
  //     0 :
  //     1
  //   return (index !== state.index || indexVirtual !== state.indexVirtual) ?
  //     {
  //       index,
  //       indexVirtual,
  //       lastUpdateTimestamp: updateTimestamp
  //     } :
  //     {
  //       index: state.index,
  //       indexVirtual: state.indexVirtual,
  //       lastUpdateTimestamp: updateTimestamp
  //     }
  // }

  // calculateIndexVirtual (index) {
  //   const {virtualBuffer} = this.props
  //   return index === 0 ?
  //     0 :
  //     1
  // }

  updateIndex (newIndex) {
    const {decrementIndex, incrementIndex} = this.props
    const indexDelta = newIndex - this.currentIndex
    if (indexDelta !== 0) {
      const child = this.children[newIndex]
      // let the fade in animation happen...
      child && this.timerFunctions[child.key] && this.timerFunctions[child.key]()
      if (indexDelta > 0) {
        incrementIndex()
      } else {
        decrementIndex()
      }
      this.currentIndex = newIndex
      // this.updatePanHandler(newIndex)
      // setTimeout(() => {
      // if (newIndex ===  indexVirtual + virtualBuffer ||
      //   newIndex === indexVirtual - 1) {
      //   this.setState({
      //     index: newInd,
      //     indexVirtual: this.calculateIndexVirtual(indexNew)
      //   })
      // }
    }
  }

  onScrollEndDrag (evt) {
    this.currentOffset = evt.nativeEvent.targetContentOffset.x
    const newIndex = this.currentOffset / this.screenWidth
    this.updateIndex(newIndex)
  }

  onMomentumScrollEnd (evt) {
    this.currentOffset = evt.nativeEvent.contentOffset.x
    const newIndex = this.currentOffset / this.screenWidth
    this.updateIndex(newIndex)
  }

  // getChildIds (index) {
  //   const {
  //     // items,
  //     slideCount,
  //     virtualBuffer
  //   } = this.props
  //   // we only go back by one, but forward by virtual buffer
  //   // (this might be a problem for saved items, hmmm...)
  //   let indexStart = index === 0 ? 0 : index - 1
  //   let indexEnd = index + virtualBuffer > slideCount - 1 ?
  //     slideCount - 1 :
  //     index + virtualBuffer
  //   let childIds = []

  //   for (let slideIndex = indexStart; slideIndex <= indexEnd; slideIndex += 1) {
  //     // const _id = (items && items[slideIndex]) ? items[slideIndex]._id : getItemId(undefined, slideIndex)
  //     const _id = getItemId(undefined, slideIndex)
  //     childIds.push({
  //       index: slideIndex,
  //       _id,
  //       key: _id
  //     })
  //   }

  //   return childIds
  // }

  // componentDidMount() {
  //   const indexVirtual = this.calculateIndexVirtual(this.state.index)
  //   this.scrollToItem(indexVirtual)
  //   this.updatePanHandler(indexVirtual)
  // }

  componentDidUpdate (prevProps, prevState) {
    this.setScrollIndex(this.currentIndex)
    this.props.setPanAnim(this.panOffset)
  }

  setScrollIndex (index) {
    const x = index * this.screenWidth
    // debugger
    if (this.scrollView && this.scrollView._component) {
      this.scrollView._component.scrollTo({
        x,
        y: 0,
        animated: false
      })
    }
    // if (!this.props.isOnboarding) {
    //   this.updatePanHandler(index)
    // }
  }

  // updatePanHandler (index) {
  //   const panAnimValue = Animated.subtract(this.panOffset, this.screenWidth * (index - 1))
  //   this.props.setPanAnim(panAnimValue)
  //   panHandler(panAnimValue, this.screenWidth)
  // }


  // componentDidUpdate() {
  //   this.updatePanHandler(this.state.indexVirtual)
  // }

  renderSlide ({_id, index, setTimerFunction, isVisible}) {
    if (this.props.isOnboarding) {
      return <OnboardingContainer
        index={index}
        key={index}
        navigation={this.props.navigation}
      />
    } else {
      return <FeedItemContainer
        _id={_id}
        key={_id}
        setTimerFunction={setTimerFunction}
        setScrollAnim={this.props.setScrollAnim}
        onScrollEnd={this.props.onScrollEnd}
        isVisible={isVisible}
      />
    }
  }

  render () {
    console.log('RENDER SWIPEABLE VIEWS')
    const {
      index,
      items
    } = this.props

    const pageWidth = Dimensions.get('window').width

    this.children = items.map((item, itemIndex) => this.renderSlide({
      index: item.index,
      key: item._id,
      _id: item._id,
      setTimerFunction: timerFunc => {
        this.timerFunctions[item._id] = timerFunc
      },
      isVisible: itemIndex === index
    }))

    this.currentIndex = index
    this.currentOffset = this.currentIndex * pageWidth

    return (
      <Animated.ScrollView
        bounces={false}
        decelerationRate="fast"
        disableIntervalMomentum={true}
        horizontal
        onLayout={this.setScrollIndex}
        onMomentumScrollEnd={this.onMomentumScrollEnd}
        onScroll={Animated.event(
          [{ nativeEvent: {
            contentOffset: { x: this.panOffset }
          }}],
          { useNativeDriver: true }
        )}
        // onScrollEndDrag={this.onScrollEndDrag}
        overscroll='never'
        // pagingEnabled={true}
        ref={(ref) => { this.scrollView = ref }}
        scrollEventThrottle={1}
        scrollToOverflowEnabled={true}
        showsHorizontalScrollIndicator={false}
        snapToEnd={true}
        snapToInterval={pageWidth}
        snapToStart={true}
        style={{
          flex: 1,
          flexDirection: 'row',
          height: Dimensions.get('window').height,
          backgroundColor: hslString('bodyBG')
          // overflow: 'hidden',
          // width: Dimensions.get('window').width * 5
        }}
      >
        { this.children }
      </Animated.ScrollView>
    )
  }
}

export default SwipeableViews;
