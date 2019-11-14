import React from 'react'
import {
  Easing
} from 'react-native'
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'

import ItemsScreenContainer from '../containers/ItemsScreen.js'
import AccountScreenContainer from '../containers/AccountScreen.js'
import FeedsScreenContainer from '../containers/FeedsScreen.js'
import ModalScreen from './ModalScreen.js'
// import { FluidNavigator } from 'react-navigation-fluid-transitions'

const navigationOptions = {
  gesturesEnabled: false
}

const AppStack = createStackNavigator(
  {
    Account: { screen: AccountScreenContainer },
    Feeds: { screen: FeedsScreenContainer },
    Items: { screen: ItemsScreenContainer }
  },
  {
    initialRouteName: 'Items',
    headerMode: 'none',
    // transitionConfig,
    navigationOptions
  }
)

const RootStack = createStackNavigator(
  {
    Main: {
      screen: AppStack
    },
    Modal: {
      screen: ModalScreen,
      navigationOptions: {
        gestureResponseDistance: {
          vertical: 1000
        }
      }
    }
  },
  {
    mode: 'modal',
    headerMode: 'none',
    transparentCard: true,
    cardOverlayEnabled: true,
    onTransitionEnd: () => {
      console.log(AppStack)
    }
  }
)

export default createAppContainer(RootStack)
