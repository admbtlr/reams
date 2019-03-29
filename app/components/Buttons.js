import React from 'react'
import {
  ActionSheetIOS,
  Animated,
  Dimensions,
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
    visibleAnimMercury: new Animated.Value(80),
    toggleAnimMercury: new Animated.Value(0),
    toggleAnimSaved: new Animated.Value(0)
  }

  areButtonsVisible = false

  constructor (props) {
    super(props)
    this.props = props

    this.screenDimensions = Dimensions.get('window')

    this.showShareActionSheet = this.showShareActionSheet.bind(this)
    this.onSavePress = this.onSavePress.bind(this)
    this.onDisplayPress = this.onDisplayPress.bind(this)
    this.onMercuryPress = this.onMercuryPress.bind(this)
    this.startToggleAnimationMercury = this.startToggleAnimationMercury.bind(this)
    this.startToggleAnimationSaved = this.startToggleAnimationSaved.bind(this)
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
    if (prevProps.visible !== this.props.visible ||
      this.props.visible !== this.areButtonsVisible) {
      Animated.stagger(100, [
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
      ]).start(_ => {
        this.areButtonsVisible = this.props.visible
      })
    }
  }

  getBackgroundColor (item) {
    // return hslString('rizzleBG')
    return this.props.isDarkBackground ?
      ('hsl(0, 0%, 0%)') :
      (this.props.displayMode == 'saved' ?
        hslString('rizzleBG') :
        'white')
    // const feedColor = item ? item.feed_color : null
    // return this.props.displayMode == 'saved' ?
    //   hslString('rizzleBG') :
    //   (feedColor ?
    //     hslString(feedColor, 'desaturated') :
    //     hslString('rizzleBG'))
  }

  startToggleAnimationMercury () {
    const toValue = Math.abs(this.state.toggleAnimMercury._value - 1)
    Animated.timing(this.state.toggleAnimMercury, {
      toValue,
      duration: 400
    }).start()
  }

  startToggleAnimationSaved () {
    const toValue = Math.abs(this.state.toggleAnimSaved._value - 1)
    Animated.timing(this.state.toggleAnimSaved, {
      toValue,
      duration: 400
    }).start()
  }

  shouldComponentUpdate (nextProps, nexState) {
    // don't update if the only thing that's changed is saved or mercury state
    return !(this.props.index === nextProps.index &&
      this.props.displayMode === nextProps.displayMode &&
      this.props.decoratedCount === nextProps.decoratedCount &&
      this.props.toolbar === nextProps.toolbar &&
      this.props.numItems === nextProps.numItems &&
      (this.props.isCurrentItemSaved !== nextProps.isCurrentItemSaved ||
        this.props.showMercuryContent !== nextProps.showMercuryContent))
  }

  render () {
    console.log('RENDER BUTTONS!')
    const {prevItem, currentItem, nextItem} = this.props
    const items = prevItem ?
      [prevItem, currentItem, nextItem] :
      [currentItem, nextItem]
    const panAnim = getPanValue()

    const opacityRanges = [
      {
        inputRange: [0, 1, 2],
        outputRange: [1, 0, 0]
      }, {
        inputRange: [0, 1, 2],
        outputRange: [0, 1, 0]
      }, {
        inputRange: [0, 1, 2],
        outputRange: [0, 0, 1]
      }
    ]
    const opacityAnims = items.map((item, i) => panAnim ?
        panAnim.interpolate(opacityRanges[i]) :
        1)

    return items.map((item, i) => item ?
      this.renderButtons(item, opacityAnims[i], item === currentItem) :
      null)
    // return this.renderButtons(currentItem)
  }

  renderButtons (item, opacityAnim, isCurrent) {
    const strokeColor = this.props.isDarkBackground ?
      'hsl(0, 0%, 70%)' :
      'black'
    const showMercuryContent = item && item.showMercuryContent
    const isMercuryButtonEnabled = item && item.content_mercury
    const saveStrokeColours = item && item.isSaved ?
      ['hsl(45, 60%, 51%)', 'hsl(210, 60%, 51%)', 'hsl(15, 60%, 51%)'] :
      [strokeColor, strokeColor, strokeColor]
    const saveFillColors = item && item.isSaved ?
      ['hsl(45, 60%, 51%)', 'hsl(210, 60%, 51%)', 'hsl(15, 60%, 51%)'] :
      ['white', 'white', 'white']
    // const backgroundColor = this.props.displayMode && this.props.displayMode == 'unread' ?
    //   hslString('rizzleBG') :
    //   hslString('rizzleBGAlt')
    const feedColor = item ? hslString(item.feed_color, 'desaturated') : null
    const borderColor = this.props.displayMode == 'saved' ?
      hslString('rizzleText') :
      feedColor
    // const backgroundColor = this.props.displayMode == 'saved' ? hslString('rizzleBGAlt') : strokeColor
    const backgroundColor = this.getBackgroundColor(item)
    // const mercuryButtonBackgroundColor = this.state.toggleAnimMercury ?
    //   this.state.toggleAnimMercury.interpolate({
    //     inputRange: [0, 1],
    //     outputRange: [this.state.mercuryfeedColor, backgroundColor]
    //   }) :
    //   backgroundColor
    // const mercuryButtonOpacity = this.state.toggleAnimMercury
    const borderWidth = this.props.displayMode === 'isSaved' ? 1 : 2

    const anim = new Animated.Value(0)

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
          borderColor={borderColor}
          borderWidth={borderWidth}
          style={{
            width: 'auto',
            paddingHorizontal: 28,
            transform: [{
              translateY: isCurrent ? this.state.visibleAnimCount : 0
            }]
          }}
          onPress={this.onDisplayPress}
        >
          <Text style={{
            ...this.getStyles().buttonText,
            color: strokeColor
          }}>
            {this.props.index + 1} / {this.props.numItems}
          </Text>
          { !!this.props.decoratedCount &&
            <Text style={{
              ...this.getStyles().buttonText,
              ...this.getStyles().smallText,
              color: strokeColor
            }}>
              Cached: {this.props.decoratedCount}
            </Text>
          }
        </RizzleButton>
        <RizzleButton
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          startToggleAnimation={this.startToggleAnimationSaved}
          style={{
            paddingLeft: 1,
            transform: [{
              translateY: isCurrent ? this.state.visibleAnimSave : 0
            }]
          }}
          onPress={this.onSavePress}
        >
          <Animated.View style={{
            position: 'absolute',
            left: -1,
            top: -1,
            width: 56,
            height: 56,
            borderRadius: 28,
            padding: 2,
            opacity: this.getSavedToggleOpacity(item, isCurrent),
            backgroundColor: feedColor
          }}>
            <Svg
              height='50'
              width='50'
              style={{
                transform: [
                  { translateX: -3 },
                  { translateY: -2 }
                ]
              }}>
              <Path fill={saveFillColors[2]} stroke={saveStrokeColours[2]} d="M41.2872335,12.7276117 L29.7883069,12.7903081 L27.2375412,17.3851541 L29.7064808,21.6614827 L41.4403118,22.0040892 L41.2872335,12.7276117 Z" id="Rectangle-Copy-8" transform="translate(34.305930, 17.372037) rotate(-60.000000) translate(-34.305930, -17.372037) "></Path>
              <Path fill={saveFillColors[2]} stroke={saveStrokeColours[2]} d="M18.187442,34.0982957 L17.56609,34.4570335 L14.9405857,39.1865106 L17.4056535,43.4561333 L29.1519238,43.5234076 L29.1519238,34.5079474 L18.187442,34.0982957 Z" id="Rectangle-Copy-10" transform="translate(22.008975, 38.809773) rotate(120.000000) translate(-22.008975, -38.809773) "></Path>
              <Path fill={saveFillColors[1]} stroke={saveStrokeColours[1]} d="M8.80901699,23.5 L13.309017,32.5 L25,32.5 L25,23.5 L8.80901699,23.5 Z" id="Rectangle-Copy-6" transform="translate(16.750000, 28.000000) rotate(180.000000) translate(-16.750000, -28.000000) "></Path>
              <Path fill={saveFillColors[1]} stroke={saveStrokeColours[1]} d="M30.8456356,23.5 L35.7956356,32.5 L47.5,32.5 L47.5,23.5 Z" id="Rectangle-Copy-9"></Path>
              <Rect fill={saveFillColors[0]} stroke={saveStrokeColours[0]} id="Rectangle-Copy-7" transform="translate(28.000000, 28.000000) rotate(60.000000) translate(-28.000000, -28.000000) " x="8.5" y="23.5" width="39" height="9"></Rect>
              </Svg>
          </Animated.View>
        </RizzleButton>
        <RizzleButton
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          style={{
            paddingLeft: 1,
            transform: [{
              translateY: isCurrent ? this.state.visibleAnimShare : 0
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
                translateY: -4
              }, {
                translateX: 1
              }]
            }}>
            <Polyline
              fill='none'
              points='17,10 25,2 33,10'
              stroke={strokeColor}
              strokeLinecap='round'
              strokeWidth='3'
            />
            <Line
              fill='none'
              stroke={strokeColor}
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
              stroke={strokeColor}
              strokeLinecap='round'
              strokeWidth='3'
            />
          </Svg>
        </RizzleButton>
        <RizzleButton
          backgroundColor={backgroundColor}
          borderColor={isMercuryButtonEnabled ? borderColor : backgroundColor}
          borderWidth={borderWidth}
          startToggleAnimation={this.startToggleAnimationMercury}
          style={{
            paddingLeft: 2,
            transform: [{
              translateY: isCurrent ? this.state.visibleAnimMercury : 0
            }]
          }}
          onPress={isMercuryButtonEnabled ? this.onMercuryPress : () => false}
        >
          <Svg
            style={{
              position: 'absolute',
              left: 9,
              top: 9, // transform: [{
              //   translateX: 7
              // }, {
              //   translateY: 0
              // }],
              opacity: isMercuryButtonEnabled ? 1 : 0.3
            }}
            height='32'
            width='34'>
            <Path d="M0.5,1.5 L32.5,1.5" strokeWidth="3" stroke={strokeColor}></Path>
            <Path d="M0.5,7.5 L32.5,7.5" strokeWidth="3" stroke={strokeColor}></Path>
            <Path d="M0.5,13.5 L32.5,13.5" opacity="0.2" stroke={strokeColor}></Path>
            <Path d="M0.5,13.5 L7.5,13.5" strokeWidth="3" stroke={strokeColor}></Path>
            <Path d="M0.5,19.5 L32.5,19.5" opacity="0.2" stroke={strokeColor}></Path>
            <Path d="M0.5,25.5 L32.5,25.5" opacity="0.2" stroke={strokeColor}></Path>
            <Path d="M0.5,31.5 L32.5,31.5" opacity="0.2" stroke={strokeColor}></Path>
          </Svg>
          <Animated.View style={{
            position: 'absolute',
            left: -1,
            top: -1,
            width: 56,
            height: 56,
            borderRadius: 28,
            padding: 9,
            opacity: this.getMercuryToggleOpacity(item, isCurrent),
            backgroundColor: feedColor
          }}>
            <Svg
              height='32'
              width='34'>
              <Path d="M10.5,1.5 L32.5,1.5" stroke={backgroundColor} strokeWidth="3" strokeLinecap="square"></Path>
              <Path d="M10.5,7.5 L32.5,7.5" stroke={backgroundColor} strokeWidth="3" strokeLinecap="square"></Path>
              <Rect fill={backgroundColor} x="0" y="0" width="7" height="9"></Rect>
              <Path d="M0.5,13.5 L32.5,13.5" stroke={backgroundColor} strokeWidth="3" strokeLinecap="square"></Path>
              <Path d="M0.5,19.5 L32.5,19.5" stroke={backgroundColor} strokeWidth="3" strokeLinecap="square"></Path>
              <Path d="M0.5,25.5 L32.5,25.5" stroke={backgroundColor} strokeWidth="3" strokeLinecap="square"></Path>
              <Path d="M0.5,31.5 L32.5,31.5" stroke={backgroundColor} strokeWidth="3" strokeLinecap="square"></Path>
            </Svg>
          </Animated.View>
        </RizzleButton>
      </Animated.View>
    )
  }

  getMercuryToggleOpacity (item, isCurrent) {
    if (isCurrent) {
      const currentToggleVal = this.state.toggleAnimMercury._value
      return !!item.showMercuryContent === !!currentToggleVal ?
        this.state.toggleAnimMercury :
        this.state.toggleAnimMercury.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0]
        })
    } else {
      return item && item.showMercuryContent ? 1 : 0
    }
  }

  getSavedToggleOpacity (item, isCurrent) {
    if (isCurrent) {
      const currentToggleVal = this.state.toggleAnimSaved._value
      return !!item.isSaved === !!currentToggleVal ?
        this.state.toggleAnimSaved :
        this.state.toggleAnimSaved.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0]
        })
    } else {
      return item && item.isSaved ? 1 : 0
    }
  }

  getStyles() {
    return {
      base: {
        position: 'absolute',
        bottom: 0,
        width: this.screenDimensions.width < 500 ?
          '100%' :
          500,
        zIndex: 10,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingLeft: 20,
        paddingRight: 20
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
