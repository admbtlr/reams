import React, { useEffect } from 'react'
import { 
  CardStyleInterpolators,
  createStackNavigator, 
  HeaderStyleInterpolators,
  TransitionPresets 
} from '@react-navigation/stack'
import { useDispatch } from 'react-redux'
import ItemsScreen from './ItemsScreen'
import AccountScreenContainer from '../containers/AccountScreen'
import FeedsScreen from './FeedsScreen'
import NewFeedsList from './NewFeedsList'
import ModalScreen from './ModalScreen'
import { hslString } from '../utils/colors'
import { fontSizeMultiplier, getStatusBarHeight } from '../utils'
import { Animated, Dimensions, Platform } from 'react-native'
import InitialScreen from './InitialScreen'
import HighlightsScreen from './HighlightsScreen'
import { CLEAR_MESSAGES } from '../store/ui/types'
import SettingsScreen from './SettingsScreen'
import {default as MainWeb} from './web/Main'

const FeedsStack = createStackNavigator()
const AppStack = createStackNavigator()
const MainStack = createStackNavigator()

const Feeds = () => (
  <FeedsStack.Navigator
    initialRouteName='Feeds Screen'
    screenOptions={{
      headerShown: false,
      presentation: 'modal'
    }}
  >
    <FeedsStack.Screen
      name='Feeds Screen'
      component={FeedsScreen} 
    />
    <FeedsStack.Screen
      name='New Feeds List'
      component={NewFeedsList}
    />
    <FeedsStack.Screen
      name='Modal'
      component={ModalScreen}
      navigationOptions={{
        gestureResponseDistance: {
          vertical: 300
        }
      }}
    />
  </FeedsStack.Navigator>
)

const Main = ({route}) => {
  return (
    <MainStack.Navigator
      // headerMode='screen'
      initialRouteName='Initial'
      options={{
        gesturesEnabled: false
      }}
      screenOptions={{
        headerStyle: {
          backgroundColor: hslString('rizzleBG', Platform.OS === 'android' ? 'darker': ''),
          height: getStatusBarHeight(),
          // https://github.com/react-navigation/react-navigation/issues/6899
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: hslString('rizzleText'),
        headerTitleStyle: {
          color: hslString('rizzleText'),
          fontFamily: 'PTSerif-Bold',
          fontSize: 32 * fontSizeMultiplier(),
          lineHeight: 36 * fontSizeMultiplier(),
        },
        // headerTransparent: true,
        headerBackTitleStyle: {
          color: hslString('rizzleText'),
          fontFamily: 'IBMPlexSans'
        }
      }}
    >
      <MainStack.Screen
        name='Initial'
        component={InitialScreen}
        options={{
          title: 'Already',
          headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
          // headerBackImage: getRizzleButtonIcon('account'),
        }} />
      <MainStack.Screen
        name='Account'
        component={AccountScreenContainer}
        options={{
          headerBackTitleVisible: false,
          title: 'Accounts',
          headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
          // headerBackImage: getRizzleButtonIcon('account'),
        }} />
      <MainStack.Screen
        name='Settings'
        component={SettingsScreen}
        options={{
          headerBackTitleVisible: false,
          title: 'Settings',
          headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
          // headerBackImage: getRizzleButtonIcon('account'),
        }} />
      <MainStack.Screen
        name='Feeds'
        component={Feeds}
        options={({route}) => {
          const toFeeds = route.params?.toFeeds
          return {
            title: route.params?.isSaved ? 'Library' : 'Feeds',
            headerBackTitleVisible: false,
            headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
            headerTransparent: true,
            }
          }
        }
      />
      <MainStack.Screen
        name='Items'
        component={ItemsScreen}
        options={({route}) => {
          const { feedCardHeight, feedCardWidth, feedCardX, feedCardY, toItems } = route?.params || {}
          const dimensions = Dimensions.get('window')
          const translateY = feedCardY ? 
            feedCardY + feedCardHeight / 2 - dimensions.height / 2 :
            0
          const translateX = feedCardX ?
            feedCardX + feedCardWidth / 2 - dimensions.width / 2 :
            0
          return {
            cardStyleInterpolator: toItems ? 
              ({ closing, current, next, index }) => {
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
              // headerStyleInterpolator: ({ closing, current: { progress } }) => {
              //   return {
              //     headerStyle: {
              //       opacity: progress.interpolate({
              //         inputRange: [0, 1],
              //         outputRange: [1, 1]
              //       })
              //     }
              //   }
              // },
              gestureEnabled: false,
              headerTransparent: true,
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
      />
      <MainStack.Screen
        name='Highlights'
        component={HighlightsScreen}
        options={({route}) => {
          return {
            title: 'Highlights',
            headerBackTitleVisible: false,
            headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
            headerTransparent: true,
            }
          }
        }
      />
    </MainStack.Navigator>
  )
}

export default App = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch({
      type: CLEAR_MESSAGES
    })
  }, [])

  if (Platform.OS === 'web') {
    return <MainWeb />
  }

  return (
    <AppStack.Navigator
      initialRouteName='Main'
      screenOptions={{
        cardStyle: {
          backgroundColor: hslString('rizzleBG')
        },
        headerShown: false,
        presentation: 'modal'
      }}
    >
      <AppStack.Screen
        name='Main'
        component={Main}
      />
      <AppStack.Screen
        name='ModalWithGesture'
        component={ModalScreen}
        options={{
          transparentCard: true,
          cardOverlayEnabled: true,
          cardStyle: {
            backgroundColor: 'transparent'
          },
          ...TransitionPresets.ModalPresentationIOS
        }}
        navigationOptions={{
          gestureResponseDistance: {
            vertical: 800
          }
        }}
      />
    </AppStack.Navigator>
  )
}
