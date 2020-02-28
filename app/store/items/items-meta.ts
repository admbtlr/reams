import {
  SET_DISPLAY_MODE,
  ITEM_DECORATION_PROGRESS,
  ItemActionTypes,
  ItemType
} from './types'

export interface ItemsMetaState {
  readonly display: ItemType
  readonly decoratedCount: number
}

const initialState = {
  display: ItemType.unread, 
  decoratedCount: 0
}

export function itemsMeta (
  state = initialState, 
  action: ItemActionTypes
) : ItemsMetaState {

  switch (action.type) {

    case ITEM_DECORATION_PROGRESS:
      return {
        ...state,
        decoratedCount: action.decoratedCount
      }

    case SET_DISPLAY_MODE:
      return {
        ...state,
        display: action.displayMode
      }

    default:
      return state
  }
}

