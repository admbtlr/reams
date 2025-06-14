import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "store/reducers"
import { Item, ItemType, MARK_ITEM_READ, UPDATE_CURRENT_INDEX } from "../../store/items/types"
import { Dimensions, ScaledSize, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from "react-native"
import { hslString } from "../../utils/colors"
import { Image } from "react-native"
import { Feed } from "../../store/feeds/types"
import { getRizzleButtonIcon } from "../../utils/rizzle-button-icons"
import { textInfoMonoStyle, textInfoBoldStyle, textLabelStyle } from "../../utils/styles"
import { useNavigation } from "@react-navigation/native"
import { getMargin } from "../../utils/dimensions"
import getFaviconUrl from "../../utils/get-favicon"
import { TOP_BAR_HEIGHT } from "./ItemView"
import { selectFilterTitle } from "@/sagas/selectors"
import { selectUnreadItemsInCurrentFilter } from "@/selectors/selectUnreadItemsInCurrentFilter"

interface Props {
  feeds: Feed[]
  index: number
  items: Item[]
}

const ItemsList = ({ feeds, index, items }: Props) => {
  const currentItem = !!items && !!index ? items[index] : undefined
  const displayMode = useSelector((store: RootState) => store.itemsMeta.display)
  const filterTitle = useSelector(selectFilterTitle)
  const unreadCount = useSelector(selectUnreadItemsInCurrentFilter)
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
        height: TOP_BAR_HEIGHT,
        width: '100%',
        backgroundColor: hslString('rizzleText'),
        opacity: 0.95,
        position: 'absolute',
        top: 0,
        zIndex: 10
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            height: 40,
            paddingLeft: 30
          }}
        >
          <View style={{
            marginTop: -13,
            marginLeft: -3
          }}>
            {getRizzleButtonIcon('back', hslString('white'), null, true, true, 0.7)}
          </View>
          <View style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            // marginBottom: -5,
            flex: 2
          }}>
            <Text style={{
              ...textInfoBoldStyle(),
              margin: 0,
              marginBottom: 5,
              padding: 0,
              color: 'white'
            }}>{filterTitle ??
              (displayMode === ItemType.saved ?
                'Library' :
                'Unread')}</Text>
            <Text style={{
              fontFamily: 'IBMPlexSans-Light',
              color: 'hsla(0, 100%, 100%, 0.7)',
              margin: 0,
              fontSize: 12,
              lineHeight: 12,
              flex: 1
            }}>{unreadCount} unread articles</Text>
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView
        ref={scrollRef}
        style={{
          width: 300,
          height: Dimensions.get('window').height,
          flex: -1,
        }}
      >
        <View style={{
          paddingTop: TOP_BAR_HEIGHT + 20
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

const ItemListItem = memo(({ currentItem, feed, item, index, scrollRef }: ItemListItemProps) => {
  const dispatch = useDispatch()
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)
  const ref = useRef<View>(null)
  const matches = item?.url?.match(/:\/\/(.*?)\//)
  const host = matches && matches.length > 1 ? matches[1] : null

  const handlePress = useCallback(() => {
    dispatch({
      type: UPDATE_CURRENT_INDEX,
      index: index,
      displayMode
    })
  }, [dispatch, index, displayMode])

  return (
    <TouchableOpacity
      key={item._id}
      onPress={handlePress}
    >
      <View
        ref={ref}
        style={{
          padding: 15,
          backgroundColor: item?._id === currentItem?._id ? hslString('logo2') : hslString('rizzleBG'),
          opacity: item?.readAt ? 0.5 : 1,
          marginHorizontal: 15,
          borderRadius: 10
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
            color: item?._id === currentItem?._id ? 'white' : hslString('rizzleText', undefined, 0.8),
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
                color: item?._id === currentItem?._id ? 'white' : hslString('rizzleText'),
                fontSize: 14,
                fontFamily: 'IBMPlexSans-Bold',
                flex: 1,
                flexWrap: 'wrap',
              }}
            >{item.title}</Text>
            <Text style={{
              color: item?._id === currentItem?._id ? 'hsla(0, 100%, 100%, 0.8)' : hslString('rizzleText', undefined, 0.8),
              fontSize: 12,
              fontFamily: 'IBMPlexSans',
              flex: 1,
              flexWrap: 'wrap',
            }}>{item.author && `${item.author} • `}{item.date_published && new Date(item.date_published).toLocaleDateString()}</Text>
          </View>
        </View>
      </View>
      <View style={{
        height: 1,
        backgroundColor: hslString('rizzleText', undefined, 0.2),
        marginHorizontal: 30
      }} />
    </TouchableOpacity>
  )
}, (prevProps, nextProps) => {
  // Only re-render if the item is currently selected or was previously selected
  return prevProps.item._id === nextProps.item._id &&
    prevProps.currentItem?._id === nextProps.currentItem?._id &&
    (prevProps.item._id !== prevProps.currentItem?._id &&
      nextProps.item._id !== nextProps.currentItem?._id) &&
    prevProps.item.readAt !== nextProps.item.readAt
})

export default ItemsList
