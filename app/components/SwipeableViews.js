import React, { Component } from 'react'
import {
  Animated,
  Dimensions,
} from 'react-native'
import FeedItemContainer from '../containers/FeedItem.js'
import OnboardingContainer from '../containers/Onboarding.js'
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

    this.onMomentumScrollEnd = this.onMomentumScrollEnd.bind(this)
    this.onScrollEndDrag = this.onScrollEndDrag.bind(this)
    this.setScrollIndex = this.setScrollIndex.bind(this)
    this.init = this.init.bind(this)

    this.screenWidth = Dimensions.get('window').width
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (!this.props.items || !nextProps.items) return true
    return JSON.stringify(this.props.items.map(item => item._id)) !==
      JSON.stringify(nextProps.items.map(item => item._id))
  }

  updateIndex (newIndex) {
    const {updateCarouselIndex} = this.props
    const indexDelta = newIndex - this.currentIndex
    if (indexDelta !== 0) {
      updateCarouselIndex(newIndex)
      this.currentIndex = newIndex
    }
  }

  onScrollEndDrag (evt) {
    this.currentOffset = evt.nativeEvent.targetContentOffset.x
    const newIndex = Math.round(this.currentOffset / this.screenWidth)
    this.updateIndex(newIndex)
  }

  onMomentumScrollEnd (evt) {
    this.currentOffset = evt.nativeEvent.contentOffset.x
    const newIndex = Math.round(this.currentOffset / this.screenWidth)
    this.updateIndex(newIndex)
  }

  init() {
    this.setScrollIndex(this.currentIndex)
    this.props.setPanAnim(this.panOffset)
  }

  componentDidUpdate (prevProps, prevState) {
    this.init()
  }

  setScrollIndex (index) {
    const x = index * this.screenWidth
    if (this.scrollView) {
      this.scrollView.scrollTo({
        x,
        y: 0,
        animated: false
      })
    }
  }

  renderSlide ({_id, index, isVisible, panAnim}) {
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
        setScrollAnim={this.props.setScrollAnim}
        onScrollEnd={this.props.onScrollEnd}
        onTextSelection={this.props.onTextSelection}
        isVisible={isVisible}
        panAnim={panAnim}
        renderDate={Date.now()} // make sure child components get re-rendered
      />
    }
  }

  render () {
    console.log('RENDER SWIPEABLE VIEWS')
    const {
      index,
      isOnboarding,
      items,
      navigation
    } = this.props

    const pageWidth = Dimensions.get('window').width
    // this.panAnimValues = items.map((item, key) => )

    if (isOnboarding) {
      this.children = [0, 1, 2].map(index => (
        <OnboardingContainer
          key={index}
          index={index}
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

    this.currentIndex = index
    this.currentOffset = this.currentIndex * pageWidth

    // console.log(items.map(i => i.title))

    return (
      <Animated.ScrollView
        bounces={false}
        decelerationRate="fast"
        disableIntervalMomentum={true}
        horizontal
        onLayout={this.init}
        onMomentumScrollEnd={this.onMomentumScrollEnd}
        onScroll={Animated.event(
          [{ nativeEvent: {
            contentOffset: { x: this.panOffset }
          }}],
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
        { this.children }
      </Animated.ScrollView>
    )
  }
}

export default SwipeableViews;
