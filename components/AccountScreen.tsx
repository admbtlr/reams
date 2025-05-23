import React, { useState, useEffect, useRef } from 'react'
import {
  Animated,
  Dimensions,
  Image,
  PixelRatio,
  Platform,
  StatusBar,
  Text,
  View
} from 'react-native'
import { KeyboardAwareScrollView as KAScrollView } from 'react-native-keyboard-aware-scrollview'
import TextButton from './TextButton'
import AccountCredentialsForm from './AccountCredentialsForm'
import { useSelector, useDispatch } from 'react-redux'
import { SET_EXTRA_BACKEND, SET_SIGN_IN_EMAIL } from '@/store/config/types'
import { SET_BACKEND, UNSET_BACKEND } from '@/store/user/types'

// Type assertions to help TypeScript
type AnyComponent = any
// For component type safety
const TypedAccountCredentialsForm = AccountCredentialsForm as any
import { hslString } from '@/utils/colors'
import { getRizzleButtonIcon } from '@/utils/rizzle-button-icons'
import { getStatusBarHeight } from '@/utils/dimensions'
import { getMargin } from '@/utils/dimensions'
import { getInset } from '@/utils/dimensions'
import { fontSizeMultiplier } from '@/utils/dimensions'
import { textInfoStyle } from '@/utils/styles'
import { ItemType } from '@/store/items/types'
import { useNavigation } from '@react-navigation/native'
import useHeaderStyle from '../hooks/useHeaderStyle'

// Type annotations for components with TypeScript
type AccountCredentialsFormProps = {
  navigation: any
  service: string
  setBackend: (backend: string, credentials: any) => void
  unsetBackend: (backend: string) => void
  user: any
  isActive: boolean
}

// Define RootState type for TypeScript
interface RootState {
  user: {
    backends?: Array<{ name: string }>
  }
  itemsMeta: {
    display: string
  }
  ui: {
    isDarkMode: boolean
  }
  config: {
    orientation: string
    isOnboarding: boolean
  }
  feeds: {
    feeds: Array<any>
  }
}

