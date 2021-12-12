import {
  Item,
  ItemsState,
  ItemActionTypes,
  ItemType,
  flateItemsAction,
  flateItemsErrorAction,
  itemDecorationFailureAction,
  itemDecorationSuccessAction,
  markItemReadAction,
  markItemsReadAction,
  setScrollOffsetAction,
  setTitleFontResizedAction,
  setTitleFontSizeAction,
  toggleMercuryViewAction
} from './types'
import {
  addStylesIfNecessary,
  addMercuryStuffToItem,
  addCoverImageToItem,
  removeCoverImageDuplicate,
  setShowCoverImage
} from '../../utils/item-utils.js'

export const itemMarkRead = (
  action: markItemReadAction, 
  state: ItemsState
) => {
  const items = state.items.map(item => {
    if (item._id === action.item._id) {
      item.readAt = Date.now()
    }
    return item
  })
  return {
    ...state,
    items
  }
}

export function itemsMarkRead (
  action: markItemsReadAction, 
  state: ItemsState
) {
  if (action.items.length === 0) {
    return state
  }
  const items = state.items.map(item => {
    const readItem = action.items.find(ai => ai._id === item._id)
    if (readItem) {
      item.readAt = readItem.readAt || Date.now()
    }
    return item
  })
  return {
    ...state,
    items
  }
}

export function itemSetScrollOffset (
  action: setScrollOffsetAction, 
  state: ItemsState
) {
  let items = state.items.map(item => {
    if (item._id === action.item._id) {
      // need to gracefully migrate to new format
      item.scrollRatio = item.scrollRatio && typeof item.scrollRatio === 'object' ?
        item.scrollRatio :
        {
          html: 0,
          mercury: 0
        }
      item.scrollRatio[item.showMercuryContent ? 'mercury' : 'html'] = action.scrollRatio
    }
    return item
  })
  return {
    ...state,
    items
  }
}

export function itemToggleMercury (
  action: toggleMercuryViewAction, 
  state: ItemsState
) {
  let items = [ ...state.items ]
  let item = items.find((item) => item._id === action.item._id)
  if (item && item.content_mercury) {
    item.showMercuryContent = !item.showMercuryContent
    item.hasShownMercury = true
  }
  return {
    ...state,
    items
  }
}

export function itemDecorationSuccess (
  action: itemDecorationSuccessAction, 
  state: ItemsState,
  isCurrentDisplayMode: boolean
) {
  const currentItems = [
    state.items[state.index],
    state.items[state.index + 1 < state.items.length ? state.index + 1 : state.index],
    state.items[state.index + 2 < state.items.length ? state.index + 2 : state.index],
    state.items[state.index + 3 < state.items.length ? state.index + 3 : state.index],
  ]
  const testAndDecorate = (item: Item) => {
    if (item._id === action.item._id) {
      // note that I'm using action.item as the base
      // there's a small chance that this might be stale,
      // if e.g. it's been read since it was initially plucked in the decorate-item saga
      const decorated = addMercuryStuffToItem(action.item, action.mercuryStuff)
      item = {
        ...item,
        ...decorated
      }

      // don't want to add a cover image to a currently visible item
      if (!(isCurrentDisplayMode && !!currentItems.find(ci => item._id === ci._id))) {
        item = addCoverImageToItem(item, action.imageStuff)
        item.hasCoverImage = !!item.coverImageFile
        item = setShowCoverImage(item, currentItems[0])
        item = removeCoverImageDuplicate(item)
      }
    }
    return item
  }

  if (!action.item) {
    throw "action.item is not defined in itemDecorationSuccess"
  }
  const items: Item[] = state.items.map(testAndDecorate).map(addStylesIfNecessary)
  return {
    ...state,
    items
  }
}

export function itemDecorationFailure (
  action: itemDecorationFailureAction, 
  state: ItemsState
) {
  const items = state.items.map(item => {
    if (item._id === action.item._id) {
      item.decoration_failures = item.decoration_failures || 0
      item.decoration_failures++
      if (item.decoration_failures > 4) {
        item.content_html = '<p>This story could not be loaded 😞</p><p>'
          + item.url + '</p>' +
          (action.mercuryStuff?.message ? ('<p>' + action.mercuryStuff.message + '</p>') : '')
      }
    }
    return item
  })
  return {
    ...state,
    items
  }
}

export function updateCurrentItemTitleFontSize (
  action: setTitleFontSizeAction, 
  state: ItemsState
) {
  let stateChanged = false
  const newItems = state.items.map(item => {
    if (item._id === action.item._id) {
      if (item.styles && item.styles.title.fontSize !== action.fontSize) {
        item.styles.title.fontSize = action.fontSize
        item.styles.title.lineHeight = action.fontSize
        item.styles.title.fontResized = true
        stateChanged = true
      }
    }
    return item
  })
  return stateChanged ?
    {
      ...state,
      items: newItems
    } :
    state
}

export function updateCurrentItemTitleFontResized (
  action: setTitleFontResizedAction, 
  state: ItemsState
) {
  const newItems = state.items.map(item => {
    if (item._id === action.item._id) {
      item.styles.title.fontResized = true
    }
    return item
  })
  return {
    ...state,
    items: newItems
  }
}

export function itemsFlate (
  action: flateItemsAction, 
  state: ItemsState
) {
  // the items in the action are already inflated/deflated
  const flatedItems = action.itemsToInflate
    .concat(action.itemsToDeflate)
  let items = [...state.items]
  flatedItems.forEach(fi => {
    // some of the items might have been deleted in Firebase
    // which means that they will come back as undefined
    // I think we can just ignore them
    // TODO check whether this is really the case!
    if (fi) {
      const index = items.findIndex(item => item._id === fi._id)
      // don't deflate an item that is currently in view
      if (!(Math.abs(index - state.index) <= 1
        && typeof fi.content_html === 'undefined')) {
        items[index] = fi
      }
    }
  })
  return {
    ...state,
    items
  }
}

export function itemsFlateError (
  action: flateItemsErrorAction, 
  state: ItemsState
) {
  // something's gone wrong, so just remove them
  const erroredItems = action.items
  const items = [...state.items].filter(i => (
    erroredItems.find(ei => ei._id === i._id) === undefined
  ))
  return {
    ...state,
    items
  }
}

