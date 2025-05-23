import React, { useEffect } from 'react'
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
  DrawerContentComponentProps
} from '@react-navigation/drawer'
import { View, StyleSheet, Animated, Easing, Text } from 'react-native'
import { useDrawerStatus } from '@react-navigation/drawer'
import * as Application from 'expo-application'
import { hslString } from '../utils/colors'
import { getMargin } from '../utils/dimensions'
import { BackgroundGradient } from './BackgroundGradient'

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { state, navigation, descriptors } = props || {}
  const isDrawerOpen = useDrawerStatus() === 'open'

  // Create animation values for each possible item
  const animatedValues = React.useRef(
    Array(10).fill(0).map(() => new Animated.Value(0))
  ).current

  // Animate items when drawer status changes
  useEffect(() => {
    if (isDrawerOpen) {
      // Drawer is open - animate items in with staggered delay
      animatedValues.forEach((animation, i) => {
        Animated.timing(animation, {
          toValue: 1,
          duration: 300,
          delay: i * 100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        }).start()
      })
    } else {
      // Drawer is closing - animate items out quickly
      animatedValues.forEach(animation => {
        Animated.timing(animation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true
        }).start()
      })
    }
  }, [isDrawerOpen, animatedValues])

  // If there's no state or routes, render empty drawer content
  if (!state?.routes?.length) {
    return <DrawerContentScrollView {...props} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <BackgroundGradient index={3} />
      <DrawerContentScrollView {...props}>
        <View style={styles.container}>
          {state.routes.map((route, i) => {
            const { options } = descriptors?.[route.key] || {}
            const label =
              options.drawerLabel !== undefined
                ? options.drawerLabel
                : options.title !== undefined
                  ? options.title
                  : route.name

            const isFocused = state.index === i

            return (
              <Animated.View
                key={route.key}
                style={[
                  styles.itemContainer,
                  {
                    opacity: animatedValues[i],
                    transform: [
                      {
                        translateX: animatedValues[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [-150, 0]
                        })
                      }
                    ]
                  }
                ]}
              >
                <DrawerItem
                  label={label}
                  icon={options.drawerIcon}
                  focused={isFocused}
                  activeTintColor={options?.drawerActiveTintColor || hslString('rizzleBG')}
                  inactiveTintColor={options?.drawerInactiveTintColor || hslString('rizzleBG')}
                  activeBackgroundColor={options?.drawerActiveBackgroundColor || hslString('rizzleBG', undefined, 0.3)}
                  inactiveBackgroundColor={options?.drawerInactiveBackgroundColor}
                  labelStyle={options?.drawerLabelStyle || styles.labelStyle}
                  style={options?.drawerItemStyle}
                  onPress={() => {
                    // Emit drawer item press event
                    navigation.emit({
                      type: 'drawerItemPress',
                      target: route.key,
                      canPreventDefault: true,
                    })
                    navigation.navigate(route.name)
                  }}
                />
              </Animated.View>
            )
          })}
        </View>
      </DrawerContentScrollView>
      <View style={{
        position: 'absolute',
        bottom: getMargin() * 2,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{
          color: hslString('rizzleBG', 'strict'),
          fontSize: 36,
          fontFamily: 'IBMPlexSerif-Light'
        }}>Reams</Text>
        <Text style={{
          color: hslString('rizzleBG', 'strict'),
          fontSize: 14,
          fontFamily: 'IBMPlexMono-Light'
        }}>{Application.nativeApplicationVersion}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
  },
  itemContainer: {
    overflow: 'hidden',
    marginVertical: 2,
  },
  labelStyle: {
    fontFamily: 'IBMPlexSans-Light',
    fontSize: 16,
    fontWeight: '300'
  }
})

export default CustomDrawerContent
