import React from 'react'
import {
  Animated,
  Text,
  TouchableOpacity,
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
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return nextProps.currentItem !== this.props.currentItem ||
  //     nextProps.toolbar.message !== this.props.toolbar.message
  // }

  getMessage (props = this.props) {
    const feedName = props.currentItem
      ? props.currentItem.feed_title
      : 'Rizzle'
    return props.toolbar.message || feedName || ''
  }

  render () {
    console.log('RENDER TOPBAR!')
    let topBarStyles = Object.assign({}, styles.topBar, this.props.displayMode == 'saved' ? colorSaved.topBar : colorUnread.topBar)
    let textHolderStyles = Object.assign({}, styles.textHolder, this.props.displayMode == 'saved' ? colorSaved.textHolder : colorUnread.textHolder)
    return (
      <View style={styles.base}>
        <View style={topBarStyles} />
        <Animated.View style={{
          ...textHolderStyles,
          transform: [{
            translateY: getAnimatedValue()
          }]
        }}>
          <Animated.Text
            numberOfLines={1}
            style={{
              ...styles.feedName,
              opacity: getAnimatedValueNormalised(),
              marginLeft: 35
            }}
          >
            {this.getMessage()}
          </Animated.Text>
          <TouchableOpacity
            style={{
              marginRight: 7,
              marginTop: 3,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }}
            onPress={this.props.toggleViewButtons}
          >
            <Text style={{
              fontFamily: 'IBMPlexMono',
              color: 'white',
              paddingLeft: 6,
              paddingTop: 3
            }}>z<Text style={{ color: 'black' }}>z</Text></Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    )
  }
}

const colorSaved = {
  topBar: {
    backgroundColor: '#5f4d2f'
  },
  textHolder: {
    backgroundColor: '#5f4d2f'
  }
}

const colorUnread = {
  topBar: {
    backgroundColor: '#51485f'
  },
  textHolder: {
    backgroundColor: '#51485f'
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
    height: 20
  },
  textHolder: {
    flex: 1,
    flexDirection: 'row',
    height: STATUS_BAR_HEIGHT,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowRadius: 1,
    shadowOpacity: 0.3
  },
  feedName: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    // fontFamily: 'AvenirNext-Regular',
    fontFamily: 'IBMPlexMono',
    // fontWeight: '700',
    // fontVariant: ['small-caps'],
    textAlign: 'center',
    padding: 10
  }
}

export default TopBar
