import React, { useEffect, useState } from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { View, Text, ScrollView, useWindowDimensions, ScaledSize, Touchable, TouchableOpacity, Image, Animated } from 'react-native'
import { hslString } from '../../utils/colors'
import { getMargin } from '../utils/dimensions'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store/reducers'
import ItemTitle from '../../containers/ItemTitle'
import { Item, ItemType, MARK_ITEM_READ, SET_DISPLAY_MODE } from '../../store/items/types'
import {
  textInfoStyle,
} from '../../utils/styles'
import ButtonSet from '../ButtonSet'
import { getRizzleButtonIcon } from '../../utils/rizzle-button-icons'
import FeedsScreen from '../FeedsScreen'
import HighlightsScreen from '../HighlightsScreen'
import AccountScreen from '../AccountScreen'
import AccountScreenContainer from '../../containers/AccountScreen'
import SettingsScreen from '../SettingsScreen'
import ItemsList from './ItemsList'
import { createStackNavigator } from '@react-navigation/stack'
import ItemsScreen from './ItemsScreen'
import Onboarding from './Onboarding'
import { useSession } from '../AuthProvider'
import NewFeedsList from '../NewFeedsList'
import ModalScreen from '../ModalScreen'
export const DRAWER_WIDTH = 300

export default function Main() {
  const isOnboarding = useSelector((state: RootState) => state.config.isOnboarding)
  const session = useSession()
  const dimensions: ScaledSize = useWindowDimensions()

  if (isOnboarding && !session.session) return <Onboarding />

  const Drawer = createDrawerNavigator()
  const drawerAnim = new Animated.Value(DRAWER_WIDTH)
  // const drawerWidth

  return (
    <View style={{
      flex: 1,
      flexDirection: 'row',
      backgroundColor: hslString('white'),
      height: dimensions.height,
    }}>
      <Drawer.Navigator 
        drawerContent={props => <MenuBar {...props} />}
        screenOptions={{ 
          drawerStyle: {
            width: 55 //'100%'
          },
          drawerType: 'permanent',
          headerShown: false,
        }}>
        <Drawer.Screen name="Feeds" component={Feeds} />
        <Drawer.Screen name="Library" component={Feeds} />
        <Drawer.Screen name="Highlights" component={HighlightsScreen} />
        <Drawer.Screen name="Accounts" component={AccountScreenContainer} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
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

const MenuBar = ({navigation}) => {
  const dimensions: ScaledSize = useWindowDimensions()
  const dispatch = useDispatch()
  return (
    <View style={{
      flex: -1,
      height: dimensions.height,
      width: 55,
      backgroundColor: hslString('rizzleBG'),
      paddingTop: 10,
      paddingHorizontal: 5,
      borderRightColor: hslString('rizzleText', undefined, 0.1),
      borderRightWidth: 1,
    }}>
      {
        [
          { icon: 'rss', label: 'Feeds', action: { type: SET_DISPLAY_MODE, displayMode: ItemType.unread } },
          { icon: 'saved', label: 'Library', action: { type: SET_DISPLAY_MODE, displayMode: ItemType.saved }  },
          { icon: 'highlights', label: 'Highlights' },
          { icon: 'account', label: 'Accounts' },
          { icon: 'settings', label: 'Settings' },
        ].map((button, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              console.log(button.label)
              if (button.action) {
                dispatch(button.action)
              }
              navigation.navigate(button.label)
            }}
            style={{
              width: 45,
              justifyContent: 'center',
              alignItems: 'center',
              borderBottomColor: hslString('rizzleText', undefined, 0.1),
              borderBottomWidth: 1,
              paddingVertical: 10,
            }}
          >
            { getRizzleButtonIcon(button.icon, hslString('rizzleText'), undefined, true, false, 0.9) }
            <Text style={{
              ...textInfoStyle(),
              fontSize: 10,
            }}>{button.label}</Text>
          </TouchableOpacity>
  
        ))
      }
    </View>
  )
}

const FeedsStack = createStackNavigator()

const Feeds = ({navigation}) => {
  return (
    <FeedsStack.Navigator
      initialRouteName='Feeds List'
      screenOptions={{
        headerShown: false
      }}
      >
      <FeedsStack.Screen
        name='Feeds List'
        component={FeedsScreen}
      />
      <FeedsStack.Screen
        name='Items'
        component={ItemsScreen}
      />
      <FeedsStack.Screen
        name='New Feeds List'
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
}
