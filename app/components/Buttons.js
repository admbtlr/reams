import React from 'react'
import {
  ActionSheetIOS,
  Animated,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Svg, {Polygon, Polyline, Rect, Path, Line} from 'react-native-svg'
import RizzleButton from './RizzleButton'
import {id} from '../utils'
import {getPanValue} from '../utils/animationHandlers'
import {hslString} from '../utils/colors'

class Buttons extends React.Component {
  state = {
    visibleAnimCount: new Animated.Value(80),
    visibleAnimSave: new Animated.Value(80),
    visibleAnimShare: new Animated.Value(80),
    visibleAnimMercury: new Animated.Value(80)
  }

  constructor (props) {
    super(props)
    this.props = props

    this.showShareActionSheet = this.showShareActionSheet.bind(this)
    this.onSavePress = this.onSavePress.bind(this)
    this.onDisplayPress = this.onDisplayPress.bind(this)
    this.onMercuryPress = this.onMercuryPress.bind(this)
  }

  showShareActionSheet () {
    if (!this.props.currentItem) return
    ActionSheetIOS.showShareActionSheetWithOptions({
      url: this.props.currentItem.url,
      message: this.props.currentItem.title
    },
    (error) => {
      console.error(error)
    },
    (success, method) => {
    })
  }

  onSavePress () {
    this.props.toggleSaved(this.props.currentItem)
  }

  onDisplayPress () {
    this.props.toggleDisplay()
  }

  onMercuryPress () {
    this.props.toggleMercury(this.props.currentItem)
  }

  componentDidUpdate (prevProps) {
    const springConfig =         {
      speed: 30,
      bounciness: 12,
      toValue: this.props.visible ? 0 : 80,
      duration: 200,
      useNativeDriver: true
    }
    if (prevProps.visible !== this.props.visible) {
      Animated.stagger(70, [
        Animated.spring(
          this.state.visibleAnimCount,
          springConfig
        ),
        Animated.spring(
          this.state.visibleAnimSave,
          springConfig
        ),
        Animated.spring(
          this.state.visibleAnimShare,
          springConfig
        ),
        Animated.spring(
          this.state.visibleAnimMercury,
          springConfig
        )
      ]).start()
    }
  }

  getBackgroundColor (item) {
    const feedColor = item ? item.feed_color : null
    return this.props.displayMode == 'saved' ?
      hslString('rizzleBG') :
      (feedColor ?
        hslString(feedColor, 'desaturatedDarker') :
        hslString('rizzleBG'))
  }

  render () {
    const {prevItem, currentItem, nextItem} = this.props
    const items = prevItem ?
      [prevItem, currentItem, nextItem] :
      [currentItem, nextItem]
    const panAnim = getPanValue()

    const opacityRanges = [
      {
        inputRange: [0, 1, 2],
        outputRange: [1, 1, 1]
      }, {
        inputRange: [0, 1, 2],
        outputRange: [0, 1, 1]
      }, {
        inputRange: [0, 1, 2],
        outputRange: [0, 0, 1]
      }
    ]
    const opacityAnims = items.map((item, i) => panAnim ?
        panAnim.interpolate(opacityRanges[i]) :
        1)

    return items.map((item, i) => this.
      renderButtons(item, opacityAnims[i], item === currentItem))
    // return this.renderButtons(currentItem)
  }

  renderButtons (item, opacityAnim, isCurrent) {
    const showMercuryContent = item && item.showMercuryContent
    const isMercuryButtonEnabled = item && item.content_mercury
    const saveStrokeColour = this.props.displayMode && this.props.displayMode == 'unread' ?
      hslString('rizzleFG') :
      hslString('rizzleFG')
    // const backgroundColor = this.props.displayMode && this.props.displayMode == 'unread' ?
    //   hslString('rizzleBG') :
    //   hslString('rizzleBGAlt')
    const feedColor = item ? item.feed_color : null
    // const backgroundColor = this.props.displayMode == 'saved' ? hslString('rizzleBGAlt') : hslString('rizzleFG')
    const backgroundColor = this.getBackgroundColor(item)
    return (
      <Animated.View
        pointerEvents={isCurrent ? 'box-none' : 'none'}
        key={id()}
        style={{
          ...this.getStyles().base,
          opacity: opacityAnim
        }}>
        <RizzleButton
          backgroundColor={backgroundColor}
          style={{
            width: 'auto',
            paddingHorizontal: 28,
            transform: [{
              translateY: this.state.visibleAnimCount
            }]
          }}
          onPress={this.onDisplayPress}
        >
          <Text style={{
            ...this.getStyles().buttonText,
            color: saveStrokeColour
          }}>
            {this.props.index + 1} / {this.props.numItems}
          </Text>
          { !!this.props.decoratedCount &&
            <Text style={{
              ...this.getStyles().buttonText,
              ...this.getStyles().smallText,
              color: saveStrokeColour
            }}>
              Cached: {this.props.decoratedCount}
            </Text>
          }
        </RizzleButton>
        <RizzleButton
          backgroundColor={backgroundColor}
          style={{
            paddingLeft: 3,
            transform: [{
              translateY: this.state.visibleAnimSave
            }]
          }}
          onPress={this.onSavePress}
        >
          <Svg
            height='50'
            width='50'
            style={{
              transform: [{
                scale: 0.5
              }]
            }}>
            <Polygon
              points='25,3.553 30.695,18.321 46.5,19.173 34.214,29.152 38.287,44.447 25,35.848 11.712,44.447 15.786,29.152 3.5,19.173 19.305,18.321'
              stroke={item && item.isSaved ? hslString('rizzleHighlight') : hslString('rizzleFG')}
              strokeWidth='3'
              strokeLineJoin='round'
              fill='none'
            />
          </Svg>
        </RizzleButton>
        <RizzleButton
          backgroundColor={backgroundColor}
          style={{
            paddingLeft: 3,
            transform: [{
              translateY: this.state.visibleAnimShare
            }]
          }}
          onPress={this.showShareActionSheet}
          >
          <Svg
            height='50'
            width='50'
            style={{
              transform: [{
                scale: 0.5
              }, {
                translateY: -2
              }, {
                translateX: -1
              }]
            }}>
            <Polyline
              fill='none'
              points='17,10 25,2 33,10'
              stroke={hslString('rizzleFG')}
              strokeLinecap='round'
              strokeWidth='3'
            />
            <Line
              fill='none'
              stroke={hslString('rizzleFG')}
              strokeLinecap='round'
              strokeWidth='3'
              x1='25'
              x2='25'
              y1='32'
              y2='2.333'
            />
            <Rect
              fill='none'
              height='50'
              width='50'
            />
            <Path
              d='M17,17H8v32h34V17h-9'
              fill='none'
              stroke={hslString('rizzleFG')}
              strokeLinecap='round'
              strokeWidth='3'
            />
          </Svg>
        </RizzleButton>
        <RizzleButton
          backgroundColor={backgroundColor}
          style={{
            paddingLeft: 3,
            transform: [{
              translateY: this.state.visibleAnimMercury
            }]
          }}
          onPress={isMercuryButtonEnabled ? this.onMercuryPress : () => false}
        >
          { item && item.showMercuryContent &&
            <Svg
              style={{
                transform: [{
                  translateX: 7
                }, {
                  translateY: 0
                }]
              }}
              height='32'
              width='34'>
              <Path d="M10.5,1.5 L32.5,1.5" stroke="#F6BE3C" strokeWidth="3" strokeLinecap="square"></Path>
              <Path d="M10.5,7.5 L32.5,7.5" stroke="#F6BE3C" strokeWidth="3" strokeLinecap="square"></Path>
              <Rect fill="#F6BE3C" x="0" y="0" width="7" height="9"></Rect>
              <Path d="M1.5,13.5 L32.5,13.5" stroke="#F6BE3C" strokeWidth="3" strokeLinecap="square"></Path>
              <Path d="M1.5,19.5 L32.5,19.5" stroke="#F6BE3C" strokeWidth="3" strokeLinecap="square"></Path>
              <Path d="M1.5,25.5 L32.5,25.5" stroke="#F6BE3C" strokeWidth="3" strokeLinecap="square"></Path>
              <Path d="M1.5,31.5 L32.5,31.5" stroke="#F6BE3C" strokeWidth="3" strokeLinecap="square"></Path>
            </Svg>
          }
          { !(item && item.showMercuryContent) &&
            <Svg
              style={{
                transform: [{
                  translateX: 7
                }, {
                  translateY: 0
                }],
                opacity: isMercuryButtonEnabled ? 1 : 0.3
              }}
              height='32'
              width='34'>
              <Path d="M0.5,1.5 L31.5,1.5" strokeWidth="3" stroke={hslString('rizzleFG')}></Path>
              <Path d="M0.5,7.5 L31.5,7.5" strokeWidth="3" stroke={hslString('rizzleFG')}></Path>
              <Path d="M0.5,13.5 L31.5,13.5" opacity="0.2" stroke={hslString('rizzleFG')}></Path>
              <Path d="M0.5,13.5 L7.5,13.5" strokeWidth="3" stroke={hslString('rizzleFG')}></Path>
              <Path d="M0.5,19.5 L31.5,19.5" opacity="0.2" stroke={hslString('rizzleFG')}></Path>
              <Path d="M0.5,25.5 L31.5,25.5" opacity="0.2" stroke={hslString('rizzleFG')}></Path>
              <Path d="M0.5,31.5 L31.5,31.5" opacity="0.2" stroke={hslString('rizzleFG')}></Path>
            </Svg>
          }
        </RizzleButton>
      </Animated.View>
    )
  }

  getStyles() {
    return {
      base: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        zIndex: 10,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingLeft: 16,
        paddingRight: 16
      },
      buttonSVG: {
        paddingLeft: 3
      },
      buttonText: {
        color: 'white',
        textAlign: 'center',
        backgroundColor: 'transparent',
        // fontFamily: 'BodoniSvtyTwoOSITCTT-Book',
        fontFamily: 'IBMPlexMono',
        fontSize: 16,
      },
      smallText: {
        fontSize: 8
      }
    }
  }
}

export default Buttons
