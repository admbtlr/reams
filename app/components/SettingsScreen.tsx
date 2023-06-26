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
import { DarkModeSetting, SET_DARK_MODE_SETTING, SHOW_MODAL } from '../store/ui/types'
import FeedIconContainer from '../containers/FeedIcon'
import RadioButtons from './RadioButtons'
import { Direction, SET_ITEM_SORT } from '../store/config/types'
import { SORT_ITEMS } from '../store/items/types'

export default function SettingsScreen ({ navigation }) {
  const dispatch = useDispatch()
  const itemSort = useSelector((state: RootState) => state.config.itemSort)
  const darkModeSetting = useSelector((state: RootState) => state.ui.darkModeSetting)
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode)
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
  const darkModeButtons = [
    { 
      value: Direction.desc,
      label: 'Light',
      icon: 'sun'
     },
     { 
      value: Direction.asc,
      label: 'Dark',
      icon: 'moon'
     },
     { 
      value: Direction.rnd,
      label: 'System',
      icon: 'dark-mode'
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
  const setDarkMode = (darkModeSetting: DarkModeSetting) => {
    dispatch({
      type: SET_DARK_MODE_SETTING,
      darkModeSetting 
    })
  }
  const SettingBlock = ({ children, title }) => (
    <View style={{
      backgroundColor: hslString('white'),
      borderRadius: getMargin(),
      borderColor: hslString('rizzleText'),
      borderWidth: 1,
      marginVertical: getMargin() * 0.5,
      padding: getMargin(),
      paddingTop: getMargin() * .5
    }}>
      <Text style={{
        fontFamily: 'IBMPlexSans',
        fontSize: 18 * fontSizeMultiplier(),
        textAlign: 'center',
        marginBottom: getMargin() * .5
      }}>{ title }</Text>
      <View style={{
        // flex: 1,
        flexDirection: 'row',
      }}>
        { children }
      </View>
    </View>
  )

  return (
    <View style={{
      flex: 1,
      backgroundColor: hslString('rizzleBG'),
      padding: getMargin(),
    }}>
      <SettingBlock 
        children={<RadioButtons data={sortButtons} selected={itemSort} onSelect={sortItems}/>}
        title='Sort articles'
      />
      <SettingBlock 
        children={<RadioButtons data={darkModeButtons} selected={darkModeSetting} onSelect={setDarkMode}/>}
        title='Dark mode'
      />
    </View>
  )
}

const {height, width} = Dimensions.get('screen')

