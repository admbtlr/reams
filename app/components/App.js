import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'

import ItemsScreenContainer from '../containers/ItemsScreen.js'
import AccountScreenContainer from '../containers/AccountScreen.js'
import FeedsScreenContainer from '../containers/FeedsScreen.js'
import NewFeedsList from './NewFeedsList'
import ModalScreen from './ModalScreen.js'

const navigationOptions = {
  gesturesEnabled: false
}

const FeedStack = createStackNavigator(
  {
    Main: { screen: FeedsScreenContainer },
    NewFeedsList: { screen: NewFeedsList },
    Modal: {
      screen: ModalScreen,
      navigationOptions: {
        gestureResponseDistance: {
          vertical: 100
        }
      }
    },
    ModalWithGesture: {
      screen: ModalScreen,
      navigationOptions: {
        gestureResponseDistance: {
          vertical: 400
        }
      }
    }
  },
  {
    mode: 'modal',
    headerMode: 'none',
    transparentCard: true,
    cardOverlayEnabled: true
  }
)

const AppStack = createStackNavigator(
  {
    Account: { screen: AccountScreenContainer },
    Feeds: { screen: FeedStack },
    Items: { screen: ItemsScreenContainer }
  },
  {
    initialRouteName: 'Items',
    headerMode: 'none',
    navigationOptions
  }
)

export default createAppContainer(AppStack)
