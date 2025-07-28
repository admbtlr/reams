import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "store/reducers"
import { Item, ItemType, MARK_ITEM_READ, UPDATE_CURRENT_ITEM } from "../../store/items/types"
import { ScaledSize, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from "react-native"
import { hslString } from "../../utils/colors"
import { Image } from "react-native"
import { Feed } from "../../store/feeds/types"
import { getRizzleButtonIcon } from "../../utils/rizzle-button-icons"
import { textInfoItalicStyle, textInfoMonoItalicStyle, textLabelStyle } from "../../utils/styles"
import { useNavigation } from "@react-navigation/native"
import { getMargin } from "../../utils/dimensions"
import getFaviconUrl from "../../utils/get-favicon"

interface Props {
  feeds: Feed[]
  index: number
  items: Item[]
}

const ItemsList = ({ feeds, index, items }: Props) => {
  const currentItem = !!items && !!index ? items[index] : undefined
  const displayMode = useSelector((store: RootState) => store.itemsMeta.display)
  const dimensions: ScaledSize = useWindowDimensions()
  const scrollRef = useRef<any>()
  const navigation = useNavigation()
  return (
    <View style={{
      // width: DRAWER_WIDTH,
      height: dimensions.height,
      backgroundColor: hslString('rizzleBG'),
      flex: -1,
    }}>
      <View style={{
        height: 40,
        width: '100%',
        backgroundColor: hslString('rizzleBG'),
        opacity: 0.95,
        position: 'absolute',
        top: 0,
        zIndex: 10
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center'
          }}
        >
          {getRizzleButtonIcon('back', hslString('rizzleText'))}
          <Text style={{
            ...textInfoItalicStyle(),
            fontSize: 12,
            margin: 0,
            opacity: 0.5
          }}>Back to {displayMode === ItemType.unread ? 'feed' : 'library'} screen</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        ref={scrollRef}
        style={{
          width: 300,
          height: 1000,
          flex: -1,
        }}
      >
        <View style={{
          paddingTop: 40
        }}>
          {items && items.map((item, index) => (
            <ItemListItem
              currentItem={currentItem}
              feed={feeds.find(f => f._id === item.feed_id)}
              item={item}
              index={index}
              key={index}
              scrollRef={scrollRef}
            />
          )
          )}
        </View>
      </ScrollView>
    </View>
  )
}

interface ItemListItemProps {
  currentItem: Item | undefined
  feed: Feed | undefined
  item: Item
  index: number
  scrollRef: any
}

const ItemListItem = ({ currentItem, feed, item, index, scrollRef }: ItemListItemProps) => {
  const dispatch = useDispatch()
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)
  const ref = useRef<View>(null)
  const matches = item?.url?.match(/:\/\/(.*?)\//)
  const host = matches && matches.length > 1 ? matches[1] : null
  return (
    <TouchableOpacity
      key={item._id}
      onPress={() => {
        dispatch({
          type: UPDATE_CURRENT_ITEM,
          itemId: item._id,
          previousItemId: currentItem._id,
          displayMode
        })
      }}
    >
      <View
        ref={ref}
        style={{
          padding: 15,
          backgroundColor: item?._id === currentItem?._id ? 'rgba(255, 255, 255, 0.5)' : hslString('rizzleBG'),
          opacity: item?.readAt ? 0.5 : 1,
          borderBottomColor: hslString('rizzleText', undefined, 0.3),
          borderBottomWidth: 1,
          // borderLeftColor: hslString(feed?.color),
          // borderLeftWidth: feed?.color ? 10 : 0,
        }}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 5,
        }}>
          {host &&
            <Image
              source={{ uri: getFaviconUrl(host) }}
              style={{
                width: 16,
                height: 16
              }} />
          }
          <Text style={{
            color: hslString('rizzleText', undefined, 0.8),
            fontSize: 12,
            fontFamily: 'IBMPlexSans',
            marginLeft: getMargin() / 2
          }}>{feed?.title || host}</Text>
        </View>
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
        }}>
          {item.banner_image && (
            <View style={{
              width: 50,
              height: 50,
              marginRight: 5,
              borderRadius: 5,
              overflow: 'hidden',
            }}>
              <Image
                // onLoadEnd={() => setLatestImage(item._id)}
                source={{ uri: item.banner_image }}
                style={{
                  width: '100%',
                  height: '100%',
                  resizeMode: 'cover',
                }} />
            </View>
          )}
          <View style={{
            flex: 1,
            flexDirection: 'column',
            position: 'relative',
            top: -3
          }}>
            <Text
              numberOfLines={3}
              style={{
                color: hslString('rizzleText'),
                fontSize: 14,
                fontFamily: 'IBMPlexSans-Bold',
                flex: 1,
                flexWrap: 'wrap',
              }}
            >{item.title}</Text>
            <Text style={{
              color: hslString('rizzleText', undefined, 0.8),
              fontSize: 12,
              fontFamily: 'IBMPlexSans',
              flex: 1,
              flexWrap: 'wrap',
            }}>{item.author && `${item.author} • `}{item.date_published && new Date(item.date_published).toLocaleDateString()}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default ItemsList
