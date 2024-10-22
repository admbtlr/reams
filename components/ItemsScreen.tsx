import { ItemType } from '../store/items/types'
import React, { useState } from 'react'
import {
  StatusBar,
  StyleSheet,
  View,
  Dimensions,
  Animated,
  Button
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
import HighlightButtons, { ActiveHighlight } from './HighlightButtons'
import { RootState } from '../store/reducers'


interface ActiveHighlightContext {
  activeHighlight: ActiveHighlight | null
  setActiveHighlight: (activeHighlight: ActiveHighlight) => void
}

export const ActiveHighlightContext = React.createContext<ActiveHighlightContext>({
  activeHighlight: null,
  setActiveHighlight: () => null
})

export default function ItemsScreen ({ navigation}: { navigation: any }) {
  const dispatch = useDispatch()
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)
  const orientation = useSelector((state: RootState) => state.config.orientation)
  // const lastActivated = useSelector(state => state.config.lastActivated)

  const [activeHighlight, setActiveHighlight] = useState<ActiveHighlight | null>(null)

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
    }, [])
  )

  return (
    <Animated.View 
      style={{
        flex: 1,
        backgroundColor: hslString('bodyBG'),
        // to ensure that borderRadius works on the animation
        overflow: 'hidden',
        borderRadius: 0
      }}>
      <StatusBar
        showHideTransition="slide"
        barStyle={ displayMode === ItemType.saved ? 'dark-content' : 'light-content' }
        hidden={false} />
      <View style={styles.infoView} />
      <ActiveHighlightContext.Provider value={{ activeHighlight, setActiveHighlight }}>
        <ItemCarouselContainer
          navigation={navigation}
          style={styles.ItemCarousel}
          orientation={orientation} />
        <HighlightButtons />
      </ActiveHighlightContext.Provider>
      <RizzleImageViewerContainer />
    </Animated.View>
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