const AccountScreen: React.FC = () => {
  // Replace props with useSelector
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.user)
  const isFeedbin = useSelector((state: RootState) => !!state.user.backends?.find(b => b.name === 'feedbin'))
  const isReadwise = useSelector((state: RootState) => !!state.user.backends?.find(b => b.name === 'readwise'))
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode)
  const isPortrait = useSelector((state: RootState) => state.config.orientation === 'portrait')
  const hasFeeds = useSelector((state: RootState) => state.feeds.feeds.length > 0)
  const isOnboarding = useSelector((state: RootState) => state.config.isOnboarding)

  // Extract backend from user backends (null if none exists)
  const backend = user.backends && user.backends.length > 0 ? user.backends[0].name : null

  const scrollAnim = new Animated.Value(0)
  const [expandedBackend, setExpandedBackend] = useState(backend ? null : 'basic')
  const navigation = useNavigation()

  useHeaderStyle()

  // Define dispatch functions that were previously in mapDispatchToProps
  const setBackend = (backend: string, credentials: any) => {
    dispatch({
      type: UNSET_BACKEND
    })
    dispatch({
      type: SET_BACKEND,
      backend,
      credentials
    })
  }

  const unsetBackend = (backend: string) => {
    dispatch({
      type: UNSET_BACKEND,
      backend
    })
  }

  const setExtraBackend = (backend: string, credentials: any) => {
    dispatch({
      type: SET_EXTRA_BACKEND,
      backend,
      credentials
    })
  }

  const unsetExtraBackend = (backend: string) => {
    dispatch({
      type: SET_EXTRA_BACKEND,
      backend
    })
  }

  const setSignInEmail = (email: string) => {
    dispatch({
      type: SET_SIGN_IN_EMAIL,
      email
    })
  }

  const setDisplayMode = (displayMode: string) => {
    dispatch({
      type: 'SET_DISPLAY_MODE',
      displayMode
    })
  }

  const redirectToItems = (gotoFeeds = false, useTimeout = false) => {
    let args: string[] = []
    if (backend) {
      if (displayMode === ItemType.saved) {
        args = ['Items']
      } else if (gotoFeeds) {
        args = ['Feed', 'Items', 'Feed']
      } else {
        args = ['Feed', 'Items']
      }
    }

    const setNav = (navigation: any, args: string[]) => {
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

  useEffect(() => {
    // No direct equivalent to componentDidMount since we check prevProps in the class version
    // The commented code is left out as it was commented in the original too
  }, [])

  useEffect(() => {
    // This effect mimics componentDidUpdate, but we need some prev value reference
    if (backend && backend.length > 0) {
      navigation.setOptions({
        headerStyle: {
          backgroundColor: hslString('rizzleBG'),
          height: getStatusBarHeight(),
          shadowOffset: { height: 0, width: 0 }
        }
      })
    }
  }, [backend, navigation])

  const prevBackendRef = useRef<String | null>(backend)
  useEffect(() => {
    prevBackendRef.current = backend
  }, [backend])
  useEffect(() => {
    return () => {
      if ((prevBackendRef.current === '' || prevBackendRef.current === null) &&
        !(backend === '' || backend === null)) {
        redirectToItems(!hasFeeds, true)
      }
      prevBackendRef.current = backend || ''
    }
  }, [backend, hasFeeds])


  const width = Dimensions.get('window').width
  const buttonWidth = width > 950 ? 600 : '100%'

  const margin = getMargin()
  const height = Dimensions.get('window').height

  const textStyles = (color?: string) => ({
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

  const textTipStyles = (color?: string) => ({
    ...textStyles(color),
    fontSize: 18 * fontSizeMultiplier(),
    lineHeight: 26 * fontSizeMultiplier(),
    marginTop: 0,
    marginBottom: 0,
    color
  })

  const textTipStylesBold = (color?: string) => ({
    ...textTipStyles(color),
    fontFamily: 'IBMPlexSans-Bold'
  })

  const HelpView: React.FC<{ children: React.ReactNode, title?: string, style?: any }> = ({ children, title, style }) => (
    <View style={{
      padding: getMargin(),
      backgroundColor: hslString('logo1'),
      marginLeft: -getMargin() * 2,
      marginRight: -getMargin() * 2,
      marginTop: 0 - getStatusBarHeight(),
      marginBottom: getMargin() * 2,
      paddingTop: getStatusBarHeight() + getMargin() * 2,
      minHeight: getStatusBarHeight() + getMargin() + 200,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      ...style
    }}>
      <Image
        source={require('../assets/images/feeds-screen-onboarding-bg.png')}
        style={{
          alignSelf: 'center',
          width: 200 / 311 * 1238,
          height: 200,
          marginLeft: 0 - getMargin(),
          position: 'absolute',
          top: getStatusBarHeight() + getMargin(),
        }}
      />
      <View style={{
        // flex: 1,
        marginTop: 0,
        paddingTop: 0,
        alignItems: 'center',
        paddingHorizontal: getMargin() * 2,
        maxWidth: 600 - getMargin() * 2,
      }}>
        {children}
      </View>
    </View>
  )

  const Separator: React.FC<{ title: string }> = ({ title }) => (
    <View style={{
      borderTopColor: hslString('rizzleText', '', 0.5),
      borderTopWidth: 1 / PixelRatio.get(),
      marginVertical: margin,
      paddingTop: margin / 2,
      // flex: 1,
      flexDirection: 'row',
      // justifyContent: 'space-between',
    }}>
      <Text style={{
        ...textInfoStyle(),
        fontFamily: 'IBMPlexSans-Bold',
        fontSize: 22 * fontSizeMultiplier(),
        padding: 0,
        marginLeft: 0,
        flex: 4
      }}>{title}</Text>
    </View>
  )

  const isBackendActive = (service: string) => service === 'readwise'
    ? isReadwise
    : service === 'feedbin' ?
      isFeedbin :
      true

  let gradientIndex = 0
  const getAttributes = (service: string) => {
    const bgColor = isBackendActive(service) ? hslString('logo1') : hslString('buttonBG')
    const fgColor = isBackendActive(service) ? 'white' : hslString('rizzleText')
    const isActive = isBackendActive(service)
    return {
      borderColor: isBackendActive(service) && hslString('logo1'),
      buttonStyle: {
        alignSelf: 'center',
        marginBottom: getMargin() * 2,
        // width: buttonWidth
      },
      iconBg: true,
      iconCollapsed: getRizzleButtonIcon(service, fgColor, bgColor),
      iconExpanded: getRizzleButtonIcon(service, fgColor, bgColor),
      isExpandable: true,
      isExpanded: isBackendActive(service) || expandedBackend === service,
      isInverted: isBackendActive(service),
      isGradient: isBackendActive(service),
      gradientIndex: gradientIndex++,
      fgColor: isBackendActive(service) && hslString('logo1'),
      onExpand: () => setExpandedBackend(service),
      expandedView: (
        <TypedAccountCredentialsForm
          navigation={navigation}
          service={service}
          setBackend={setBackend}
          unsetBackend={unsetBackend}
          user={user}
          isActive={isActive}
        />
      ),
      testID: `${service}-button`
    }
  }

  return (
    <View style={
      Platform.OS === 'web' ?
        {
          flex: 1,
          backgroundColor: hslString('rizzleBG'),
          paddingTop: getStatusBarHeight(),
        } : {}
    }>
      {React.createElement(KAScrollView as AnyComponent, {
        showsVerticalScrollIndicator: false,
        // We can't use these with TypeScript currently:
        // onScroll: Animated.event(
        //   [{ nativeEvent: {
        //     contentOffset: { y: scrollAnim }
        //   }}],
        //   {
        //     useNativeDriver: true
        //   }
        // ),
        // scrollEventThrottle: 1,
        style: {
          backgroundColor: hslString('rizzleBG')
        }
      },
        <View
          style={{
            alignItems: 'center',
            alignSelf: Platform.OS === 'web' ? 'center' : undefined,
            flex: 1,
            justifyContent: 'center',
            maxWidth: Platform.OS === 'web' ? 600 : undefined,
          }}
          testID='account-screen'
        >
          {Platform.OS === 'ios' &&
            <StatusBar
              showHideTransition="slide"
              barStyle="dark-content" />}
          <View style={{
            // marginBottom: 64,
            minHeight: height - 55 - 64,
            width: Platform.OS === 'web' ?
              600 :
              width - getInset() * (isPortrait ? 2 : 4),
            marginHorizontal: getInset() * (isPortrait ? 1 : 2),
            marginTop: getMargin() * 2,
          }}>
            <TextButton
              text={'Reams'}
              {...getAttributes('reams')}
            />
            <Separator title='Highlights' />
            <TextButton
              text={'Readwise'}
              {...getAttributes('readwise')}
            />
          </View>
        </View>
      )}
    </View>
  )
}

export default AccountScreen
