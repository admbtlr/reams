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

class Buttons extends React.Component {
  state = {
    visibleAnimCount: new Animated.Value(0),
    visibleAnimSave: new Animated.Value(0),
    visibleAnimShare: new Animated.Value(0),
    visibleAnimMercury: new Animated.Value(0)
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
    ActionSheetIOS.showShareActionSheetWithOptions({
      url: this.props.item.url,
      message: this.props.item.title
    },
    (error) => {
      console.error(error)
    },
    (success, method) => {
    })
  }

  onSavePress () {
    this.props.toggleSaved(this.props.item)
  }

  onDisplayPress () {
    this.props.toggleDisplay()
  }

  onMercuryPress () {
    this.props.toggleMercury(this.props.item)
  }

  componentDidUpdate (prevProps) {
    const springConfig =         {
      speed: 20,
      bounciness: 12,
      toValue: this.props.visible ? 0 : 80,
      duration: 200,
      useNativeDriver: true
    }
    if (prevProps.visible !== this.props.visible) {
      Animated.stagger(50, [
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

  render () {
    const { item } = this.props
    const saveStrokeColour = false && this.props.displayMode && this.props.displayMode == 'unread' ? '#f6be3c' : '#ffffff'
    return (
      <Animated.View
        pointerEvents='box-none'
        style={{
          ...this.getStyles().base,
          // opacity: getAnimatedValueNormalised()
        }}>
        <RizzleButton
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
              stroke={saveStrokeColour}
              strokeWidth='3'
              strokeLineJoin='round'
              fill={item && item.isSaved ? saveStrokeColour : 'none'}
            />
          </Svg>
        </RizzleButton>
        <RizzleButton
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
              }]
            }}>
            <Polyline
              fill='none'
              points='17,10 25,2 33,10'
              stroke={saveStrokeColour}
              strokeLinecap='round'
              strokeWidth='3'
            />
            <Line
              fill='none'
              stroke={saveStrokeColour}
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
              stroke={saveStrokeColour}
              strokeLinecap='round'
              strokeWidth='3'
            />
          </Svg>
        </RizzleButton>
        <RizzleButton
          style={{
            paddingLeft: 3,
            transform: [{
              translateY: this.state.visibleAnimMercury
            }]
          }}
          onPress={this.onMercuryPress}
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
                }]
              }}
              height='32'
              width='34'>
              <Path d="M0.5,1.5 L31.5,1.5" strokeWidth="3" stroke='#FFFFFF'></Path>
              <Path d="M0.5,7.5 L31.5,7.5" strokeWidth="3" stroke='#FFFFFF'></Path>
              <Path d="M0.5,13.5 L31.5,13.5" opacity="0.200577446" stroke='#FFFFFF'></Path>
              <Path d="M0.5,13.5 L7.5,13.5" strokeWidth="3" stroke='#FFFFFF'></Path>
              <Path d="M0.5,19.5 L31.5,19.5" opacity="0.200577446" stroke='#FFFFFF'></Path>
              <Path d="M0.5,25.5 L31.5,25.5" opacity="0.200577446" stroke='#FFFFFF'></Path>
              <Path d="M0.5,31.5 L31.5,31.5" opacity="0.200577446" stroke='#FFFFFF'></Path>
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
