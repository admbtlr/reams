import React from 'react'
import PropTypes from 'prop-types'
import {
  Dimensions,
} from 'react-native'
import ButtonSet from './ButtonSet'

class Buttons extends React.Component {

  constructor (props) {
    super(props)
    this.props = props

    this.screenDimensions = Dimensions.get('window')

    // this.startToggleAnimationMercury = this.startToggleAnimationMercury.bind(this)
    // this.startToggleAnimationSaved = this.startToggleAnimationSaved.bind(this)

    // this.state = {
    //   visibleAnim: new Animated.Value(1),
    //   toggleAnimMercury: new Animated.Value(0),
    //   toggleAnimSaved: new Animated.Value(0)
    // }
  }

  // componentDidUpdate (prevProps) {
  //   if (prevProps.visible !== this.props.visible ||
  //     this.props.visible !== this.areButtonsVisible) {
  //     this.makeVisible(this.props.visible)
  //   }

  //   if (this.props.currentItem &&
  //     (!prevProps.currentItem ||
  //       this.props.currentItem._id !== prevProps.currentItem._id)) {
  //     this.setState({
  //       toggleAnimSaved: new Animated.Value(this.props.currentItem.isSaved ? 1 : 0),
  //       toggleAnimMercury: new Animated.Value(this.props.currentItem.showMercuryContent ? 1 : 0)
  //     })
  //     this.isCurrentSaved = this.props.currentItem.isSaved ? 1 : 0
  //     this.isCurrentMercury = this.props.currentItem.showMercuryContent ? 1 : 0
  //   }
  // }

  shouldComponentUpdate (nextProps, nextState) {
    // include content_mercury to upate the buttons once the item has been decorated
    const mapFunc = item => ({
      _id: item._id,
      content_mercury: item.content_mercury
    })
    // return !(this.props.index === nextProps.index &&
    //   this.props.displayMode === nextProps.displayMode &&
    //   this.props.visible === nextProps.visible &&
    //   this.props.numItems === nextProps.numItems &&
    //   this.props.bufferedItems &&
    //   nextProps.bufferedItems &&
    //   JSON.stringify(this.props.bufferedItems.map(mapFunc)) ===
    //     JSON.stringify(nextProps.bufferedItems.map(mapFunc)))
    // debugger
    return true
  }

  render () {
    if (this.props.isOnboarding) {
      return null
    } else {
      const {
        index,
        bufferStartIndex,
        displayMode,
        isDarkMode,
        bufferedItems,
        panAnim,
        showDisplayButtons,
        showShareSheet,
        setSaved,
        launchBrowser,
        toggleMercury,
        toggleViewButtons,
        visible
      } = this.props
      this.screenDimensions = Dimensions.get('window')
      const panAnimDivisor = this.screenDimensions.width

      const opacityRanges = bufferedItems && bufferedItems.map((item, index) => {
        let inputRange = [panAnimDivisor * index, panAnimDivisor * (index + 1)]
        let outputRange = [1, 0]
        if (index > 0) {
          inputRange.unshift(panAnimDivisor * (index - 1))
          outputRange.unshift(0)
        }
        return { inputRange, outputRange }
      })
      // const opacityRanges = [
      //   {
      //     inputRange: [0, panAnimDivisor, panAnimDivisor * 2],
      //     outputRange: [1, 0, 0]
      //   }, {
      //     inputRange: [0, panAnimDivisor, panAnimDivisor * 2],
      //     outputRange: [0, 1, 0]
      //   }, {
      //     inputRange: [0, panAnimDivisor, panAnimDivisor * 2],
      //     outputRange: [0, 0, 1]
      //   }
      // ]
      const opacityAnims = bufferedItems && bufferedItems.map((item, i) => panAnim ?
          panAnim.interpolate(opacityRanges[i]) :
          1)

      return bufferedItems ?
        bufferedItems.map((item, i) => {
          const isCurrent = i === index - bufferStartIndex
          return item ?
            <ButtonSet
              item={item}
              key={'buttons:' + item._id}
              isCurrent={isCurrent}
              displayMode={displayMode}
              isDarkMode={isDarkMode}
              launchBrowser={launchBrowser}
              opacityAnim={opacityAnims[i]}
              showShareSheet={showShareSheet}
              toggleMercury={toggleMercury}
              setSaved={setSaved}
              toggleViewButtons={toggleViewButtons}
              visible={visible || !isCurrent}
            /> :
            null
        })
           :
        null
    }
  }

}

export default Buttons

Buttons.propTypes = {
  // from parent
  bufferStartIndex: PropTypes.number,
  bufferedItems: PropTypes.array,
  showViewButtons: PropTypes.func,
  showShareSheet: PropTypes.func,
  setSaved: PropTypes.func,
  launchBrowser: PropTypes.func,
  toggleMercury: PropTypes.func,
  // from container
  index: PropTypes.number,
  displayMode: PropTypes.string,
  visible: PropTypes.bool,
  isDarkMode: PropTypes.bool,
  isOnboarding: PropTypes.bool,
  panAnim: PropTypes.object
}

// Naming Convention
//
// Items
// BufferedItems
// Index
// BufferIndex
// BufferStartIndex


// const oldSaveButtonIcon = <Svg
//     height='30'
//     width='33'
//     style={{
//       left: 7,
//     }}>
//     <Polygon
//       stroke={item.isSaved ? backgroundColor : borderColor}
//       strokeWidth={item.isSaved ? '1' : '2'}
//       fill={item.isSaved ? borderColor : 'none'}
//       points="21.1033725 0.74402123 27.1144651 4.08351712 22.5 11 18.5 11 16.882249 8.14815979"
//     ></Polygon>
//     <Polygon
//       stroke={item.isSaved ? backgroundColor : borderColor}
//       strokeWidth={item.isSaved ? '1' : '2'}
//       fill={item.isSaved ? borderColor : 'none'}
//       points="16.8235298 22.1285402 12.4972756 29.014584 6.71045315 25.6735605 11.1066646 18.1588232 14.7607651 18.1588232 16.8235298 21.5967643"
//     ></Polygon>
//     <Polygon
//       stroke={item.isSaved ? backgroundColor : borderColor}
//       strokeWidth={item.isSaved ? '1' : '2'}
//       fill={item.isSaved ? borderColor : 'none'}
//       points="14.5 18 2 18 2 11 10.5 11"
//     ></Polygon>
//     <Polygon
//       stroke={item.isSaved ? backgroundColor : borderColor}
//       strokeWidth={item.isSaved ? '1' : '2'}
//       fill={item.isSaved ? borderColor : 'none'}
//       points="18.5 11 22.5 18 32 18 32 11"
//     ></Polygon>
//     <Polygon
//       stroke={item.isSaved ? backgroundColor : borderColor}
//       strokeWidth={item.isSaved ? '1' : '2'}
//       fill={item.isSaved ? borderColor : 'none'}
//       points="12.4855083 0.639268135 26.9384494 25.6724966 21.1615506 29.0077907 6.70860939 3.97456225"
//     ></Polygon>
//   </Svg>
