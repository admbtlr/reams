import React from 'react'
import {
  Easing
} from 'react-native'

import ItemsScreen from './ItemsScreen.js'
import AccountScreen from './AccountScreen.js'
import FeedsScreenContainer from '../containers/FeedsScreen.js'
import { FluidNavigator } from 'react-navigation-fluid-transitions'

const transitionConfig = {
  duration: 300,
  // timing: Animated.timing,
  easing: Easing.out(Easing.elastic(1)),
  // useNativeDriver: true
}

const navigationOptions = {
  gesturesEnabled: false
}

export default FluidNavigator(
  {
    Account: {screen: AccountScreen},
    Feeds: {screen: FeedsScreenContainer},
    Items: {screen: ItemsScreen},
  },
  {
    initialRouteName: 'Feeds',
    transitionConfig,
    navigationOptions
  }
)
