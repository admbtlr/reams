import { call, put } from 'redux-saga/effects'
import { ImageStuff, Item, ItemInflated, MercuryStuff, UPDATE_ITEM } from '../store/items/types';
import { inflateItem, updateItem } from '../storage/sqlite';
import { addCoverImageToItem, addMercuryStuffToItem, deflateItem, removeCachedCoverImageDuplicate, setShowCoverImage } from '../utils/item-utils';

export function * setItemTitleFontSize ({item, fontSize}: {item: Item, fontSize: number}) {
  const fullItem: ItemInflated = yield call(inflateItem, item)
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
  yield call(updateItem, updated)
}

export function * persistDecoration ({imageStuff, item, mercuryStuff}: {imageStuff: ImageStuff, item: Item, mercuryStuff: MercuryStuff}) {
  const decorated = addMercuryStuffToItem(item, mercuryStuff)
  item = {
    ...item,
    ...decorated
  }
  item = addCoverImageToItem(item, imageStuff)
  item.hasCoverImage = !!item.coverImageFile
  item = setShowCoverImage(item)
  item = removeCachedCoverImageDuplicate(item)
  yield call(updateItem, item)
  yield put({ 
    type: UPDATE_ITEM,
    item: deflateItem(item)
  })
}