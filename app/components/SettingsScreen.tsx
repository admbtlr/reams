import React, { useState } from 'react'
import {
  StatusBar,
  StyleSheet,
  View,
  Dimensions,
  Animated,
  Button,
  Text,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Image
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { hslString } from '../utils/colors'
import { textInfoStyle, textInfoBoldStyle } from '../utils/styles'
import { RootState } from '../store/reducers'
import { Annotation, DELETE_ANNOTATION, EDIT_ANNOTATION } from '../store/annotations/types'
import { fontSizeMultiplier, getMargin, getStatusBarHeight } from '../utils'
import { dustbinIcon, noteIcon } from '../utils/icons'
import { SHOW_MODAL } from '../store/ui/types'
import FeedIconContainer from '../containers/FeedIcon'
import RadioButtons from './RadioButtons'
import { Direction, SET_ITEM_SORT } from '../store/config/types'

export default function SettingsScreen ({ navigation }) {
  const dispatch = useDispatch()
  const sortButtons = [
    { 
      value: Direction.desc,
      label: 'Newest first',
      icon: 'arrow-right'
     },
     { 
      value: Direction.asc,
      label: 'Oldest first',
      icon: 'arrow-left'
     },
     { 
      value: Direction.rnd,
      label: 'Random',
      icon: 'shuffle'
     },
  ]
  return (
    <View style={{
      flex: 1,
      backgroundColor: hslString('rizzleBG'),
      padding: getMargin()
    }}>
      <View style={{
        flex: 1,
      }}>
        <Text style={{
          ...textInfoStyle('rizzleText', 0),
          padding: 0
        }}>Sort articles</Text>
        <View style={{
          backgroundColor: hslString('white'),
          borderRadius: getMargin(),
          marginVertical: getMargin() * 0.25,
          // flex: 1,
          flexDirection: 'row',
          padding: getMargin()
        }}>
          <RadioButtons data={sortButtons} onSelect={(value) => dispatch({
            type: SET_ITEM_SORT,
            itemSort: value
          }) }/>
        </View>
      </View>
    </View>
  )
}

const {height, width} = Dimensions.get('screen')

