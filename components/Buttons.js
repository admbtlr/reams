import React from 'react'
import {
  Dimensions,
} from 'react-native'
import ButtonSet from './ButtonSet'

class Buttons extends React.Component {
  constructor (props) {
    super(props)
    this.props = props

    this.screenDimensions = Dimensions.get('window')
  }
  
  shouldComponentUpdate (nextProps, nextState) {
    // include content_mercury to upate the buttons once the item has been decorated
    const mapFunc = item => ({
      _id: item._id,
      content_mercury: item.content_mercury
    })

    return true
  }

  render () {
    if (this.props.isOnboarding) {
      return null
    }
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
    console.log('RENDER BUTTONS')

    this.screenDimensions = Dimensions.get('window')
    const panAnimDivisor = this.screenDimensions.width

    const opacityRanges = bufferedItems?.map((item, index) => {
      const inputRange = [panAnimDivisor * index, panAnimDivisor * (index + 1)]
      const outputRange = [1, 0]
      if (index > 0) {
        inputRange.unshift(panAnimDivisor * (index - 1))
        outputRange.unshift(0)
      }
      return { inputRange, outputRange }
    })

    const opacityAnims = bufferedItems?.map((item, i) => panAnim ?
        panAnim.interpolate(opacityRanges[i]) :
        1)

    return bufferedItems ?
      bufferedItems.map((item, i) => {
        const isCurrent = i === index - bufferStartIndex
        return item ?
          <ButtonSet
            item={item}
            key={`buttons: ${item._id}`}
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

export default Buttons
