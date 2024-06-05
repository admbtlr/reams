import { call, put } from 'redux-saga/effects'
import { ImageStuff, Item, ItemInflated, MercuryStuff, UPDATE_ITEM } from '../store/items/types';
import { 
  getItems as getItemsSQLite, 
  updateItem as updateItemSQLite
} from '../storage/sqlite'
import { 
  getItems as getItemsIDB, 
  updateItem as updateItemIDB
} from '../storage/idb-storage'
import { addCoverImageToItem, addMercuryStuffToItem, deflateItem, removeCachedCoverImageDuplicate, setShowCoverImage } from '../utils/item-utils';
import { Platform } from 'react-native';

export function * setItemTitleFontSize ({item, fontSize}: {item: Item, fontSize: number}) {
  const items: ItemInflated[] = Platform.OS === 'web' ?
    yield call(getItemsIDB, [item]) :
    yield call(getItemsSQLite, [item])
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
  if (Platform.OS === 'web') {
    yield call(updateItemIDB, updated as Item)
  } else {
    yield call(updateItemSQLite, updated)
  }
}

// export function * persistDecoration ({imageStuff, item, mercuryStuff}: {imageStuff: ImageStuff, item: Item, mercuryStuff: MercuryStuff}) {
//   const decorated = addMercuryStuffToItem(item, mercuryStuff)
//   item = {
//     ...item,
//     ...decorated
//   }
//   item = addCoverImageToItem(item, imageStuff)
//   item.hasCoverImage = !!item.coverImageFile
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