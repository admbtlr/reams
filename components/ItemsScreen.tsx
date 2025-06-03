import { ItemType } from '../store/items/types'
import React, { useState } from 'react'
import {
  StatusBar,
  StyleSheet,
  View,
  Dimensions,
  Button,
  Platform
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useFocusEffect } from '@react-navigation/native'
import {
  ITEMS_SCREEN_BLUR,
  ITEMS_SCREEN_FOCUS
} from '../store/ui/types'
import ItemCarousel from './ItemCarousel'
import RizzleImageViewerContainer from '../containers/RizzleImageViewer.js'
import { hslString } from '../utils/colors'
import HighlightButtons, { ActiveHighlight } from './HighlightButtons'
import { RootState } from '../store/reducers'
import { selectAnnotations } from '../store/annotations/annotations'
import Animated from 'react-native-reanimated'


interface ActiveHighlightContext {
  activeHighlightId: string | null
  setActiveHighlightId: (activeHighlightId: string | null) => void
  activeHighlight: ActiveHighlight | null
}

export const ActiveHighlightContext = React.createContext<ActiveHighlightContext>({
  activeHighlightId: null,
  setActiveHighlightId: () => null,
  activeHighlight: null
})

export default function ItemsScreen({ navigation }: { navigation: any }) {
  const dispatch = useDispatch()
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)
  const orientation = useSelector((state: RootState) => state.config.orientation)
  // const lastActivated = useSelector(state => state.config.lastActivated)

  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null)
  const annotations = useSelector(selectAnnotations)
  const activeHighlight = activeHighlightId
    ? annotations.find(a => a._id === activeHighlightId) || { _id: activeHighlightId }
    : null

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
      {Platform.OS === 'ios' &&
        <StatusBar
          showHideTransition="slide"
          barStyle={displayMode === ItemType.saved ? 'dark-content' : 'light-content'}
          hidden={false} />
      }
      <View style={styles.infoView} />
      <ActiveHighlightContext.Provider value={{ activeHighlightId, setActiveHighlightId, activeHighlight }}>
        <ItemCarousel />
        <HighlightButtons />
      </ActiveHighlightContext.Provider>
      <RizzleImageViewerContainer />
    </Animated.View>
  )
}

const { height, width } = Dimensions.get('screen')

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
