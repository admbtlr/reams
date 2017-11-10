import React from 'react'
import {
  Animated,
  Text,
  View
} from 'react-native'

import {
  getAnimatedValue,
  getAnimatedValueNormalised
} from '../utils/animationHandlers'

export const STATUS_BAR_HEIGHT = 40

class TopBar extends React.Component {

  constructor (props) {
    super(props)
    this.props = props
    this.translateY = STATUS_BAR_HEIGHT
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.item !== this.props.item) {

    }
  }

  getMessage (props = this.props) {
    const feedName = props.items.length > 1
      ? props.items[this.props.index].feed_name
      : 'Rizzle'
    return props.toolbar.message || feedName || ''
  }

  render () {
    console.log('RENDER TOPBAR!')
    return (
      <View style={styles.base}>
        <View style={styles.topBar} />
        <Animated.View style={{
          ...styles.textHolder,
          transform: [{
            translateY: getAnimatedValue()
          }]
        }}>
          <Animated.Text style={{
            ...styles.feedName,
            opacity: getAnimatedValueNormalised()
          }}>
            {this.getMessage()}
          </Animated.Text>
        </Animated.View>
      </View>
    )
  }
}

const styles = {
  base: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 10
  },
  topBar: {
    flex: 1,
    backgroundColor: '#4d0d42',
    height: 20
  },
  textHolder: {
    flex: 1,
    backgroundColor: '#4d0d42',
    height: STATUS_BAR_HEIGHT
  },
  feedName: {
    flex: 1,
    color: 'white',
    fontSize: 18,
    fontFamily: 'BodoniSvtyTwoOSITCTT-Book',
    // fontWeight: '700',
    // fontVariant: ['small-caps'],
    textAlign: 'center',
    padding: 10
  }
}

export default TopBar
