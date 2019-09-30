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
  constructor (props) {
    super(props)
    this.props = props
    this.state = {}
    this.panOffset = new Animated.Value(0)
    if (!this.props.isOnboarding) {
      panHandler(this.panOffset, Dimensions.get('window').width)
    }

    this.onScrollEnd = this.onScrollEnd.bind(this)
  }

  componentDidMount () {
    this.initialiseState(this.props.index)
  }

  componentDidUpdate (prevProps) {
    if (this.props !== prevProps) {
      this.initialiseState(this.props.index)
    }
    this.scrollToItem()
    if (!this.props.isOnboarding) {
      panHandler(this.panOffset, Dimensions.get('window').width)
    }
  }

  initialiseState (index) {
    const indexVirtual = this.calculateIndexVirtual(index)

    if (index !== this.state.index ||
      indexVirtual !== this.state.indexVirtual) {
      this.setState({
        index,
        indexVirtual
      })
    }
  }

  calculateIndexVirtual = (index) => {
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

  onScrollEnd (evt) {
    const offsetNew = evt.nativeEvent.contentOffset.x
    let indexVirtualNew = offsetNew / Dimensions.get('window').width
    const indexDelta = indexVirtualNew - this.state.indexVirtual
    if (indexDelta !== 0) {
      const indexOld = this.state.index
      const indexNew = Math.round(indexOld + indexDelta)
      // the if is here because of a race condition where the functions are cleared before we get here
      if (this.startTimer[indexNew]) this.startTimer[indexNew]()
      // let the fade in animation happen...
      setTimeout(() => {
        this.props.onChangeIndex(indexNew, indexOld)
        this.setState({
          index: indexNew,
          indexVirtual: this.calculateIndexVirtual(indexNew)
        })
      }, 250)
    }
  }

  render() {
    const {
      slideCount,
      style,
      slideStyle,
      slideRenderer,
      containerStyle,
      disabled,
      hysteresis, // eslint-disable-line no-unused-vars
      // index, // eslint-disable-line no-unused-vars
      onTransitionEnd, // eslint-disable-line no-unused-vars
      virtualBuffer, // eslint-disable-line no-unused-vars
      ...other
    } = this.props;

    const {
      indexVirtual,
      index
    } = this.state;

    const pageWidth = Dimensions.get('window').width

    let indexStart = index - virtualBuffer
    indexStart = indexStart < 0 ? 0 : indexStart
    let indexEnd = index + virtualBuffer
    indexEnd = indexEnd > slideCount - 1 ? slideCount - 1 : indexEnd

    this.prevChildren = this.children
    this.children = []
    this.startTimer = []

    for (let slideIndex = indexStart; slideIndex <= indexEnd; slideIndex += 1) {
      this.children.push(slideRenderer({
        index: slideIndex,
        key: getItemId(undefined, slideIndex),
        setTimerFunction: timerFunc => this.startTimer[slideIndex] = timerFunc,
        isVisible: slideIndex === index
      }))
    }

    if (this.prevChildren) {
      for (child in this.children) {
        for (prevChild in this.prevChildren) {
          if (child.key === prevChild.key) {
            child = prevChild
          }
        }
      }
    }

    return (
      <Animated.ScrollView
        bounces={false}
        decelerationRate="fast"
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
        snapToEnd={true}
        snapToInterval={pageWidth}
        snapToStart={true}
        style={{
          flex: 1,
          flexDirection: 'row',
          height: Dimensions.get('window').height,
          backgroundColor: hslString('bodyBGLight')
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
