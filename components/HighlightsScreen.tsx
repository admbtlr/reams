import { Item } from '../store/items/types'
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
import { Annotation } from '../store/annotations/types'
import { getStatusBarHeight } from '../utils/dimensions'
import { getMargin } from '../utils/dimensions'
import { fontSizeMultiplier } from '../utils/dimensions'
import { dustbinIcon, noteIcon } from '../utils/icons'
import { createSelector } from '@reduxjs/toolkit'
import { selectItemsSaved } from '../store/items/items-saved'
import { deleteAnnotation, selectAnnotations, updateAnnotation } from '../store/annotations/annotations'
import { useModal } from './ModalProvider'
import Favicon from './Favicon'

interface highlightsByItem {
  item_id: string,
  item?: Item,
  highlights: Annotation[]
}

export const HighlightModeContext = React.createContext({ activeHighlight: null, setActiveHighlight: () => {} })


export default function HighlightsScreen () {
  const dispatch = useDispatch()
  const highlights = useSelector(selectAnnotations)
  const selectAnnotatedItems = createSelector([selectItemsSaved, selectAnnotations], (items, annotations) => {
    return items.filter((i: Item) => {
      return annotations.find((h: Annotation) => h.item_id === i._id) !== undefined
    })
  })
  const annotatedItems = useSelector(selectAnnotatedItems)
  const feeds = useSelector((state: RootState) => state.feeds.feeds)
  let highlightsByItem: highlightsByItem[] = []
  highlights.forEach(h => {
    if (h.item_id !== undefined) {
      let itemWithHighlights = highlightsByItem.find(hbi => hbi.item_id === h.item_id)
      if (itemWithHighlights === undefined) {
        itemWithHighlights = { 
          item_id: h.item_id, 
          item: annotatedItems.find(i => i._id === h.item_id),
          highlights: [] 
        }
        highlightsByItem.push(itemWithHighlights)
      }
      itemWithHighlights.highlights.push(h)
    }
  })
  const [scrollAnim, setScrollAnim] = useState(new Animated.Value(0))
  const { openModal } = useModal()

  const modalProps = (annotation: Annotation) => ({
    modalText: [{
      text: 'Add note',
      style: ['title']
    }],
    modalHideCancel: false,
    modalShow: true,
    inputs: [
      {
        // label: 'Name',
        name: 'note',
        type: 'textarea',
        value: annotation ? annotation.note : '',
      }
    ],
    modalOnOk: ({note}: {note: string}) => {
      dispatch(updateAnnotation({
        ...annotation,
        note
      }))
    }
  })
  
  const shadowStyle = {
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: {
      width: 0,
      height: 5
    }
  }
  
  const renderHighlightsByItem = (hbi: highlightsByItem, i: number) => (
    <View key={i} style={{
      backgroundColor: hslString('white'),
      margin: getMargin(),
      maxWidth: 500,
      padding: getMargin(),
      paddingBottom: getMargin() * 0.5,
      borderRadius: getMargin(),
      ...shadowStyle
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: '100%',
        marginBottom: getMargin(),
      }}>
        {hbi.item !== undefined && (
          <View style={{
            // width: 24,
            marginRight: getMargin() * 0.25,
            marginTop: 5
          }}>
            <Favicon
              url={hbi.item?.url}
              isSmall={true}
            />
          </View>
        )}
        <View style={{
          flex: 1,
        }}>
          <Text style={{
            ...textInfoBoldStyle(),
            marginLeft: 0,
            marginRight: 0
          }}>{hbi.item ? hbi.item.title : hbi.item_id}</Text>
          { hbi.item?.feed_id && feeds.find(f => f._id === hbi.item?.feed_id) !== undefined && (
            <Text style={{
              ...textInfoStyle(),
              fontSize: 12 * fontSizeMultiplier(),
              marginLeft: 0,
              marginRight: 0
            }}>{feeds.find(f => f._id === hbi.item?.feed_id)?.title}</Text>
          )}
        </View>
      </View>
      { hbi.highlights.map(renderHighlight) }
    </View> 
  )

  const renderHighlight = (h: Annotation, i: number, array: Annotation[]) => (
    <View 
      key={i}
      style={{
        marginBottom: i === array.length - 1 ? 0 : getMargin(),
        marginTop: i === 0 ? 0 : getMargin(),
        paddingBottom: i === array.length - 1 ? 0 : getMargin(),
        borderBottomColor: hslString('rizzleText', '', 0.1),
        borderBottomWidth: i === array.length - 1 ? 0 : 1,
        maxWidth: '100%',
      }}>
      <View style={{
        borderLeftColor: hslString('rizzleHighlight'),
        borderLeftWidth: 2,
        paddingLeft: getMargin() * 0.5,
      }}>
        <Text style={{
          ...textInfoStyle(),
          marginLeft: 0,
          marginRight: 0,
          fontFamily: 'IBMPlexSerif',
          // borderLeftWidth: 2,
          // borderLeftColor: hslString('rizzleHighlight'),
        }}>{h.text}</Text>
      </View>
      { h.note && (
        <View style={{
          marginVertical: getMargin() * 0.5,
          backgroundColor: hslString('rizzleText', '', 0.05),
          padding: getMargin() * 0.5,
        }}>
          <Text style={{
            ...textInfoStyle(),
            fontFamily: 'IBMPlexSerif-Italic',
            marginLeft: 0,
            marginRight: 0,
          }}>{h.note}</Text>
        </View>
      )}
      <View style={{
        justifyContent: 'flex-end',
        flexDirection: 'row',
        marginTop: getMargin() * 0.5,
      }}>
        <TouchableOpacity 
          onPress={() => openModal(modalProps(h))}
          style={{
            marginRight: getMargin()
          }}
        >
          {noteIcon(hslString('rizzleText'), 24, 1)}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          LayoutAnimation.configureNext({ 
            duration: 500, 
            create: { type: 'linear', property: 'opacity' }, 
            update: { type: 'spring', springDamping: 0.4 }, 
            delete: { duration: 100, type: 'linear', property: 'opacity' } 
          })
          dispatch(deleteAnnotation(h))
        }}>
          {dustbinIcon(hslString('rizzleText'), 32, 1)}
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <>
      <Animated.View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: getStatusBarHeight(),
        backgroundColor: hslString('rizzleBG', '', 0.98),
        zIndex: 100,
        shadowColor: 'black',
        shadowRadius: 1,
        shadowOpacity: scrollAnim.interpolate({
          inputRange: [0, 20],
          outputRange: [0, 0.1],
          extrapolate: 'clamp'
        }),
        shadowOffset: {
          height: 1,
          width: 0
        },
        overflow: 'visible',
      }} />
      <View 
        style={{
          flex: 1,
          backgroundColor: hslString('rizzleBG'),
          // to ensure that borderRadius works on the animation
          overflow: 'hidden',
          borderRadius: 0,
          paddingTop: getStatusBarHeight(),
          paddingBottom: getMargin() * 2,
        }}
      >
        { highlightsByItem.length === 0 ? (
          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',

          }}>
            <Text style={{
              ...textInfoStyle(),
              margin: getMargin(),
              lineHeight: 24,  
            }}>Highlights and annotations that you add to your stories are displayed here.</Text>
            <Image 
              source={require('../assets/images/reams-highlights.webp')} 
              style={{
                backgroundColor: 'white',
                borderColor: 'rgba(0,0,0,0.8)',
                borderWidth: 2,
                width: 150,
                height: 328,
                margin: getMargin(),
                borderRadius: 18
              }}
            />
          </View>
        ) : (
          <Animated.ScrollView 
            onScroll={Animated.event(
              [{ nativeEvent: {
                contentOffset: { y: scrollAnim }
              }}],
              {
                useNativeDriver: true
              }
            )}
            showsVerticalScrollIndicator={false}
          >
            { highlightsByItem.map(renderHighlightsByItem) }
          </Animated.ScrollView>
        )}
      </View>
    </>
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
