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
  LayoutAnimation
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { hslString } from '../utils/colors'
import { textInfoStyle, textInfoBoldStyle } from '../utils/styles'
import { RootState } from '../store/reducers'
import { Annotation, DELETE_ANNOTATION, EDIT_ANNOTATION } from '../store/annotations/types'
import { fontSizeMultiplier, getMargin } from '../utils'
import { dustbinIcon, noteIcon } from '../utils/icons'
import { SHOW_MODAL } from '../store/ui/types'
import FeedIconContainer from '../containers/FeedIcon'

interface highlightsByItem {
  item_id: string,
  item?: Item,
  highlights: Annotation[]
}

export const HighlightModeContext = React.createContext({ activeHighlight: null, setActiveHighlight: (mode) => {} })


export default function HighlightsScreen ({ navigation }) {
  const dispatch = useDispatch()
  const highlights = useSelector((state: RootState) => state.annotations.annotations)
  const annotatedItems = useSelector((state: RootState) => {
    return state.itemsSaved.items.filter((i: Item) => {
      return highlights.find((h: Annotation) => h.item_id === i._id) !== undefined
    })
  })
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
    modalOnOk: ({note}) => {
      dispatch({
        type: EDIT_ANNOTATION,
        annotation: {
          ...annotation,
          note
        }
      })
    }
  })
  
  
  const renderHighlightsByItem = (hbi: highlightsByItem, i: number) => (
    <View key={i} style={{
      backgroundColor: hslString('white'),
      margin: getMargin(),
      padding: getMargin(),
      borderRadius: getMargin(),
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: '100%',
        marginBottom: getMargin(),
      }}>
        { hbi.item?.feed_id && feeds.find(f => f._id === hbi.item?.feed_id) !== undefined && (
          <View style={{
            // width: 24,
            // marginRight: getMargin() * 0.5,
            marginTop: 5
          }}>
            <FeedIconContainer
              id={hbi.item.feed_id}
              dimensions={{width: 16, height: 16}}
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
        paddingBottom: i === array.length - 1 ? 0 : getMargin() * 0.5,
        borderBottomColor: hslString('rizzleText', '', 0.2),
        borderBottomWidth: i === array.length - 1 ? 0 : 1,
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
          borderLeftWidth: 2,
          borderLeftColor: hslString('rizzleHighlight'),
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
          onPress={() => dispatch({
            type: SHOW_MODAL,
            modalProps: modalProps(h),           
          })}
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
          dispatch({
            type: DELETE_ANNOTATION,
            annotation: h
          })
        }}>
          {dustbinIcon(hslString('rizzleText'), 32, 1)}
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View 
      style={{
        flex: 1,
        backgroundColor: hslString('rizzleBG'),
        // to ensure that borderRadius works on the animation
        overflow: 'hidden',
        borderRadius: 0,
        paddingBottom: getMargin() * 2,
      }}>
        <ScrollView showsVerticalScrollIndicator={false}>
        { highlightsByItem.map(renderHighlightsByItem) }
      </ScrollView>
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