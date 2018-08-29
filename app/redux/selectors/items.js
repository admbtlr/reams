import { createSelector } from 'reselect'

export const getUnreadItems = state => {
  return makeGetUnreadItems()(state)
}

const getIndex = state => state.itemsMeta.index

const makeGetUnreadItems = () =>
  createSelector(
    [
      state => state.itemsData0.items.items,
      state => state.itemsData1.items.items,
      state => state.itemsData2.items.items,
      state => state.itemsData3.items.items,
      state => state.itemsData4.items.items,
      state => state.itemsData5.items.items,
      state => state.itemsData6.items.items,
      state => state.itemsData7.items.items,
      state => state.itemsData8.items.items,
      state => state.itemsData9.items.items,
      state => state.itemsDataA.items.items,
      state => state.itemsDataB.items.items,
      state => state.itemsDataC.items.items,
      state => state.itemsDataD.items.items,
      state => state.itemsDataE.items.items,
      state => state.itemsDataF.items.items
    ],
    (...allBatches) => {
      return [].concat(...allBatches)
    }
  )

export const getCurrentUnreadItem = createSelector(
  [ getUnreadItems, getIndex ],
  (items, index) => items ? items[index] : null
)