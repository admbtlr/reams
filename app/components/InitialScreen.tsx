import React, { useEffect } from 'react'
import {
  Animated,
  Dimensions,
  Linking,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import NavButton from './NavButton'
import { hslString } from '../utils/colors'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import { fontSizeMultiplier, getInset, getMargin, getStatusBarHeight } from '../utils'
import { textInfoBoldStyle, textInfoStyle } from '../utils/styles'
import { ItemType, SET_DISPLAY_MODE } from '../store/items/types'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { RootState } from 'store/reducers'
import { useNavigation } from '@react-navigation/native'

export default function InitialScreen({}) {
  const scrollAnim = new Animated.Value(0)
  const backend = useSelector((state: RootState) => !!state.user.backends.find(b => b.name === 'feedbin') ? 'feedbin' : 'reams')
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)
  const isOnboarding = useSelector((state: RootState) => state.config.isOnboarding)
  const isPortrait = useSelector((state: RootState) => state.config.orientation === 'portrait')
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode)
  const hasFeeds = useSelector((state: RootState) => state.feeds.feeds.length > 0)
  const dispatch = useDispatch()
  const navigation = useNavigation()

  useEffect(() => {
    redirectToItems(false, true)
  }, [])

  useEffect(() => {
    if (!backend || backend === '') {
      // navigation.setOptions({
      //   headerStyle: {
      //     backgroundColor: hslString('logo1'),
      //     // https://github.com/react-navigation/react-navigation/issues/6899
      //     shadowOffset: { height: 0, width: 0 }
      //   }
      // })
    } else {
      redirectToItems()
    }
  }, [isOnboarding, backend])

  const redirectToItems = (gotoFeeds = false, useTimeout = false) => {
    let args: string[] = []
    if (isOnboarding) {
      args = ['Items']
    } else if (backend) {
      if (displayMode === ItemType.saved) {
        args = ['Feeds', 'Items']
      } else if (gotoFeeds) {
        args = ['Feeds', 'Items', 'Feeds']
      } else if (hasFeeds) {
        args = ['Feeds', 'Items']
      }
    }

    const setNav = (navigation, args: string[]) => {
      if (navigation.canGoBack()) {
        navigation.popToTop()
      }
      args.forEach(arg => navigation.navigate(arg))
    }

    if (useTimeout) {
      setTimeout(() => setNav(navigation, args), 300)
    } else {
      setNav(navigation, args)
    }
  }

  // componentDidMount () {
  //   const { backend, isOnboarding, navigation } = this.props
  //   if (isOnboarding) {
  //     this.redirectToItems()
  //   } else if (!backend || backend === '') {
  //     navigation.setOptions({
  //       headerStyle: {
  //         backgroundColor: hslString('logo1'),
  //         // https://github.com/react-navigation/react-navigation/issues/6899
  //         shadowOffset: { height: 0, width: 0 }
  //       }
  //     })
  //   }
  // }

  // componentDidUpdate (prevProps) {
  //   const { backend, hasFeeds, isOnboarding, navigation } = this.props
  //   if (isOnboarding) {
  //     // this.redirectToItems()
  //   }    
  //   if (prevProps.backend === '' && backend !== '') {
  //     this.redirectToItems(!hasFeeds, true)
  //   }
  //   if (backend?.length  > 0) {
  //     navigation.setOptions({
  //       headerStyle: {
  //         backgroundColor: hslString('rizzleBG'),
  //         height: getStatusBarHeight(),
  //         shadowOffset: { height: 0, width: 0 }
  //       }
  //     })
  //   }
  // }

  const width = Dimensions.get('window').width
  const buttonWidth = width > 950 ?
    600 :
    '100%'

  const margin = getMargin()
  const height = Dimensions.get('window').height
  const textStyles = (color) => ({
    ...textInfoStyle(color),
    marginTop: margin,
    marginBottom: margin,
    marginLeft: 0,
    marginRight: 0,
    // padding: 8 * fontSizeMultiplier(),
  })
  const italicStyles = {
    fontFamily: 'IBMPlexSans-Italic'
  }
  const textTipStyles = (color) => ({
    ...textStyles(color),
    fontSize: 18 * fontSizeMultiplier(),
    lineHeight: 26 * fontSizeMultiplier(),
    marginTop: 0,
    marginBottom: 0,
    color
  })
  const textTipStylesBold = (color) => ({
    ...textTipStyles(color),
    fontFamily: 'IBMPlexSans-Bold'
  })

  // console.log(Config)

  return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: hslString('rizzleBG'),
          marginBottom: 0
        }}
        testID='initial-screen'
      >
        <StatusBar
          showHideTransition="slide"
          barStyle="dark-content" />
        <View style={{
          // marginBottom: 64,
          minHeight: height - 55 - 64,
          width: width - getInset() * (isPortrait ? 2 : 4),
          marginHorizontal: getInset() * (isPortrait ? 1 : 2)
        }}>
          <View>
            <NavButton
              hasTopBorder={true}
              hasBottomBorder={true}
              icon={getRizzleButtonIcon('rss', hslString('rizzleText'))}
              onPress={() => {
                dispatch({
                  type: SET_DISPLAY_MODE,
                  displayMode: 'unread'
                })
                navigation.navigate('Feeds')
              }}
              scrollAnim={scrollAnim}
              index={0}
              text='Feeds'
              viewStyle={{ paddingLeft: 5 }}
            />
            <NavButton
              hasBottomBorder={true}
              icon={getRizzleButtonIcon('saved', hslString('rizzleText'), hslString('rizzleBG'))}
              onPress={() => {
                dispatch({
                  type: SET_DISPLAY_MODE,
                  displayMode: 'saved'
                })
                navigation.navigate('Feeds')
              }}
              scrollAnim={scrollAnim}
              index={1}
              text='Library'
              viewStyle={{ paddingLeft: 5 }}
            />
            <NavButton
              hasBottomBorder={true}
              icon={getRizzleButtonIcon('highlights', hslString('rizzleText'), hslString('rizzleBG'))}
              onPress={() => {
                navigation.navigate('Highlights')
              }}
              scrollAnim={scrollAnim}
              index={1}
              text='Highlights'
              viewStyle={{ paddingLeft: 5 }}
            />
          </View>
        <NavButton
          hasBottomBorder={true}
          icon={getRizzleButtonIcon('account', hslString('rizzleText'))}
          onPress={() => {
            navigation.navigate('Account')
          }}
          scrollAnim={scrollAnim}
          index={0}
          text='Accounts'
          viewStyle={{ paddingLeft: 5 }}
        />
        <NavButton
          hasBottomBorder={true}
          icon={getRizzleButtonIcon('settings', hslString('rizzleText'))}
          onPress={() => {
            navigation.navigate('Settings')
          }}
          scrollAnim={scrollAnim}
          index={0}
          text='Settings'
          viewStyle={{ paddingLeft: 5 }}
        />
        <View style={{
          position: 'absolute',
          bottom: getMargin() * 2,
          width: '100%',
          alignItems: 'center',
        }}>
          {/* <Image 
            source={require('../assets/images/ream-sepia.png')} 
            style={{
              alignSelf: 'center',
              width: 246,
              height: 217,
              marginBottom: getMargin(),
            }}
          /> */}
          <Text style={{
            ...textInfoStyle('rizzleText'),
            marginBottom: getMargin() * 0.5,
          }}>Questions? Feedback?</Text>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:hello@reams.app')}>
            <Text style={{
              ...textInfoStyle('rizzleText'),
              textDecorationLine: 'underline',  
              marginBottom: getMargin() * 2,
            }}>hello@reams.app</Text>
          </TouchableOpacity>
          <Text style={{
            ...textInfoBoldStyle('rizzleText'),
            // marginBottom: getMargin() * 0.5,
          }}>Deeply Superficial</Text>
        </View>
      </View>
    </View>
  )
}
