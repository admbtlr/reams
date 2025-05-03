import React, { Component } from 'react'
import {
  Animated,
  Dimensions,
  Platform,
} from 'react-native'
import FeedItemContainer from '../containers/FeedItem.js'
import Onboarding from './onboarding/Onboarding'
import { hslString } from '../utils/colors'
import { SessionContext } from './AuthProvider'

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
  static contextType = SessionContext

  constructor(props) {
    super(props)
    this.props = props
    this.panOffset = new Animated.Value(0)

    this.onMomentumScrollEnd = this.onMomentumScrollEnd.bind(this)
    this.onScrollEndDrag = this.onScrollEndDrag.bind(this)
    this.setScrollIndex = this.setScrollIndex.bind(this)
    this.init = this.init.bind(this)

    this.screenWidth = Dimensions.get('window').width
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!this.props.items || !nextProps.items) return true
    if (this.props.orientation !== nextProps.orientation) return true
    return JSON.stringify(this.props.items.map(item => item._id)) !==
      JSON.stringify(nextProps.items.map(item => item._id))
  }

  updateIndex(newIndex) {
    const { updateCarouselIndex } = this.props
    const indexDelta = newIndex - this.currentIndex
    if (indexDelta !== 0) {
      updateCarouselIndex(newIndex)
      this.currentIndex = newIndex
    }
  }

  onScrollEndDrag(evt) {
    this.currentOffset = evt.nativeEvent.targetContentOffset.x
    const newIndex = Math.round(this.currentOffset / this.screenWidth)
    this.updateIndex(newIndex)
  }

  onMomentumScrollEnd(evt) {
    this.currentOffset = evt.nativeEvent.contentOffset.x
    const newIndex = Math.round(this.currentOffset / this.screenWidth)
    this.updateIndex(newIndex)
  }

  init() {
    const that = this
    // setTimeout(() => {
    that.setScrollIndex(that.currentIndex)
    that.props.setPanAnim(that.panOffset)
    // }, 1000)
  }

  componentDidUpdate(prevProps, prevState) {
    this.init()
  }

  setScrollIndex(index) {
    const x = index * this.screenWidth
    if (this.scrollView) {
      this.scrollView.scrollTo({
        x,
        y: 0,
        animated: false
      })
    }
  }

  renderSlide = ({ _id, index, isVisible, panAnim }) => (
    <FeedItemContainer
      _id={_id}
      emitter={this.props.emitter}
      key={_id}
      setScrollAnim={this.props.setScrollAnim}
      onScrollEnd={this.props.onScrollEnd}
      onTextSelection={this.props.onTextSelection}
      isVisible={isVisible}
      panAnim={panAnim}
      renderDate={Date.now()} // make sure child components get re-rendered
    />
  )

  render() {
    console.log('RENDER SWIPEABLE VIEWS')
    const {
      index,
      isOnboarding,
      items,
      navigation
    } = this.props

    this.screenWidth = Dimensions.get('window').width
    const pageWidth = this.screenWidth
    // this.panAnimValues = items.map((item, key) => )
    const currentIndex = this.currentIndex = index

    if (isOnboarding) {
      // crazy that this logic is here
      // 3 pages before login, 2 after
      let pages = []
      if (this.context?.session?.user) {
        pages = [3, 4]
      } else {
        pages = [0, 1, 2]
      }
      this.children = pages.map((page, index) => (
        <Onboarding
          key={page}
          index={page}
          isVisible={currentIndex === index}
          navigation={navigation} />
      ))
    } else {
      this.children = items.map((item, itemIndex, items) => {
        let inputRange = [pageWidth * itemIndex, pageWidth * (itemIndex + 1), pageWidth * items.length]
        let outputRange = [1, 0, 1]
        if (itemIndex > 0) {
          inputRange = [0, pageWidth * (itemIndex - 1)].concat(inputRange)
          outputRange = [2, 2].concat(outputRange)
        }
        return this.renderSlide({
          index: item.index,
          key: item._id,
          _id: item._id,
          isVisible: itemIndex === index,
          panAnim: this.panOffset.interpolate({
            inputRange, outputRange
          })
        })
      })
    }

    this.currentOffset = this.currentIndex * pageWidth

    // console.log(items.map(i => i.title))

    return (
      <Animated.ScrollView
        bounces={false}
        contentInset={{ top: 0, left: 0, bottom: 0, right: 0 }}
        // contentOffset={{ x: 500, y: 0 }}
        decelerationRate={Platform.os === 'ios' ? 'fast' : 0.9}
        disableIntervalMomentum={true}
        disableScrollViewPanResponder={Platform.OS === 'android'}
        horizontal
        keyboardShouldPersistTaps='handled'
        onLayout={this.init}
        onMomentumScrollEnd={this.onMomentumScrollEnd}
        onScroll={Animated.event(
          [{
            nativeEvent: {
              contentOffset: { x: this.panOffset }
            }
          }],
          { useNativeDriver: true }
        )}
        overscroll='never'
        ref={(ref) => { this.scrollView = ref }}
        scrollEventThrottle={0.1}
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
        }}
      >
        {this.children}
      </Animated.ScrollView>
    )
  }
}

export default SwipeableViews;
