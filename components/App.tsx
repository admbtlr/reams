import React, { useEffect } from 'react'
import {
  CardStyleInterpolators,
  createStackNavigator,
  HeaderStyleInterpolators,
  TransitionPresets
} from '@react-navigation/stack'
import { useDispatch, useSelector } from 'react-redux'
import ItemsScreen from './ItemsScreen'
import AccountScreenContainer from '../containers/AccountScreen'
import FeedsScreen from './FeedsScreen'
import NewFeedsList from './NewFeedsList'
import ModalScreen from './ModalScreen'
import { hslString } from '../utils/colors'
import { fontSizeMultiplier, getStatusBarHeight } from '../utils/dimensions'
import { Animated, Dimensions, Platform, TouchableOpacity, View } from 'react-native'
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
import { useDebug } from './DebugContext'
import { debugService } from '../utils/debug-service'
import { createComponentForStaticNavigation, createStaticNavigation, NavigationContainer } from '@react-navigation/native'
import FeedExpandedContainer from '../containers/FeedExpanded'
import AccountScreen from './AccountScreen'

const AppStack = createStackNavigator()
const MainStack = createStackNavigator()

const Main = () => {
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode)


  const FeedsStack = createStackNavigator({
    screenOptions: {
      // headerShown: false,
      ...headerOptions,
      gestureEnabled: true,
      cardOverlayEnabled: true,
      ...TransitionPresets.ModalPresentationIOS,
      presentation: 'modal'
    },
    screens: {
      FeedsScreen: {
        screen: FeedsScreen,
        options: {
          title: 'Feeds'
        }
      },
      NewFeedsList: {
        screen: NewFeedsList,
        options: {
          headerShown: false
        }
      },
      FeedExpanded: {
        screen: FeedExpandedContainer,
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

  const AccountStack = createStackNavigator({
    screenOptions: {
      // headerShown: false,
      ...headerOptions,
      gestureEnabled: true,
      cardOverlayEnabled: true,
      ...TransitionPresets.ModalPresentationIOS,
      presentation: 'modal'
    },
    screens: {
      Account: {
        screen: AccountScreen,
        options: {
          headerShown: false
        }
      },
      Subscribe: {
        screen: Subscribe,
        options: {
          headerShown: false
        }
      }
    }
  })

  const Feeds = createComponentForStaticNavigation(FeedsStack, 'Feeds')
  const Account = createComponentForStaticNavigation(AccountStack, 'Account')



  return (
    <MainStack.Navigator
      initialRouteName='Initial'
      screenOptions={{
        ...headerOptions,
        gestureEnabled: false,
        animation: 'slide_from_right'
      }}
    >
      <MainStack.Screen
        name='Initial'
        component={InitialScreen}
        options={{
          title: 'Reams',
          headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
          // headerBackImage: getRizzleButtonIcon('account'),
        }} />
      <MainStack.Screen
        name='Account'
        component={Account}
        options={{
          headerBackButtonDisplayMode: 'minimal',
          title: 'Accounts',
          headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
          // headerBackImage: getRizzleButtonIcon('account'),
        }} />
      <MainStack.Screen
        name='Settings'
        component={SettingsScreen}
        options={{
          headerBackButtonDisplayMode: 'minimal',
          title: 'Settings',
          headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
          // headerBackImage: getRizzleButtonIcon('account'),
        }} />
      <MainStack.Screen
        name='Feed'
        options={({ route }) => {
          type FeedRouteParams = {
            isSaved?: boolean
          }
          return {
            title: (route.params as FeedRouteParams)?.isSaved ? 'Library' : 'Feed',
            headerBackButtonDisplayMode: 'minimal',
            headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
            headerShown: false
          }
        }}
        component={Feeds}
      />
      <MainStack.Screen name='Items' component={HighlightsScreen} />
      {/* <MainStack.Screen
        name='Items'
        component={ItemsScreen}
        options={({ route }) => {
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
        }}
      /> */}
      <MainStack.Screen
        name='Highlights'
        component={HighlightsScreen}
        options={() => {
          return {
            title: 'Highlights',
            headerBackButtonDisplayMode: 'minimal',
            headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
            headerTransparent: true,
          }
        }
        }
      />
      <MainStack.Screen
        name='Subscribe'
        component={Subscribe}
        options={{
          headerShown: false,
          presentation: 'modal'
        }}
      />
      <MainStack.Screen
        name='Login'
        component={Login as React.ComponentType}
        options={{
          ...TransitionPresets.ModalPresentationIOS,
          cardOverlayEnabled: true,
          gestureEnabled: false,
          headerShown: false,
          presentation: 'modal'
        }}
      />

    </MainStack.Navigator>
  )
}


const App = (): JSX.Element => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch({
      type: CLEAR_MESSAGES
    })
  }, [])

  const debug = useDebug()
  React.useEffect(() => {
    if (debug) {
      debugService.setLogFunction(debug.addLog)
    }
  }, [debug])

  if (Platform.OS === 'web') {
    return (
      <WebFontsLoader fallback={<View />}>
        <MainWeb />
      </WebFontsLoader>
    )
  }

  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode)

  const headerOptions = {
    headerStyle: {
      backgroundColor: isDarkMode ? hslString('rizzleBG') : hslString('rizzleBG', Platform.OS === 'android' ? 'darker' : ''),
      height: getStatusBarHeight(),
      // https://github.com/react-navigation/react-navigation/issues/6899
      shadowColor: 'transparent',
      elevation: 0,
    },
    headerTintColor: hslString('rizzleText'),
    headerTitleStyle: {
      color: hslString('rizzleText'),
      fontFamily: 'IBMPlexSerif-Light',
      fontSize: 32 * fontSizeMultiplier(),
      fontWeight: 'light',
      lineHeight: 36 * fontSizeMultiplier(),
    },
    headerBackTitleStyle: {
      color: hslString('rizzleText'),
      fontFamily: 'IBMPlexSerif-Light'
    },
    headerBackButtonDisplayMode: 'minimal',
  }

  const modalOptions = {
    headerShown: false,
    gestureEnabled: true,
    cardOverlayEnabled: true,
    ...TransitionPresets.ModalPresentationIOS,
    presentation: 'modal'
  }

  const AppStack = createStackNavigator({
    initialRouteName: 'Initial',
    screenOptions: {
      ...headerOptions,
      gestureEnabled: false,
      headerStyleInterpolator: HeaderStyleInterpolators.forUIKit
      // animation: 'slide_from_right'
    },
    screens: {
      Feed: {
        screen: FeedsScreen,
        options: {
          title: 'Feed'
        }
      },
      NewFeedsList: {
        screen: NewFeedsList,
        options: modalOptions
      },
      FeedExpanded: {
        screen: FeedExpandedContainer,
        options: {
          headerShown: false
        }
      },
      Modal: {
        screen: ModalScreen,
        options: {
          headerShown: false
        }
      },
      Account: {
        screen: AccountScreen
      },
      Subscribe: {
        screen: Subscribe,
        options: modalOptions
      },
      Initial: {
        screen: InitialScreen,
        options: {
          title: 'Reams'
        }
      },
      Items: {
        screen: ItemsScreen,
        options: ({ route }) => {
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
      },
      Highlights: {
        screen: HighlightsScreen
      },
      Settings: {
        screen: SettingsScreen
      },
      Login: {
        screen: Login,
        options: modalOptions
      }
    }

  })

  const Navigation = createStaticNavigation(AppStack)

  return <Navigation />

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
