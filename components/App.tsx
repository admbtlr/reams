import React, { useEffect } from 'react'
import {
  CardStyleInterpolators,
  createStackNavigator,
  HeaderStyleInterpolators,
  TransitionPresets
} from '@react-navigation/stack'
import { useDispatch, useSelector } from 'react-redux'
import ItemsScreen from './ItemsScreen'
import FeedsScreen from './FeedsScreen'
import NewFeedsList from './NewFeedsList'
import ModalScreen from './ModalScreen'
import { hslString } from '../utils/colors'
import { fontSizeMultiplier, getMargin, getStatusBarHeight } from '../utils/dimensions'
import { Animated, Dimensions, Platform, useWindowDimensions, View } from 'react-native'
import InitialScreen from './InitialScreen'
import HighlightsScreen from './HighlightsScreen'
import { CLEAR_MESSAGES } from '../store/ui/types'
import SettingsScreen from './SettingsScreen'
import { default as MainWeb } from './web/Main'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import { WebFontsLoader } from './WebFontsLoader'
import Login from './Login'
import Subscribe from './Subscribe'
import { RootState } from '../store/reducers'
import { createComponentForStaticNavigation, createStaticNavigation, useNavigation } from '@react-navigation/native'
import FeedExpandedContainer from '../containers/FeedExpanded'
import AccountScreen from './AccountScreen'
import { createDrawerNavigator } from '@react-navigation/drawer'
import DrawerButton from './DrawerButton'
import CustomDrawerContent from './CustomDrawerContent'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import TopBars from './ItemCarousel/TopBars'
import { AnimationProvider } from './ItemCarousel/AnimationContext'


const MainStack = createStackNavigator()

export const headerOptions = {
  headerTransparent: true,
  headerBlurEffect: 'regular',
  headerShadowVisible: false,

  // headerStyle: {
  //   // backgroundColor: hslString('rizzleBG'),
  //   height: getStatusBarHeight(),
  //   // https://github.com/react-navigation/react-navigation/issues/6899
  //   shadowColor: 'transparent',
  //   elevation: 0,
  // },
  headerTintColor: hslString('rizzleText'),
  headerTitleStyle: {
    color: hslString('rizzleText'),
    fontFamily: 'IBMPlexSerif-Light',
    fontSize: 24 * fontSizeMultiplier(),
    fontWeight: 'light',
    lineHeight: 24 * fontSizeMultiplier(),
  },
  headerBackTitleStyle: {
    color: hslString('rizzleText'),
    fontFamily: 'IBMPlexSerif-Light'
  },
  headerBackButtonDisplayMode: 'minimal',
}

