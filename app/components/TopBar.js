import { ItemType } from '../store/items/types'
import React, { Fragment } from 'react'
import {
  Animated,
  Dimensions,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { CommonActions } from '@react-navigation/native'
import Svg, {Circle, G, Rect, Path } from 'react-native-svg'
import LinearGradient from 'react-native-linear-gradient'
import FeedIconContainer from '../containers/FeedIcon'
import { id, isIphoneX, fontSizeMultiplier } from '../utils'
import { hslString } from '../utils/colors'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'

export const STATUS_BAR_HEIGHT = (70 * fontSizeMultiplier()) + (isIphoneX() ? 44 : 22)

/* Props:
- clampedAnimatedValue
- displayMode *
- feedFilter *
- index
- isDarkMode *
- isOnboarding *
- isVisible
- item
- navigation
- numItems
- opacityAnim
- openFeedModal
- setDisplayMode *
- showModal *
- titleTransformAnim

(* = container)
*/

class TopBar extends React.Component {
  static whyDidYouRender = true

  constructor (props) {
    super(props)
    this.props = props

    this.screenWidth = Dimensions.get('window').width
    this.screenHeight = Dimensions.get('window').height

    this.onDisplayPress = this.onDisplayPress.bind(this)
  }


  shouldComponentUpdate (nextProps, nextState) {
    return this.props.item._id !== nextProps.item._id ||
      this.props.item.feed_title !== nextProps.feed_title ||
      this.props.item.feed_color !== nextProps.feed_color ||
      this.props.opacityAnim !== nextProps.opacityAnim
  }

  render () {
    const {
      clampedAnimatedValue,
      displayMode,
      item,
      opacityAnim,
      scrollAnim,
      titleTransformAnim,
      isOnboarding,
      isVisible,
      index,
      numItems
    } = this.props

    // if (isVisible) {
    //   console.log('Visible item: ' + item.title)
    // }

    return isOnboarding ? null :
    (
      <View>
        <Animated.View
          key={item ? item._id : id()}
          pointerEvents={isVisible ? 'auto' : 'none'}
          style={{
            ...this.getStyles().textHolder,
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            // height: 281 + STATUS_BAR_HEIGHT,
            opacity: opacityAnim,
            overflow: 'hidden',
            // paddingTop: 80,
            position: 'absolute',
            // top: isIphoneX() ? -240 : -260,
            shadowOffset: {
              width: 0,
              height: 1
            },
            shadowRadius: 1,
            shadowOpacity: 0.1,
            shadowColor: 'rgba(0, 0, 0, 1)',
            transform: [{
              translateY: isVisible ? clampedAnimatedValue : 0
            }]
          }}
        >
          <Animated.View style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: this.getBackgroundColor(item),
            opacity: this.getBackgroundOpacityAnim(item, scrollAnim)
          }}>
            { displayMode === ItemType.saved &&
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={[hslString('logo1'), hslString('logo2')]}
                style={{
                  position: 'absolute',
                  height: 5,
                  width: '100%',
                  top: STATUS_BAR_HEIGHT - 5,
                  left: 0
                }}
              />
            }
          </Animated.View>
          <BackButton
            navigation={this.props.navigation}
            isSaved={displayMode === ItemType.saved}
          />
          <View style={{
            top: isIphoneX() ? 44 : 22,
            flex: 1,
            marginLeft: 80 * fontSizeMultiplier(),
            marginRight: 80 * fontSizeMultiplier()
          }}>
            <TouchableOpacity
              key={`inner-{id()}`}
              onPress={() => {
                if (isOnboarding || displayMode === ItemType.saved) return
                this.props.openFeedModal()
              }}
              style={{
                backgroundColor: 'transparent',
                height: 70 * fontSizeMultiplier(),
              }}>
              <Animated.View style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                height: 64 * fontSizeMultiplier(),
                marginTop: 0,
                marginLeft: 0,
                marginRight: 0,
                transform: [{
                  translateY: titleTransformAnim || 0
                }]
              }}>
                { item && item.hasCachedFeedIcon &&
                  <View style={{marginTop: 2}}>
                    <FeedIconContainer
                      id={item.feed_id}
                      dimensions={item.feedIconDimensions}
                      bgColor={this.getBackgroundColor(item)}
                    />
                  </View>
                }
                <View style={{
                  flexDirection: 'column',
                  marginTop: 0
                }}>
                  <Text
                    style={{
                      ...this.getStyles().feedName,
                      fontSize: 14 * fontSizeMultiplier(),
                      fontFamily: this.props.feedFilter ?
                        'IBMPlexSansCond-Bold' :
                        'IBMPlexSansCond',
                      color: this.getForegroundColor(),
                      textAlign: item && item.hasCachedFeedIcon ?
                        'left' : 'center'
                    }}
                  >{displayMode === ItemType.saved ?
                    'Saved Stories' :
                    this.props.feedFilter ?
                      'Filtered Stories' :
                      'Unread Stories'} • { index + 1 } / { numItems }</Text>
                  <Text
                    numberOfLines={2}
                    ellipsizeMode='tail'
                    style={{
                      ...this.getStyles().feedName,
                      fontSize: 18 * fontSizeMultiplier(),
                      lineHeight: 22 * fontSizeMultiplier(),
                      fontFamily: this.props.feedFilter ?
                        'IBMPlexSansCond-Bold' :
                        'IBMPlexSansCond-Bold',
                      // color: this.getBorderBottomColor(item)
                      color: this.getForegroundColor(),
                      // height: 36,
                      // paddingBottom: 15,
                      textAlign: item && item.hasCachedFeedIcon ?
                        'left' : 'center',
                      textDecorationLine: displayMode === ItemType.saved ? 'none' : 'underline'
                    }}
                  >
                    {item ? item.feed_title : 'Rizzle'}
                  </Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>
          <DisplayModeToggle
            displayMode={displayMode}
            backgroundColor={this.getBackgroundColor(item, false)}
            buttonColor={this.getForegroundColor()}
            onDisplayPress={() => {
              this.onDisplayPress()
            }}
          />
      </Animated.View>
    </View>)
  }

  getBackgroundOpacityAnim (item, scrollAnim, allowTransparent = true) {
    if (item && item.showCoverImage && item.styles && !item.styles.isCoverInline && allowTransparent
      && this.props.displayMode != ItemType.saved) {
      return scrollAnim.interpolate({
        inputRange: [0, STATUS_BAR_HEIGHT, STATUS_BAR_HEIGHT + 50],
        outputRange: [0, 0, 1]
      })
    } else {
      return 1
    }
  }

  getBackgroundColor (item) {
    let feedColor = item ? item.feed_color : null
    // if (item && item.showCoverImage && item.styles && !item.styles.isCoverInline && allowTransparent) {
    //   feedColor = 'transparent'
    // }
    const bgColor = this.props.displayMode == ItemType.saved ?
      hslString('rizzleBG') :
      (feedColor ?
        hslString(feedColor, 'desaturated') :
        hslString('rizzleSaved'))
    return bgColor
  }

  getForegroundColor (item) {
    return this.props.displayMode == ItemType.saved ?
      (this.props.isDarkMode ?
        'hsl(0, 0%, 80%)' :
        hslString('rizzleText')) :
        'white'
  }

  getBorderBottomColor (item) {
    const feedColor = item ? item.feed_color : null
    return this.props.displayMode == ItemType.saved ?
      hslString('rizzleSaved') :
      (feedColor ?
        hslString(feedColor) :
        hslString('rizzleSaved'))
  }

  getHamburgerColor (item) {
    return this.props.displayMode == ItemType.saved ?
      this.getForegroundColor() :
      'rgba(255, 255, 255, 0.6)'
  }

  onDisplayPress () {
    const { displayMode, isOnboarding, setDisplayMode, showModal } = this.props
    const modalText = displayMode == ItemType.saved ?
      [
        {
          text: 'You are now in unread mode',
          style: ['title']
        },
        {
          text: 'This is where you can see all the unread stories in your feed',
          style: []
        }
      ] :
      [
        {
          text: 'You are now in saved mode',
          style: ['title']
        },
        {
          text: 'This is where you can see all the stories you’ve saved, either from your feed or using the Rizzle share extension',
          style: []
        }
      ]
    if (!isOnboarding) {
      setDisplayMode(displayMode === ItemType.unread ? ItemType.saved : ItemType.unread)
      this.props.navigation.dispatch((state) => {
        // remove or insert feeds screen, as required
        const routes = displayMode === ItemType.unread ?
          [state.routes[0], state.routes[2]] :
          [state.routes[0], { name: 'Feeds' }, state.routes[1]]
        return CommonActions.reset({
          ...state,
          routes,
          index: routes.length - 1,
        })
      })
    }
    showModal({
      modalText,
      modalHideCancel: true,
      modalName: 'modal_switch_view',
      modalShow: true,
      modalHideable: true,
      modalOnOk: () => {
        const x = 'y'
        console.log('Gone')
      }
    })
  }

  getStyles() {
    return {
      topBar: {
        // flex: 1,
        position: 'absolute',
        top: 0,
        height: isIphoneX() ? 44 : 22,
        width: '100%',
      },
      textHolder: {
        // flex: 1,
        position: 'absolute',
        top: 0,
        width: '100%',
        flexDirection: 'row',
        height: STATUS_BAR_HEIGHT,
        // overflow: 'hidden',
        backgroundColor: 'transparent',
        // shadowColor: '#000000',
        // shadowRadius: 1,
        // shadowOpacity: 0.1,
        // shadowOffset: {
        //   height: 1,
        //   width: 0
        // }
        zIndex: -1
      },
      feedName: {
        // flex: 1,
        color: hslString('rizzleFG'),
        fontSize: 20 * fontSizeMultiplier(),
        fontFamily: 'IBMPlexMono',
        textAlign: 'center',
        marginLeft: 5
      },
      feedActions: {
        flex: 1,
        color: hslString('rizzleFG'),
        fontSize: 20 * fontSizeMultiplier(),
        // fontFamily: 'AvenirNext-Regular',
        fontFamily: 'IBMPlexMono',
        fontFamily: 'IBMPlexMono',
        height: 36 * fontSizeMultiplier(),
        textAlign: 'center',
        padding: 10
      }
    }
  }
}

