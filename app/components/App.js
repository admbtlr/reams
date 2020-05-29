import React, { useEffect } from 'react'
import { 
  createStackNavigator, 
  HeaderStyleInterpolators,
  TransitionPresets 
} from '@react-navigation/stack'

import ItemsScreen from './ItemsScreen'
import AccountScreenContainer from '../containers/AccountScreen'
import FeedsScreenContainer from '../containers/FeedsScreen'
import Headring from './Heading'
import NewFeedsList from './NewFeedsList'
import ModalScreen from './ModalScreen'

import {STATUS_BAR_HEIGHT} from './TopBar'
import { hslString } from '../utils/colors'
import { useNavigation } from '@react-navigation/native';
import { fontSizeMultiplier } from '../utils'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'

const navigationOptions = {
  gesturesEnabled: false
}

// const FeedStack = createStackNavigator(
//   {
//     Main: { screen: FeedsScreenContainer },
//     NewFeedsList: { screen: NewFeedsList },
//     Modal: {
//       screen: ModalScreen,
//       navigationOptions: {
//         gestureResponseDistance: {
//           vertical: 100
//         }
//       }
//     }
//   },
//   {
//     mode: 'modal',
//     headerMode: 'none',
//     transparentCard: true,
//     cardOverlayEnabled: true
//   }
// )

// const MainStack = createStackNavigator()
//   {
//     Account: { screen: AccountScreenContainer },
//     Feeds: { screen: FeedStack },
//     Items: { screen: ItemsScreenContainer }
//   },
//   {
//     initialRouteName: 'Items',
//     headerMode: 'none',
//     navigationOptions
//   }
// )

// const AppStack = createStackNavigator(
//   {
//     App: { screen: MainStack },
//     ModalWithGesture: {
//       screen: ModalScreen,
//       navigationOptions: {
//         gestureResponseDistance: {
//           vertical: 400
//         }
//       }
//     }
//   },
//   {
//     mode: 'modal',
//     headerMode: 'none',
//     transparentCard: true,
//     cardOverlayEnabled: true
//   }
// )

const FeedsStack = createStackNavigator()
const AppStack = createStackNavigator()
const MainStack = createStackNavigator()

const Feeds = () => (
  <FeedsStack.Navigator
    initialRouteName='Feeds Screen'
    mode='modal'
    screenOptions={{
      headerShown: false
    }}
  >
    <FeedsStack.Screen
      name='Feeds Screen'
      component={FeedsScreenContainer} 
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

const Main = () => (
  <MainStack.Navigator
    // headerMode='screen'
    initialRouteName='Account'
    options={{
      gesturesEnabled: false
    }}
    screenOptions={{
      headerStyle: {
        backgroundColor: hslString('rizzleBG'),
        height: STATUS_BAR_HEIGHT,
        // https://github.com/react-navigation/react-navigation/issues/6899
        shadowOffset: { height: 0, width: 0 }
      },
      headerTintColor: hslString('rizzleText'),
      headerTitleStyle: {
        color: hslString('rizzleText'),
        fontFamily: 'PTSerif-Bold',
        fontSize: 32 * fontSizeMultiplier(),
        lineHeight: 36 * fontSizeMultiplier(),
      },
      headerBackTitleStyle: {
        color: hslString('rizzleText'),
        fontFamily: 'IBMPlexSans'
      }
    }}
  >
    <MainStack.Screen
      name='Account'
      component={AccountScreenContainer}
      options={{
        title: 'Your Account',
        headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
        headerBackImage: getRizzleButtonIcon('account'),
      }} />
    <MainStack.Screen
      name='Feeds'
      component={Feeds}
      options={{
        title: 'Your Feeds',
        headerStyleInterpolator: HeaderStyleInterpolators.forUIKit
      }} />
    <MainStack.Screen
      name='Items'
      component={ItemsScreen}
      options={{
        headerShown: false
      }} />
  </MainStack.Navigator>
)

export default App = () => {
  return (
    <AppStack.Navigator
      initialRouteName='Main'
      mode='modal'
      screenOptions={{
        headerShown: false
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
// export default createAppContainer(TheStack)
