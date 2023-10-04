import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "store/reducers"
import { Item, MARK_ITEM_READ, UPDATE_CURRENT_INDEX } from "../../store/items/types"
import { ScaledSize, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from "react-native"
import { hslString } from "../../utils/colors"
import FeedIconContainer from "../../containers/FeedIcon"
import { Image } from "react-native"
import { Feed } from "../../store/feeds/types"

let previousItem: Item
const itemsWithLoadedImage: string[] = []

interface Props {
  feeds: Feed[]
  index: number
  items: Item[]
}

const ItemsList = ({ feeds, index, items }: Props) => {
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)
  const dispatch = useDispatch()
  const currentItem = !!items && !!index ? items[index] : undefined
  const dimensions: ScaledSize = useWindowDimensions()
  return (
    <View style={{
      // width: DRAWER_WIDTH,
      height: dimensions.height,
      backgroundColor: hslString('rizzleBG'),
      flex: -1,
    }}>
      <ScrollView style={{
        width: 300,
        height: 1000,
        flex: -1,
      }}>
        <View style={{
        }}>
          {items && items.map((item, index) => {
            const feed = feeds.find(f => f._id === item.feed_id)
            const hasImage = itemsWithLoadedImage.includes(item._id)
            return (
              <TouchableOpacity
                key={index}
                onPress={() => dispatch({
                  type: UPDATE_CURRENT_INDEX,
                  index: index,
                  displayMode
                })}
              >
                <View style={{
                  padding: 15,
                  backgroundColor: item?._id === currentItem?._id ? 'rgba(255, 255, 255, 0.5)' : hslString('rizzleBG'),
                  opacity: item?.readAt ? 0.5 : 1,
                  borderBottomColor: hslString('rizzleText', undefined, 0.1),
                  borderBottomWidth: 1,
                  // borderLeftColor: hslString(feed?.color),
                  // borderLeftWidth: feed?.color ? 10 : 0,
                }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 5,
                  }}>
                    <FeedIconContainer
                      isSmaller
                      feed={feed} />
                    <Text style={{
                      color: hslString('rizzleText', undefined, 0.8),
                      fontSize: 12,
                      fontFamily: 'IBMPlexSans',
                    }}>{feed?.title}</Text>
                  </View>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                  }}>
                    { item.banner_image && (
                      <View style={{
                        width: 50,
                        height: 50,
                        marginRight: 5,
                        borderRadius: 5,
                        overflow: 'hidden',
                      }}>
                        <Image 
                          // onLoadEnd={() => setLatestImage(item._id)}
                          source={{uri: item.banner_image}} 
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
                      }}>{item.author && `${item.author} • ` }{item.date_published && new Date(item.date_published).toLocaleDateString()}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default ItemsList
