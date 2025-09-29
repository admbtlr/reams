import { call, put } from 'redux-saga/effects'
import { ImageStuff, Item, ItemInflated, MercuryStuff, UPDATE_ITEM } from '../store/items/types';
import {
  getItems as getStoredItems,
  updateItem
} from '../storage'
import { addMercuryStuffToItem, deflateItem, removeCachedCoverImageDuplicate, setShowCoverImage } from '../utils/item-utils';
import { Platform } from 'react-native';

export function* setItemTitleFontSize({ item, fontSize }: { item: Item, fontSize: number }) {
  const items: ItemInflated[] = yield call(getStoredItems, [item])
  const fullItem = items[0]
  if (fullItem.styles.title.fontSize === fontSize) {
    return
  }
  const updated = {
    ...fullItem,
    styles: {
      ...fullItem.styles,
      title: {
        ...fullItem.styles.title,
        fontSize,
        fontResized: true
      }
    }
  }
  yield call(updateItem, updated as Item)
}

// export function * persistDecoration ({imageStuff, item, mercuryStuff}: {imageStuff: ImageStuff, item: Item, mercuryStuff: MercuryStuff}) {
//   const decorated = addMercuryStuffToItem(item, mercuryStuff)
//   item = {
//     ...item,
//     ...decorated
//   }
//   item = addCoverImageToItem(item, imageStuff)
//   item = setShowCoverImage(item)
//   item = removeCachedCoverImageDuplicate(item)
//   if (Platform.OS === 'web') {
//     yield call(updateItemIDB, item)
//   } else {
//     yield call(updateItemSQLite, item)
//   }
//   yield put({
//     type: UPDATE_ITEM,
//     item: deflateItem(item)
//   })
// }
