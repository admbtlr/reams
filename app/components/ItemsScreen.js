import { ItemType } from '../store/items/types'
import React from 'react'
import {
  StatusBar,
  StyleSheet,
  View,
  Dimensions
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useFocusEffect } from '@react-navigation/native'
import {
  ITEMS_SCREEN_BLUR,
  ITEMS_SCREEN_FOCUS
} from '../store/ui/types'
import ItemCarouselContainer from '../containers/ItemCarousel.js'
import RizzleImageViewerContainer from '../containers/RizzleImageViewer.js'
import { hslString } from '../utils/colors'

export default function ItemsScreen ({ navigation }) {
  const dispatch = useDispatch()
  const displayMode = useSelector(state => state.itemsMeta.display)
  const orientation = useSelector(state => state.config.orientation)

  const didFocus = () => {
    dispatch({
      type: ITEMS_SCREEN_FOCUS
    })
  }
  const didBlur = () => {
    dispatch({
      type: ITEMS_SCREEN_BLUR
    })
  }

  useFocusEffect(
    React.useCallback(() => {
      didFocus()
      return didBlur
    })
  )

  return (
    <View style={{
      flex: 1,
      backgroundColor: hslString('bodyBG')
    }}>
      <StatusBar
        showHideTransition="slide"
        barStyle={ displayMode === ItemType.saved ? 'dark-content' : 'light-content' }
        hidden={false} />
      <View style={styles.infoView} />
      <ItemCarouselContainer
        navigation={navigation}
        style={styles.ItemCarousel}
        orientation={orientation} />
      <RizzleImageViewerContainer />
    </View>
  )
}

const {height, width} = Dimensions.get('screen')

const styles = StyleSheet.create({
  mainView: {
    flex: 1
  },
  infoView: {
    position: 'absolute',
    top: 0,
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: hslString('rizzleBG')
    // backgroundColor: 'white'
  },
  infoText: {
    fontFamily: 'Avenir',
    color: '#f6f6f6'
  },
  ItemCarousel: {
    flex: 1,
    justifyContent: 'center'
  },
  image: {
    position: 'absolute',
    width: 1024,
    height: 1366,
    top: (height - 1366) / 2,
    left: (width - 1024) / 2
  }
})
