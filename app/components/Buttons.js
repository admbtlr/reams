import React, { Fragment } from 'react'
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

  translateDistance = 80

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

    this.state = {
      visibleAnim: new Animated.Value(1),
      visibleAnimCount: new Animated.Value(80),
      visibleAnimSave: new Animated.Value(80),
      visibleAnimShare: new Animated.Value(80),
      visibleAnimMercury: new Animated.Value(80),
      toggleAnimMercury: new Animated.Value(0),
      toggleAnimSaved: new Animated.Value(0)
    }
  }

  showShareActionSheet () {
    if (this.props.isOnboarding || !this.props.currentItem) return
    ActionSheetIOS.showShareActionSheetWithOptions({
      url: this.props.currentItem.url
    },
    (error) => {
      console.error(error)
    },
    (success, method) => {
    })
  }

  onSavePress () {
    this.props.isOnboarding || this.props.toggleSaved(this.props.currentItem)
  }

  onDisplayPress () {
    this.props.isOnboarding || this.props.toggleDisplay()
  }

  onMercuryPress () {
    this.props.isOnboarding || this.props.toggleMercury(this.props.currentItem)
  }

  componentDidUpdate (prevProps) {
    const isFirstRenderForThisIndex = prevProps.toolbar.scrollOwner !== this.props.toolbar.scrollOwner
    if (isFirstRenderForThisIndex) {
      this.state.visibleAnim.setValue(0)
    } else if (prevProps.visible !== this.props.visible ||
      this.props.visible !== this.areButtonsVisible) {
      Animated.timing(
        this.state.visibleAnim,
        {
          toValue: this.props.visible ? 0 : 1,
          duration: 800,
          useNativeDriver: true
        }
      ).start(_ => {
        this.areButtonsVisible = this.props.visible
      })
    }

    if (this.props.currentItem && this.props.currentItem !== prevProps.currentItem) {
      this.setState({
        toggleAnimSaved: new Animated.Value(this.props.currentItem.isSaved ? 1 : 0),
        toggleAnimMercury: new Animated.Value(this.props.currentItem.showMercuryContent ? 1 : 0)
      })
      this.isCurrentSaved = this.props.currentItem.isSaved ? 1 : 0
      this.isCurrentMercury = this.props.currentItem.showMercuryContent ? 1 : 0
    }
  }

  getBackgroundColor (item) {
    // return hslString('rizzleBG')
    return this.props.isDarkBackground ?
      ('hsl(240, 17%, 15%)') :
      (this.props.displayMode == 'saved' ?
        hslString('rizzleBG') :
        'white')
    // const activeColor = item ? item.feed_color : null
    // return this.props.displayMode == 'saved' ?
    //   hslString('rizzleBG') :
    //   (activeColor ?
    //     hslString(activeColor, 'desaturated') :
    //     hslString('rizzleBG'))
  }

  startToggleAnimationSaved () {
    this.isCurrentSaved = Math.abs(this.isCurrentSaved - 1)
    Animated.timing(this.state.toggleAnimSaved, {
      toValue: this.isCurrentSaved,
      duration: 300,
      useNativeDriver: true
    }).start()
  }

  startToggleAnimationMercury () {
    this.isCurrentMercury = Math.abs(this.isCurrentMercury - 1)
    Animated.timing(this.state.toggleAnimMercury, {
      toValue: this.isCurrentMercury,
      duration: 300,
      useNativeDriver: true
    }).start()
  }

  shouldComponentUpdate (nextProps, nexState) {
    // don't update if the only thing that's changed is saved or mercury state
    return !(this.props.index === nextProps.index &&
      this.props.displayMode === nextProps.displayMode &&
      this.props.decoratedCount === nextProps.decoratedCount &&
      this.props.visible === nextProps.visible &&
      this.props.toolbar === nextProps.toolbar &&
      this.props.numItems === nextProps.numItems)
  }

  render () {
    // console.log('RENDER BUTTONS!')
    if (this.props.isOnboarding) {
      return this.renderButtons({}, null, true)
    } else {
      const {prevItem, currentItem, nextItem} = this.props
      const items = prevItem ?
        [prevItem, currentItem, nextItem] :
        [currentItem, nextItem]
      const { panAnim, panAnimDivisor } = getPanValue()

      const opacityRanges = [
        {
          inputRange: [0, panAnimDivisor, panAnimDivisor * 2],
          outputRange: [1, 0, 0]
        }, {
          inputRange: [0, panAnimDivisor, panAnimDivisor * 2],
          outputRange: [0, 1, 0]
        }, {
          inputRange: [0, panAnimDivisor, panAnimDivisor * 2],
          outputRange: [0, 0, 1]
        }
      ]
      const opacityAnims = items.map((item, i) => panAnim ?
          panAnim.interpolate(opacityRanges[i]) :
          1)

      return items.map((item, i) => item ?
        this.renderButtons(item, opacityAnims[i], item === currentItem) :
        null)
    }
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
    const saveFillColors = ['white', 'white', 'white']
    // const backgroundColor = this.props.displayMode && this.props.displayMode == 'unread' ?
    //   hslString('rizzleBG') :
    //   hslString('rizzleBGAlt')
    let activeColor = this.props.displayMode === 'saved' || this.props.isOnboarding ?
        hslString('rizzleText', 'ui') :
      item ?
        hslString(item.feed_color, this.props.isDarkBackground ? 'darkmode' : '') :
      null
    const borderColor = this.props.displayMode == 'saved' ?
      hslString('rizzleText') :
      activeColor
    // const backgroundColor = this.props.displayMode == 'saved' ? hslString('rizzleBGAlt') : strokeColor
    const backgroundColor = this.getBackgroundColor(item)
    // const mercuryButtonBackgroundColor = this.state.toggleAnimMercury ?
    //   this.state.toggleAnimMercury.interpolate({
    //     inputRange: [0, 1],
    //     outputRange: [this.state.mercuryactiveColor, backgroundColor]
    //   }) :
    //   backgroundColor
    // const mercuryButtonOpacity = this.state.toggleAnimMercury
    const borderWidth = 1 // this.props.displayMode === 'isSaved' ? 1 : 2

    const anim = new Animated.Value(0)

    return (
      <Animated.View
        pointerEvents={isCurrent ? 'box-none' : 'none'}
        key={id()}
        style={{
          ...this.getStyles().base,
          opacity: opacityAnim || 1
        }}>
        <RizzleButton
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          style={{
            width: 'auto',
            paddingHorizontal: 25,
            transform: [{
              translateY: isCurrent ? this.state.visibleAnim.interpolate({
                inputRange: [0, 0.2, 0.4, 1],
                outputRange: [0, this.translateDistance * 1.2, this.translateDistance, this.translateDistance]
              }) : 0
            }]
          }}
          onPress={this.onDisplayPress}
        >
          <Text style={{
            ...this.getStyles().buttonText,
            color: borderColor
          }}>
            {this.props.index + 1} / {this.props.numItems}
          </Text>
          { !!this.props.decoratedCount &&
            <Text style={{
              ...this.getStyles().buttonText,
              ...this.getStyles().smallText,
              color: borderColor
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
              translateY: isCurrent ? this.state.visibleAnim.interpolate({
                inputRange: [0, 0.2, 0.4, 0.6, 1],
                outputRange: [0, 0, this.translateDistance * 1.2, this.translateDistance, this.translateDistance]
              }) : 0
            }]
          }}
          onPress={this.onSavePress}
        >
          {/*
          <Svg
            height='50'
            width='50'
            style={{
              transform: [
                { translateX: -4 },
                { translateY: -3 }
              ]
            }}>
            <Path fill={backgroundColor} strokeWidth='2' stroke={borderColor} d="M41.2872335,12.7276117 L29.7883069,12.7903081 L27.2375412,17.3851541 L29.7064808,21.6614827 L41.4403118,22.0040892 L41.2872335,12.7276117 Z" id="Rectangle-Copy-8" transform="translate(34.305930, 17.372037) rotate(-60.000000) translate(-34.305930, -17.372037) "></Path>
            <Path fill={backgroundColor} strokeWidth='2' stroke={borderColor} d="M18.187442,34.0982957 L17.56609,34.4570335 L14.9405857,39.1865106 L17.4056535,43.4561333 L29.1519238,43.5234076 L29.1519238,34.5079474 L18.187442,34.0982957 Z" id="Rectangle-Copy-10" transform="translate(22.008975, 38.809773) rotate(120.000000) translate(-22.008975, -38.809773) "></Path>
            <Path fill={backgroundColor} strokeWidth='2' stroke={borderColor} d="M8.80901699,23.5 L13.309017,32.5 L25,32.5 L25,23.5 L8.80901699,23.5 Z" id="Rectangle-Copy-6" transform="translate(16.750000, 28.000000) rotate(180.000000) translate(-16.750000, -28.000000) "></Path>
            <Path fill={backgroundColor} strokeWidth='2' stroke={borderColor} d="M30.8456356,23.5 L35.7956356,32.5 L47.5,32.5 L47.5,23.5 Z" id="Rectangle-Copy-9"></Path>
            <Rect fill={backgroundColor} strokeWidth='2' stroke={borderColor} id="Rectangle-Copy-7" transform="translate(28.000000, 28.000000) rotate(60.000000) translate(-28.000000, -28.000000) " x="8.5" y="23.5" width="39" height="9"></Rect>
          </Svg>
          */}
          <Svg
            height='30'
            width='33'
            style={{
              left: 7
            }}>
            <Polygon stroke={borderColor} strokeWidth="2" fill="none" points="21.1033725 0.74402123 27.1144651 4.08351712 22.5 11 18.5 11 16.882249 8.14815979"></Polygon>
            <Polygon stroke={borderColor} strokeWidth="2" fill="none" points="16.8235298 22.1285402 12.4972756 29.014584 6.71045315 25.6735605 11.1066646 18.1588232 14.7607651 18.1588232 16.8235298 21.5967643"></Polygon>
            <Polygon stroke={borderColor} strokeWidth="2" fill="none" points="14.5 18 2 18 2 11 10.5 11"></Polygon>
            <Polygon stroke={borderColor} strokeWidth="2" fill="none" points="18.5 11 22.5 18 32 18 32 11"></Polygon>
            <Polygon stroke={borderColor} strokeWidth="2" fill="none" points="12.4855083 0.639268135 26.9384494 25.6724966 21.1615506 29.0077907 6.70860939 3.97456225"></Polygon>
          </Svg>
          {/*
          <Animated.View style={{
            position: 'absolute',
            left: -1,
            top: -1,
            width: 50,
            height: 50,
            borderRadius: 25,
            padding: 2,
            opacity: this.getSavedToggleOpacity(item, isCurrent),
            backgroundColor: activeColor
          }}>
            <Svg
              height='50'
              width='50'
              style={{
                transform: [
                  { translateX: -5 },
                  { translateY: -5 }
                ]
              }}>
              <Path fill={saveFillColors[2]} strokeWidth='2' stroke={borderColor} d="M41.2872335,12.7276117 L29.7883069,12.7903081 L27.2375412,17.3851541 L29.7064808,21.6614827 L41.4403118,22.0040892 L41.2872335,12.7276117 Z" id="Rectangle-Copy-8" transform="translate(34.305930, 17.372037) rotate(-60.000000) translate(-34.305930, -17.372037) "></Path>
              <Path fill={saveFillColors[2]} strokeWidth='2' stroke={borderColor} d="M18.187442,34.0982957 L17.56609,34.4570335 L14.9405857,39.1865106 L17.4056535,43.4561333 L29.1519238,43.5234076 L29.1519238,34.5079474 L18.187442,34.0982957 Z" id="Rectangle-Copy-10" transform="translate(22.008975, 38.809773) rotate(120.000000) translate(-22.008975, -38.809773) "></Path>
              <Path fill={saveFillColors[1]} strokeWidth='2' stroke={borderColor} d="M8.80901699,23.5 L13.309017,32.5 L25,32.5 L25,23.5 L8.80901699,23.5 Z" id="Rectangle-Copy-6" transform="translate(16.750000, 28.000000) rotate(180.000000) translate(-16.750000, -28.000000) "></Path>
              <Path fill={saveFillColors[1]} strokeWidth='2' stroke={borderColor} d="M30.8456356,23.5 L35.7956356,32.5 L47.5,32.5 L47.5,23.5 Z" id="Rectangle-Copy-9"></Path>
              <Rect fill={saveFillColors[0]} strokeWidth='2' stroke={borderColor} id="Rectangle-Copy-7" transform="translate(28.000000, 28.000000) rotate(60.000000) translate(-28.000000, -28.000000) " x="8.5" y="23.5" width="39" height="9"></Rect>
            </Svg>
          </Animated.View>
        */}
        </RizzleButton>
        <RizzleButton
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          style={{
            paddingLeft: 0,
            transform: [{
              translateY: isCurrent ? this.state.visibleAnim.interpolate({
                inputRange: [0, 0.4, 0.6, 0.8, 1],
                outputRange: [0, 0, this.translateDistance * 1.2, this.translateDistance, this.translateDistance]
              }) : 0
            }]
          }}
          onPress={this.showShareActionSheet}
          >
          <Svg
            height='32'
            width='32'
            style={{
              position: 'absolute',
              left: 14,
              top: 7
            }}>
            <Path stroke={borderColor} strokeWidth={2} fill="none" transform="translate(1, 0)" d="M5,12 C4.71689466,12 4.34958605,12 4,12 C-4.54747351e-13,12 -4.54747351e-13,12.5662107 -4.54747351e-13,16 C-4.54747351e-13,20 -4.54747351e-13,22 -4.54747351e-13,26 C-4.54747351e-13,30 -4.54747351e-13,30 4,30 C8,30 10,30 14,30 C18,30 18,30 18,26 C18,22 18,24 18,17 C18,12 17.9526288,12.0459865 14,12 C13.4028116,11.9930521 13.7719806,12 13,12"/>
            <Path stroke={borderColor} strokeWidth={2} d="M10,18.25 L10,1" strokeLinecap="round"/>
            <Path stroke={borderColor} strokeWidth={2} d="M10,1 L16,7" strokeLinecap="round"/>
            <Path stroke={borderColor} strokeWidth={2} d="M10,1 L4,7" strokeLinecap="round"/>
          </Svg>
        </RizzleButton>
        <RizzleButton
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          startToggleAnimation={this.startToggleAnimationMercury}
          style={{
            paddingLeft: 2,
            transform: [{
              translateY: isCurrent ? this.state.visibleAnim.interpolate({
                inputRange: [0, 0.6, 0.8, 1],
                outputRange: [0, 0, this.translateDistance * 1.2, this.translateDistance]
              }) : 0
            }]
          }}
          onPress={isMercuryButtonEnabled ? this.onMercuryPress : () => false}
        >
          <Svg
            style={{
              position: 'absolute',
              left: 7,
              top: 8,
              opacity: isMercuryButtonEnabled ? 1 : 0.3
            }}
            height='32'
            width='34'>
            { showMercuryContent ?
              <Fragment>
                <Rect stroke={borderColor} strokeWidth="2" fill="none" opacity="0.5" x="2" y="4" width="14" height="24" rx="2"></Rect>
                <Path stroke={borderColor} d="M5,9 L13,9"  opacity="0.5" strokeLinecap="square"></Path>
                <Path stroke={borderColor} d="M5,11 L13,11" opacity="0.5" strokeLinecap="square"></Path>
                <Rect stroke={borderColor} strokeWidth="2" fill={backgroundColor} x="14" y="1" width="16" height="29" rx="2"></Rect>
                <Path stroke={borderColor} d="M17,6 L27,6" strokeLinecap="square"></Path>
                <Path stroke={borderColor} d="M17,8 L27,8" strokeLinecap="square"></Path>
                <Path stroke={borderColor} d="M17,12 L27,12" strokeLinecap="square"></Path>
                <Path stroke={borderColor} d="M17,14 L27,14" strokeLinecap="square"></Path>
                <Path stroke={borderColor} d="M17,10 L27,10" strokeLinecap="square"></Path>
                <Path stroke={borderColor} d="M17,16 L27,16" strokeLinecap="square"></Path>
                <Path stroke={borderColor} d="M17,18 L27,18" strokeLinecap="square"></Path>
                <Path stroke={borderColor} d="M17,20 L27,20" strokeLinecap="square"></Path>
                <Path stroke={borderColor} d="M17,22 L27,22" strokeLinecap="square"></Path>
                <Path stroke={borderColor} d="M17,24 L27,24" strokeLinecap="square"></Path>
              </Fragment> :
              <Fragment>
                <Rect stroke={borderColor} strokeWidth="2" opacity="0.5" fill="none" x="16" y="4" width="14" height="24" rx="2"></Rect>
                <Path stroke={borderColor} d="M17,8 L27,8" opacity="0.5" strokeLinecap="square"></Path>
                <Path stroke={borderColor} d="M17,12 L27,12" opacity="0.5" strokeLinecap="square"></Path>
                <Path stroke={borderColor} d="M17,14 L27,14" opacity="0.5" strokeLinecap="square"></Path>
                <Path stroke={borderColor} d="M17,10 L27,10" opacity="0.5" strokeLinecap="square"></Path>
                <Path stroke={borderColor} d="M17,16 L27,16" opacity="0.5" strokeLinecap="square"></Path>
                <Path stroke={borderColor} d="M17,18 L27,18" opacity="0.5" strokeLinecap="square"></Path>
                <Path stroke={borderColor} d="M17,20 L27,20" opacity="0.5" strokeLinecap="square"></Path>
                <Path stroke={borderColor} d="M17,22 L27,22" opacity="0.5" strokeLinecap="square"></Path>
                <Path stroke={borderColor} d="M17,24 L27,24" opacity="0.5" strokeLinecap="square"></Path>
                <Rect stroke={borderColor} strokeWidth="2" fill={backgroundColor} x="2" y="1" width="16" height="29" rx="2"></Rect>
                <Path stroke={borderColor} d="M6,9 L14,9" strokeLinecap="square"></Path>
                <Path stroke={borderColor} d="M6,11 L14,11" strokeLinecap="square"></Path>
              </Fragment>
            }
          </Svg>
          {/*}
          <Animated.View style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 48,
            height: 48,
            borderRadius: 25,
            padding: 9,
            opacity: this.getMercuryToggleOpacity(item, isCurrent),
            backgroundColor: activeColor
          }}>
            <Svg
              height='30'
              width='30'>
              <Path d="M10.5,1.5 L32.5,1.5" stroke={backgroundColor} strokeWidth="3" strokeLinecap="square"></Path>
              <Path d="M10.5,7.5 L32.5,7.5" stroke={backgroundColor} strokeWidth="3" strokeLinecap="square"></Path>
              <Rect fill={backgroundColor} x="0" y="0" width="7" height="9"></Rect>
              <Path d="M0.5,13.5 L32.5,13.5" stroke={backgroundColor} strokeWidth="3" strokeLinecap="square"></Path>
              <Path d="M0.5,19.5 L32.5,19.5" stroke={backgroundColor} strokeWidth="3" strokeLinecap="square"></Path>
              <Path d="M0.5,25.5 L32.5,25.5" stroke={backgroundColor} strokeWidth="3" strokeLinecap="square"></Path>
              <Path d="M0.5,31.5 L32.5,31.5" stroke={backgroundColor} strokeWidth="3" strokeLinecap="square"></Path>
            </Svg>
          </Animated.View>
          */}
        </RizzleButton>
      </Animated.View>
    )
  }

  getMercuryToggleOpacity (item, isCurrent) {
    if (isCurrent) {
      return this.state.toggleAnimMercury
    } else {
      return item && item.showMercuryContent ? 1 : 0
    }
  }

  getSavedToggleOpacity (item, isCurrent) {
    if (isCurrent) {
      return this.state.toggleAnimSaved
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
