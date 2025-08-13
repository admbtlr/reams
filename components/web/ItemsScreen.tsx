import React, { useEffect, useState } from 'react'
import { Platform, View } from 'react-native'
import ItemsList from './ItemsList'
import ItemView from './ItemView'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store/reducers'
import { Item, ItemInflated, ItemType, MARK_ITEM_READ, UPDATE_CURRENT_ITEM } from '../../store/items/types'
import { getItems as getItemsStorage } from "@/storage"
import log from '../../utils/log'
import { getItems, getCurrentItemId, getNextItem, getPreviousItem, findItemIndexById } from '../../utils/get-item'

let previousItem: Item

export default function ItemsScreen({ }) {
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)
  const itemsStateKey = displayMode === ItemType.unread ? 'itemsUnread' : 'itemsSaved'
  const items = useSelector((state: RootState) => getItems(state))
  const feeds = useSelector((state: RootState) => state.feeds.feeds)
  const currentItemId = useSelector((state: RootState) => getCurrentItemId(state))
  const index = currentItemId ? findItemIndexById(items, currentItemId) : 0
  const dispatch = useDispatch()

  const [currentItemInflated, setCurrentItemInflated] = useState<ItemInflated | undefined>();
  useEffect(() => {
    const inflateAndSet = async (currentItem: Item) => {
      try {
        const inflatedItems: ItemInflated[] | undefined = await getItemsStorage([currentItem])
        if (inflatedItems !== undefined && inflatedItems.length) {
          setCurrentItemInflated({
            ...currentItem,
            ...inflatedItems[0]
          })
        }
      } catch (e) {
        log('error inflating item', e)
      }
    }
    const currentItem = currentItemId ? items.find(item => item._id === currentItemId) : items[0]
    if (currentItem && previousItem && currentItem._id !== previousItem?._id) {
      dispatch({
        type: MARK_ITEM_READ,
        item: previousItem,
      })
    }
    if (currentItem) {
      previousItem = currentItem
      inflateAndSet(currentItem)
    }
  }, [currentItemId])


  function shortcutListener(e: globalThis.KeyboardEvent) {
    if (!e) return
    if (e.key === 'j' || e.key === 'ArrowDown') {
      const nextItem = getNextItem(items, currentItemId)
      if (nextItem) {
        dispatch({
          type: UPDATE_CURRENT_ITEM,
          itemId: nextItem._id,
          previousItemId: currentItemId,
          displayMode
        })
      }
    } else if (e.key === 'k' || e.key === 'ArrowUp') {
      const prevItem = getPreviousItem(items, currentItemId)
      if (prevItem) {
        dispatch({
          type: UPDATE_CURRENT_ITEM,
          itemId: prevItem._id,
          previousItemId: currentItemId,
          displayMode
        })
      }
    } else {
      // console.log(e.key)
    }
  }
  React.useEffect(() => {
    window.addEventListener("keydown", shortcutListener)
    return () => window.removeEventListener("keydown", shortcutListener);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
      }}
    >
      <ItemsList
        items={items}
        feeds={feeds}
        index={index}
      />
      <ItemView
        item={currentItemInflated}
      />
    </View>
  )
}
