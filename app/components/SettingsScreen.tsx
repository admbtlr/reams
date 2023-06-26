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
import { SORT_ITEMS } from '../store/items/types'

export default function SettingsScreen ({ navigation }) {
  const dispatch = useDispatch()
  const itemSort = useSelector((state: RootState) => state.config.itemSort)
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
  const sortItems = (itemSort: number) => {
    dispatch({
      type: SET_ITEM_SORT,
      itemSort
    })
    dispatch({
      type: SORT_ITEMS
    })
  }
  return (
    <View style={{
      flex: 1,
      backgroundColor: hslString('rizzleBG'),
      padding: getMargin(),
    }}>
      <View style={{
        backgroundColor: hslString('white'),
        borderRadius: getMargin(),
        borderColor: hslString('rizzleText'),
        borderWidth: 1,
        marginVertical: getMargin() * 0.25,
        padding: getMargin(),
        paddingTop: getMargin() * .5
      }}>
        <Text style={{
          fontFamily: 'IBMPlexSans',
          fontSize: 18 * fontSizeMultiplier(),
          textAlign: 'center',
          marginBottom: getMargin() * .5
        }}>Sort articles</Text>
        <View style={{
          // flex: 1,
          flexDirection: 'row',
        }}>
          <RadioButtons data={sortButtons} selected={itemSort} onSelect={sortItems}/>
        </View>
      </View>
    </View>
  )
}

const {height, width} = Dimensions.get('screen')

