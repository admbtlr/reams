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

    this.onScrollEnd = this.onScrollEnd.bind(this)

    this.screenWidth = Dimensions.get('window').width
  }

  componentDidUpdate (prevProps, prevState) {
    this.scrollToItem()
    if (!this.props.isOnboarding) {
      this.updatePanHandler(this.calculateIndexVirtual(this.state.index))
    }
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
    const currentIds = this.children.map(child => child.key)
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
    const indexVirtual = index < virtualBuffer ?
      index :
      virtualBuffer
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
    return index < virtualBuffer ?
      index :
      virtualBuffer
  }

  scrollToItem () {
    const pageWidth = Dimensions.get('window').width
    const initialVirtualIndex = this.state.index === 0 ? 0 : 1
    const x = (this.state.indexVirtual || initialVirtualIndex) * pageWidth
    // debugger
    this.scrollView && this.scrollView._component && this.scrollView._component.scrollTo({
      x,
      y: 0,
      animated: false
    })
  }

  updatePanHandler (indexVirtualNew) {
    const panAnimValue = Animated.subtract(this.panOffset, this.screenWidth * (indexVirtualNew - 1))
    panHandler(panAnimValue, this.screenWidth)
  }

  onScrollEnd (evt) {
    console.log('ON SCROLL END')
    const {onChangeIndex, virtualBuffer} = this.props
    const {indexVirtual} = this.state
    const offsetNew = evt.nativeEvent.contentOffset.x
    let indexVirtualNew = offsetNew / Dimensions.get('window').width
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
        indexVirtualNew === indexVirtual - virtualBuffer) {
        this.setState({
          index: indexNew,
          indexVirtual: this.calculateIndexVirtual(indexNew)
        })
      }
      // }, 250)
    }
  }

  getChildIds (index, items) {
    const {
      slideCount,
      virtualBuffer
    } = this.props
    let indexStart = index - virtualBuffer
    indexStart = indexStart < 0 ? 0 : indexStart
    let indexEnd = index + virtualBuffer
    indexEnd = indexEnd > slideCount - 1 ? slideCount - 1 : indexEnd
    let childIds = []

    for (let slideIndex = indexStart; slideIndex <= indexEnd; slideIndex += 1) {
      const _id = items ? items[slideIndex]._id : getItemId(undefined, slideIndex)
      childIds.push({
        index: slideIndex,
        _id,
        key: _id
      })
    }

    return childIds
  }

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

    if (this.prevChildren) {
      for (child in this.children) {
        for (prevChild in this.prevChildren) {
          if (child._id === prevChild._id) {
            child = prevChild
          }
        }
      }
    }

    return (
      <Animated.ScrollView
        bounces={false}
        decelerationRate="fast"
        disableIntervalMomentum={true}
        horizontal
        onLayout={this.scrollToItem.bind(this)}
        onMomentumScrollEnd={this.onScrollEnd.bind(this)}
        onScroll={Animated.event(
          [{ nativeEvent: {
            contentOffset: { x: this.panOffset }
          }}],
          { useNativeDriver: true }
        )}
        overscroll='never'
        ref={(ref) => { this.scrollView = ref }}
        scrollEventThrottle={1}
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
