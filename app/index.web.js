import './wdyr'
import 'react-native-gesture-handler'

import { Text, View } from 'react-native'
import React from 'react'
import { AppRegistry } from 'react-native'
import {registerRootComponent} from 'expo'
import Onboarding from './components/Onboarding'
import InitialScreen from './components/InitialScreen'
import Rizzle from './components/Rizzle'

const HelloWorld = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Hello world!</Text></View>
)

registerRootComponent(Rizzle)
