import { call } from 'redux-saga/effects'
import { Item, ItemInflated } from '../store/items/types';
import { inflateItem, updateItem } from '../storage/sqlite';

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
