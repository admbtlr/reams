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
import { constant, checkIndexBounds, getDisplaySameSlide } from 'react-swipeable-views-core';
import { panHandler } from '../utils/animationHandlers'
import { getItemId } from '../utils/get-item'
import { hslString } from '../utils/colors'

class SwipeableViews extends Component {
  static whyDidYouRender = true
  constructor (props) {
    super(props)
    this.props = props
    this.state = {}
    this.panOffset = new Animated.Value(0)
    this.timerFunctions = {}
    if (!this.props.isOnboarding) {
      this.updatePanHandler(this.calculateIndexVirtual(this.props.index))
    }

    this.onMomentumScrollEnd = this.onMomentumScrollEnd.bind(this)
    this.onScrollEndDrag = this.onScrollEndDrag.bind(this)
    this.setScrollIndex = this.setScrollIndex.bind(this)

    this.screenWidth = Dimensions.get('window').width
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (!this.children || !nextProps.index || !nextProps.items) return true

    // check current and upcoming item ids and see if they're different
    // TODO refactor so that this doesn't need items in its props
    const { index, items } = this.props
    // index is usually updated in calls to setState(), but if the
    // items change, it will be updated in the props that come from
    // the ItemCarousel
    const nextIndex = nextProps.index !== index ?
      nextProps.index :
      nextState.index
    const nextItems = nextProps.items
    const currentIds = this.children.map(child => child && child.key).filter(child => child !== undefined)
    const nextIds = this.getChildIds(nextIndex, nextItems).map(child => child._id)
    const yesNo = !(JSON.stringify(currentIds) === JSON.stringify(nextIds)) ? 'Yes' : 'No'
    console.log(`Should SwipeableViews render? ${yesNo}`)

    return !(JSON.stringify(currentIds) === JSON.stringify(nextIds))
  }

  static getDerivedStateFromProps (props, state) {
    const { index, updateTimestamp, virtualBuffer } = props
    // the updateTimestamp means that we got a new set of props
    // (cumbersome as hell, but I need to know if this render was
    // triggered by the parent sending in some props)
    if (updateTimestamp === state.lastUpdateTimestamp) return null
    const indexVirtual = index === 0 ?
      0 :
      1
    return (index !== state.index || indexVirtual !== state.indexVirtual) ?
      {
        index,
        indexVirtual,
        lastUpdateTimestamp: updateTimestamp
      } :
      {
        index: state.index,
        indexVirtual: state.indexVirtual,
        lastUpdateTimestamp: updateTimestamp
      }
  }

  calculateIndexVirtual (index) {
    const {virtualBuffer} = this.props
    return index === 0 ?
      0 :
      1
  }

  updateIndexVirtual (indexVirtualNew) {
    const {onChangeIndex, virtualBuffer} = this.props
    const {indexVirtual} = this.state
    const indexDelta = indexVirtualNew - this.currentIndexVirtual
    if (indexDelta !== 0) {
      const indexNew = Math.round(this.currentIndex + indexDelta)
      // the if is here because of a race condition where the functions are cleared before we get here
      // if (this.startTimer[indexNew]) {
      //   this.startTimer[indexNew]()
      // } else {
      //   debugger
      // }
      const child = this.children[indexVirtualNew]
      // let the fade in animation happen...
      child && this.timerFunctions[child.key] && this.timerFunctions[child.key]()
      onChangeIndex(indexNew, this.currentIndex || 0)
      this.currentIndex = indexNew
      this.currentIndexVirtual = indexVirtualNew
      this.updatePanHandler(indexVirtualNew)
      // setTimeout(() => {
      if (indexVirtualNew ===  indexVirtual + virtualBuffer ||
        indexVirtualNew === indexVirtual - 1) {
        this.setState({
          index: indexNew,
          indexVirtual: this.calculateIndexVirtual(indexNew)
        })
      }
    }
  }

  onScrollEndDrag (evt) {
    const targetOffset = evt.nativeEvent.targetContentOffset.x
    this.currentOffset = targetOffset
    const indexVirtualNew = this.currentOffset / this.screenWidth
    this.updateIndexVirtual(indexVirtualNew)
  }

  onMomentumScrollEnd (evt) {
    console.log('ON SCROLL END')
    this.currentOffset = evt.nativeEvent.contentOffset.x
    const indexVirtualNew = this.currentOffset / this.screenWidth
    this.updateIndexVirtual(indexVirtualNew)
  }

  getChildIds (index) {
    const {
      items,
      slideCount,
      virtualBuffer
    } = this.props
    // we only go back by one, but forward by virtual buffer
    // (this might be a problem for saved items, hmmm...)
    let indexStart = index === 0 ? 0 : index - 1
    let indexEnd = index + virtualBuffer > slideCount - 1 ?
      slideCount - 1 :
      index + virtualBuffer
    let childIds = []

    for (let slideIndex = indexStart; slideIndex <= indexEnd; slideIndex += 1) {
      const _id = (items && items[slideIndex]) ? items[slideIndex]._id : getItemId(undefined, slideIndex)
      childIds.push({
        index: slideIndex,
        _id,
        key: _id
      })
    }

    return childIds
  }

  // componentDidMount() {
  //   const indexVirtual = this.calculateIndexVirtual(this.state.index)
  //   this.scrollToItem(indexVirtual)
  //   this.updatePanHandler(indexVirtual)
  // }

  componentDidUpdate (prevProps, prevState) {
    this.setScrollIndex()
  }

  setScrollIndex () {
    const indexVirtual = this.calculateIndexVirtual(this.state.index)
    const x = (indexVirtual) * this.screenWidth
    // debugger
    if (this.scrollView && this.scrollView._component) {
      this.scrollView._component.scrollTo({
        x,
        y: 0,
        animated: false
      })
    }
    if (!this.props.isOnboarding) {
      this.updatePanHandler(indexVirtual)
    }
  }

  updatePanHandler (indexVirtual) {
    const panAnimValue = Animated.subtract(this.panOffset, this.screenWidth * (indexVirtual - 1))
    this.props.setPanAnim(panAnimValue)
    panHandler(panAnimValue, this.screenWidth)
  }


  // componentDidUpdate() {
  //   this.updatePanHandler(this.state.indexVirtual)
  // }

  render () {
    console.log('RENDER SWIPEABLE VIEWS')
    const {
      slideRenderer,
      hysteresis, // eslint-disable-line no-unused-vars
      onTransitionEnd, // eslint-disable-line no-unused-vars
      virtualBuffer, // eslint-disable-line no-unused-vars
      ...other
    } = this.props

    const {
      index,
      indexVirtual
    } = this.state

    this.currentIndex = index
    this.currentIndexVirtual = indexVirtual

    const pageWidth = Dimensions.get('window').width

    this.prevChildren = this.children
    this.children = []

    this.children = this.getChildIds(index).map(child => slideRenderer({
      index: child.index,
      key: child._id,
      _id: child._id,
      setTimerFunction: timerFunc => {
        this.timerFunctions[child._id] = timerFunc
      },
      // isVisible: child.index === index
    }))

    // if (this.prevChildren) {
    //   let child, prevChild
    //   for (var i = 0; i < this.children.length; i++) {
    //     child = this.children[i]
    //     for (var j = 0; j < this.prevChildren.length; j++) {
    //       prevChild = this.prevChildren[j]
    //       if (child.key === prevChild.key) {
    //         this.children[i] === prevChild
    //       }
    //     }
    //   }
    // }

    this.currentOffset = indexVirtual * pageWidth

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
