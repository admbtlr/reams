import React, { KeyboardEvent, useEffect, useState } from 'react'
import { Platform, View } from 'react-native'
import ItemsList from './ItemsList'
import ItemView from './ItemView'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store/reducers'
import { DECREMENT_INDEX, INCREMENT_INDEX, Item, ItemType, MARK_ITEM_READ, UPDATE_CURRENT_INDEX } from '../../store/items/types'
import { getItems as getItemsSQLite } from "../../storage/sqlite"
import { getItems as getItemsIDB } from "../../storage/idb-storage"

let previousItem: Item

export default function ItemsScreen ({}) {
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)
  const itemsStateKey = displayMode === ItemType.unread ? 'itemsUnread' : 'itemsSaved'
  const items = useSelector((state: RootState) => state[itemsStateKey].items)
  const filteredItems = items
  const feeds = useSelector((state: RootState) => state.feeds.feeds)
  const index = useSelector((state: RootState) => state[itemsStateKey].index)
  const dispatch = useDispatch()
  const [currentItemInflated, setCurrentItemInflated] = useState()
  useEffect(() => {
    const inflateAndSet = async (currentItem: Item) => {
      const inflatedItems: Item[] = Platform.OS === 'web' ?
        await getItemsIDB([currentItem]) :
        await getItemsSQLite([currentItem])
      if (inflatedItems.length) {
        setCurrentItemInflated(inflatedItems[0])
      }
    }
    const currentItem = items && items[index]
    if (currentItem && previousItem && currentItem._id !== previousItem?._id) {
      dispatch({
        type: MARK_ITEM_READ,
        item: previousItem,
      })
    }
    previousItem = currentItem
    inflateAndSet(currentItem)
  }, [index]) 


  function shortcutListener (e: KeyboardEvent) {
    if (!e) return
    const { ...props } = e;
    if (props.nativeEvent.key === 'j' || props.nativeEvent.key === 'ArrowDown') {
      dispatch({
        type: INCREMENT_INDEX,
        displayMode
      })
    } else if (props.nativeEvent.key === 'k' || props.nativeEvent.key === 'ArrowUp') {
      dispatch({
        type: DECREMENT_INDEX,
        displayMode
      })
    } else {
      // console.log(props.nativeEvent.key)
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
        items={filteredItems}
        feeds={feeds}
        index={index}
      />
      <ItemView 
        item={currentItemInflated}
      />
    </View>
  )
}