const App = (): JSX.Element => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch({
      type: CLEAR_MESSAGES
    })
  }, [])

  if (Platform.OS === 'web') {
    return (
      <WebFontsLoader fallback={<View />}>
        <MainWeb />
      </WebFontsLoader>
    )
  }

  const drawerButton = () => {
    const navigation = useNavigation()
    return <View>
      <DrawerButton isLight={false} onPress={() => navigation.openDrawer()} />
    </View>
  }

  const drawerIcon = (name, { focused, color, size }) => (
    <View style={{
      opacity: 0.7,
      width: size + getMargin() / 2
    }}>
      {getRizzleButtonIcon(name, color)}
    </View>
  )

  const modalOptions = {
    headerShown: false,
    gestureEnabled: true,
    cardOverlayEnabled: true,
    ...TransitionPresets.ModalPresentationIOS,
    presentation: 'modal'
  }

  const itemsOptions = ({ route }) => {
    type ItemsRouteParams = {
      feedCardHeight: number
      feedCardWidth: number
      feedCardX?: number
      feedCardY?: number
      toItems?: boolean
    }

    const { feedCardHeight, feedCardWidth, feedCardX, feedCardY, toItems } = (route?.params as ItemsRouteParams) || {}
    const dimensions = Dimensions.get('window')
    const translateY = feedCardY ?
      feedCardY + feedCardHeight / 2 - dimensions.height / 2 :
      0
    const translateX = feedCardX ?
      feedCardX + feedCardWidth / 2 - dimensions.width / 2 :
      0
    return {
      cardStyleInterpolator: toItems ?
        ({ closing, current, next }) => {
          // I use closing so that I can do fancy stuff with the translateX
          // feeds screen has to act like normal, items screen is custom
          let anim = Animated.add(current.progress, Animated.multiply(closing, new Animated.Value(5)))
          anim = next ? Animated.add(anim, Animated.multiply(next.progress, 1)) : anim
          return {
            cardStyle: {
              borderRadius: anim.interpolate({
                inputRange: [0, 1, 2],
                outputRange: [48, 0, 0],
                extrapolate: 'clamp',
              }),
              opacity: anim.interpolate({
                inputRange: [0, 0.2, 1, 2],
                outputRange: [0, 1, 1, 1],
                extrapolate: 'clamp',
              }),
              transform: [
                {
                  translateX: anim.interpolate({
                    inputRange: [0, 1, 2, 3, 5, 6],
                    outputRange: [translateX, 0, dimensions.width * -0.3, 0, dimensions.width, 0],
                    extrapolate: 'clamp'
                  })
                },
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: [translateY, 0, 0],
                    extrapolate: 'clamp'
                  })
                },
                {
                  scaleX: anim.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: [feedCardWidth / dimensions.width, 1, 1],
                    extrapolate: 'clamp',
                  })
                },
                {
                  scaleY: anim.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: [feedCardHeight / dimensions.height, 1, 1],
                    extrapolate: 'clamp',
                  }),
                }
              ],
            }
          }
        } :
        CardStyleInterpolators.forHorizontalIOS,
      gestureEnabled: false,
      headerShown: false,
      // headerTransparent: true,
      // need to do this to hide the back button when using height: 0
      // it might not work on Android
      // https://stackoverflow.com/questions/54613631/how-to-hide-back-button-in-react-navigation-react-native
      headerLeft: () => <></>,
      title: '',
      cardStyle: {
        backgroundColor: 'transparent'
      }
    }
  }

  const createFeedStack = (isSaved = false) => {
    return createNativeStackNavigator({
      initialRouteName: isSaved ? 'Library' : 'Feed',
      screenOptions: {
        gestureEnabled: false,
        headerStyleInterpolator: HeaderStyleInterpolators.forUIKit
        // animation: 'slide_from_right'
      },
      screens: {
        Feed: {
          initialParams: { isSaved: false },
          screen: FeedsScreen,
          options: {
            // ...headerOptions,
            // headerShown: false,
            headerLeft: (props) => drawerButton(props),
          }
        },
        Library: {
          initialParams: { isSaved: true },
          screen: FeedsScreen,
          options: {
            // ...headerOptions,
            // headerShown: false,
            headerLeft: (props) => drawerButton(props)
          }
        },
        NewFeedsList: {
          screen: NewFeedsList,
          options: modalOptions
        },
        FeedExpanded: {
          screen: FeedExpandedContainer,
          options: {
            ...modalOptions,
            headerShown: false
          }
        },
        Items: {
          screen: ItemsScreen,
          options: {
            headerShown: false
            // headerTransparent: true,
            // headerBlurEffect: 'light',
            // animation: 'slide_from_bottom',
            // headerTitle: () => <TopBars emitter={() => null} isTitleOnly={true} />,
            // headerTitleStyle: {
            //   fontFamily: 'IBMPlexSans',
            //   fontSize: 20,
            //   fontWeight: 'normal',
            //   color: 'white'
            // }
          }
          // options: itemsOptions
        },
        Modal: {
          screen: ModalScreen,
          options: {
            headerShown: false
          }
        },
        Login: {
          screen: Login,
          options: modalOptions
        }
      }
    })
  }
  const HighlightStack = createNativeStackNavigator({
    options: {
      headerLeft: (props) => drawerButton(props),
      headerShown: false
    },
    screens: {
      Highlights: {
        screen: HighlightsScreen,
        options: {
          ...headerOptions,
          headerLeft: (props) => drawerButton(props)
        }
      }
    }
  })
  const AccountStack = createNativeStackNavigator({
    screens: {
      Account: {
        screen: AccountScreen,
        options: {
          ...headerOptions,
          headerLeft: (props) => drawerButton(props)
        }
      },
      Subscribe: {
        screen: Subscribe,
        options: modalOptions
      },
    }
  })
  const SettingsStack = createNativeStackNavigator({
    screens: {
      Settings: {
        screen: SettingsScreen,
        options: {
          ...headerOptions,
          headerLeft: (props) => drawerButton(props)
        }
      }
    }
  })

  const dimensions = useWindowDimensions()
  const isLargeScreen = dimensions.width >= 768

  const AppDrawer = createDrawerNavigator({
    screenOptions: {
      drawerInactiveTintColor: hslString('rizzleBG', 'strict'),
      drawerActiveBackgroundColor: hslString('rizzleBG', 'strict', 0.3),
      drawerActiveTintColor: hslString('rizzleBG', 'strict'),
      drawerStyle: {
        backgroundColor: hslString('logo1'),
        width: isLargeScreen ? 350 : '100%'
      },
      drawerItemStyle: {
        // marginBottom: getMargin() / 2,
        paddingVertical: getMargin() / 4
      },
      drawerLabelStyle: {
        color: hslString('rizzleBG', 'strict'),
        fontFamily: 'IBMPlexSans-Light',
        fontSize: 18,
        fontWeight: 'light'
      },
      headerShown: false,
      overlayColor: 'transparent'
    },
    drawerContent: (props) => <CustomDrawerContent {...props} />,
    screens: {
      Feed: {
        screen: createFeedStack(false),
        options: {
          drawerIcon: ({ focused, color, size }) => drawerIcon('rss', { focused, color, size })
        }
      },
      Library: {
        screen: createFeedStack(true),
        initialParams: { isSaved: true },
        options: {
          drawerIcon: ({ focused, color, size }) => drawerIcon('saved', { focused, color, size })
        }
      },
      Highlights: {
        screen: HighlightStack,
        options: {
          drawerIcon: ({ focused, color, size }) => drawerIcon('highlights', { focused, color, size }),
          headerShown: false
        }
      },
      Accounts: {
        screen: AccountStack,
        options: {
          drawerIcon: ({ focused, color, size }) => drawerIcon('account', { focused, color, size })
        }
      },
      Settings: {
        screen: SettingsStack,
        options: {
          drawerIcon: ({ focused, color, size }) => drawerIcon('settings', { focused, color, size })
        }
      }
    }
  })

  const AppStack = createStackNavigator({
    initialRouteName: 'Drawer',
    // screenOptions: {
    //   ...headerOptions,
    //   gestureEnabled: false,
    //   headerStyleInterpolator: HeaderStyleInterpolators.forUIKit
    //   // animation: 'slide_from_right'
    // },
    screens: {
      Drawer: {
        screen: AppDrawer,
        options: {
          headerShown: false
        }
      },
      Modal: {
        screen: ModalScreen,
        options: {
          headerShown: false
        }
      }
    }

  })

  const Navigation = createStaticNavigation(AppDrawer)

  console.log('RENDER APP')

  return <AnimationProvider>
    <Navigation />
  </AnimationProvider>

  // return (
  //   <AppStack.Navigator
  //     initialRouteName='Main'
  //     screenOptions={{
  //       cardStyle: {
  //         backgroundColor: hslString('rizzleBG')
  //       },
  //       headerShown: false,
  //       presentation: 'modal',
  //       animation: 'fade'
  //     }}
  //   >
  //     <AppStack.Screen
  //       name='Main'
  //       component={Main}
  //     />
  //     <AppStack.Screen
  //       name='ModalWithGesture'
  //       component={ModalScreen as React.ComponentType}
  //       options={{
  //         cardOverlayEnabled: true,
  //         cardStyle: {
  //           backgroundColor: 'transparent'
  //         },
  //         animation: 'slide_from_bottom',
  //         presentation: 'transparentModal'
  //       }}
  //     />
  //   </AppStack.Navigator>
  // )
}

export default App