const FeedsHamburger = ({ onPress, hamburgerColor }) => (<Animated.View
    style={{
      position: 'absolute',
      zIndex: 5,
      right: 19,
      bottom: 18
    }}
  >
    <TouchableOpacity
      style={{
        width: 30,
        height: 28,
        borderRadius: 14
      }}
      onPress={onPress}
    >
      <Svg
        height='22'
        width='30'>
        <Circle
          cx="4"
          cy="10"
          r="3"
          strokeWidth={2}
          stroke="none"
          fill={hamburgerColor}
        />
        <Circle
          cx="14"
          cy="10"
          r="3"
          strokeWidth={2}
          stroke="none"
          fill={hamburgerColor}
        />
        <Circle
          cx="24"
          cy="10"
          r="3"
          strokeWidth={2}
          stroke="none"
          fill={hamburgerColor}
        />
      </Svg>
    </TouchableOpacity>
  </Animated.View>)


const DisplayModeToggle = ({ displayMode, onDisplayPress, backgroundColor, buttonColor }) => {
  // const savedIcon = <Svg width="32px" height="32px" viewBox="0 0 32 32">
  //     <G strokeWidth="1"  stroke='none' fill="none" fillRule="evenodd">
  //       <G transform="translate(-1.000000, -3.000000)">
  //         <G transform="translate(1.000000, 3.000000)">
  //           <Path fill={buttonColor} d="M2,6 L2,27 C2,28.65 3.4,30 5.11111111,30 L26.8888889,30 C28.6071081,30 30,28.6568542 30,27 L30,6 M0,5 C0,5.00566956 0,4.33900289 0,3 C0,0.991495663 0.444444444,4.4408921e-15 3,4.4408921e-15 L29,4.4408921e-15 C31.5555556,4.4408921e-15 32,1 32,3 L32,5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  //           <Rect stroke={backgroundColor} fill='rgba(255, 255, 255, 0.8)' transform="translate(16.000000, 17.500000) rotate(120.000000) translate(-16.000000, -17.500000) " x="7.5" y="15.5" width="17" height="4" />
  //           <Rect stroke={backgroundColor} fill='white' x="7.5" y="15.5" width="17" height="4" />
  //           <Rect stroke={backgroundColor} fill='white' transform="translate(16.000000, 17.500000) rotate(60.000000) translate(-16.000000, -17.500000) " x="7.5" y="15.5" width="17" height="4" />
  //         </G>
  //       </G>
  //     </G>
  //   </Svg>
  const savedIcon = getRizzleButtonIcon('saved', buttonColor, backgroundColor)
  const unreadIcon = <Svg width="30px" height="26px" viewBox="0 0 30 26">
    <G stroke="none" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <G transform="translate(-2.000000, -8.000000)" strokeWidth="2">
        <G transform="translate(3.000000, 3.000000)">
          <Path stroke={buttonColor} strokeWidth="2" d="M0,22 L0,27 C0,28.65 1.4,30 3.11111111,30 L24.8888889,30 C26.6071081,30 28,28.6568542 28,27 L28,22" />
          <Path strokeOpacity="0.7" stroke={buttonColor} strokeWidth="1" d="M3,24 L25,24 M3,27 L25,27 M3,18 L25,18 M3,21 L25,21 M3,12 L25,12 M3,15 L25,15 M3,6 L25,6 M3,9 L25,9" />
        </G>
      </G>
    </G>
  </Svg>

  return (
    <Animated.View style={{
      position: 'absolute',
      right: 15 * fontSizeMultiplier(),
      bottom: 10 * fontSizeMultiplier(),
      width: 32,
      height: 38,
      zIndex: 10,
    }}>
      <TouchableOpacity
        onPress={() => {
          onDisplayPress()
        }}
        style={{
          borderRadius: 14,
          // backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }}
      >
        { displayMode === ItemType.unread ? savedIcon : unreadIcon }
      </TouchableOpacity>
    </Animated.View>
  )
}

const BackButton = ({ isSaved, navigation: { navigate } }) => (
  <Animated.View style={{
    position: 'absolute',
    left: 0,
    bottom: 8 * fontSizeMultiplier(),
    width: 32,
    height: 48,
    paddingRight: 50
  }}>
    <TouchableOpacity
      onPress={() => {
        navigate(isSaved ? 'Account' : 'Feeds')
      }}
      style={{
        paddingBottom: 10,
        paddingLeft: 0,
        paddingRight: 50,
        paddingTop: 10        
      }}
    >
      { getRizzleButtonIcon('back', isSaved ?
          'black' : 'white', 'transparent', true, false) }
    </TouchableOpacity>
  </Animated.View>
)

export const getTopBarHeight = () => STATUS_BAR_HEIGHT// +
  // (isIphoneX() ? 44 : 22)

export default TopBar
