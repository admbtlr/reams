import React, { useEffect, useState } from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { View, Text, ScrollView, useWindowDimensions, ScaledSize, Touchable, TouchableOpacity, Image, Animated, LayoutAnimation } from 'react-native'
import { hslString } from '../../utils/colors'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store/reducers'
import { ItemType, SET_DISPLAY_MODE } from '../../store/items/types'
import {
  textInfoStyle,
} from '../../utils/styles'
import { getRizzleButtonIcon } from '../../utils/rizzle-button-icons'
import FeedsScreen from '../FeedsScreen'
import HighlightsScreen from '../HighlightsScreen'
import AccountScreenContainer from '../../containers/AccountScreen'
import SettingsScreen from '../SettingsScreen'
import { createStackNavigator } from '@react-navigation/stack'
import ItemsScreen from './ItemsScreen'
import Onboarding from './Onboarding'
import { useSession } from '../AuthProvider'
import NewFeedsList from '../NewFeedsList'
import ModalScreen from '../ModalScreen'
import { createStaticNavigation } from '@react-navigation/native'
import { useSharedValue, withTiming } from 'react-native-reanimated'
import { TOP_BAR_HEIGHT } from './ItemView'
export const DRAWER_WIDTH = 300

const title = 'Reams: Serious, joyful and open reading'

export default function Main() {
  const isOnboarding = useSelector((state: RootState) => state.config.isOnboarding)
  const session = useSession()
  const dimensions: ScaledSize = useWindowDimensions()

  if (isOnboarding && !session.session) return <Onboarding />

  const AppDrawer = createDrawerNavigator({
    drawerContent: props => <MenuBar {...props} />,
    screenOptions: {
      drawerStyle: {
        width: 55 //'100%'
      },
      drawerType: 'permanent',
      headerShown: false,
      animation: 'none'
    },
    screens: {
      Feeds: {
        screen: Feeds,
        navigationOptions: {
          title
        }
      },
      Library: {
        screen: Feeds,
        navigationOptions: {
          title
        }
      },
      Highlights: {
        screen: HighlightsScreen,
        navigationOptions: {
          title: 'Highlights'
        }
      },
      Account: {
        screen: AccountScreenContainer,
        navigationOptions: {
          title: 'Account'
        }
      },
      Settings: {
        screen: SettingsScreen,
        navigationOptions: {
          title: 'Settings'
        }
      }
    }
  })

  const Navigation = createStaticNavigation(AppDrawer)

  return (
    <View style={{
      flex: 1,
      flexDirection: 'row',
      backgroundColor: hslString('white'),
      height: dimensions.height,
    }}>
      <Navigation />
    </View>
  )
}

// const SideBar = ({navigation}) => (
//   <View style={{
//     flexDirection: 'row',
//     flex: 1,
//     backgroundColor: hslString('rizzleBG'),
//   }}>
//     <MenuBar navigation={navigation} />
//     {/* <ItemsList navigation={navigation} /> */}
//   </View>
// )

const MenuBar = ({ navigation }) => {
  const dimensions: ScaledSize = useWindowDimensions()
  const dispatch = useDispatch()
  const state = navigation.getState()

  const isActive = (label: string) => label === state.routeNames[state.index]

  const sections = [
    { icon: 'rss', label: 'Feeds', action: { type: SET_DISPLAY_MODE, displayMode: ItemType.unread } },
    { icon: 'saved', label: 'Library', action: { type: SET_DISPLAY_MODE, displayMode: ItemType.saved } },
    { icon: 'highlights', label: 'Highlights' },
    { icon: 'account', label: 'Account' },
    { icon: 'settings', label: 'Settings' },
  ].map(s => ({ ...s, isActive: isActive(s.label) }))
  // .sort((a, b) => a.isActive ? -1 : b.isActive ? 1 : 0)

  return (
    <View style={{
      flex: -1,
      height: dimensions.height,
      width: 55,
      backgroundColor: hslString('rizzleBG'),
      opacity: 0.95,
      paddingTop: 0,
      paddingHorizontal: 0,
      borderRightColor: hslString('rizzleText', undefined, 0.3),
      borderRightWidth: 1,
    }}>
      {
        sections.map((button, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              navigation.navigate(button.label)
              if (button.action) {
                setTimeout(() => {
                  dispatch(button.action)
                }, 100)
              }
            }}
            style={{
              width: 55,
              justifyContent: 'center',
              alignItems: 'center',
              borderBottomWidth: 1,
              paddingVertical: 10,
              backgroundColor: isActive(button.label) ? hslString('rizzleText') : hslString('rizzleBG'),
              borderColor: hslString('rizzleText', undefined, 0.3),
              borderRightWidth: 1,
              height: TOP_BAR_HEIGHT
            }}
          >
            {getRizzleButtonIcon(button.icon, isActive(button.label) ? hslString('rizzleBG') : hslString('rizzleText'), undefined, true, false, 0.9)}
            <Text style={{
              ...textInfoStyle(),
              fontSize: 10,
              color: isActive(button.label) ? hslString('rizzleBG') : hslString('rizzleText')
            }}>{button.label}</Text>
          </TouchableOpacity>

        ))
      }
    </View>
  )
}

const FeedsStack = createStackNavigator()

const Feeds = ({ navigation }) => {
  return (
    <FeedsStack.Navigator
      initialRouteName='Feed'
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <FeedsStack.Screen
        name='Feed'
        screenOptions={{
          title
        }}
        component={FeedsScreen}
      />
      <FeedsStack.Screen
        name='Items'
        component={ItemsScreen}
        options={{
          title
        }}
      />
      <FeedsStack.Screen
        name='New Feeds List'
        screenOptions={{
          title
        }}
        component={NewFeedsList}
      />
      <FeedsStack.Screen
        name='ModalWithGesture'
        component={ModalScreen}
        options={{
          transparentCard: true,
          cardOverlayEnabled: true,
          cardStyle: {
            backgroundColor: 'transparent'
          },
          // ...TransitionPresets.ModalPresentationIOS
        }}
        navigationOptions={{
          gestureResponseDistance: {
            vertical: 800
          }
        }}
        screenOptions={{
          title
        }}
      />
      <FeedsStack.Screen
        name='Modal'
        component={ModalScreen}
        navigationOptions={{
          gestureResponseDistance: {
            vertical: 300
          }
        }}
        screenOptions={{
          title
        }}
      />
    </FeedsStack.Navigator>
  )
}
