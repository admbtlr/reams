import {
  addStylesIfNecessary,
  addMercuryStuffToItem,
  addCoverImageToItem,
  setShowCoverImage
} from '../../utils/item-utils.js'

export const itemMarkRead = (action, state) => {
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

export const itemSetScrollOffset = (action, state) => {
  let items = state.items.map(item => {
    if (item._id === action.item._id) {
      item.scrollOffset = action.offset.y
    }
    return item
  })
  return {
    ...state,
    items
  }
}

export const itemToggleMercury = (action, state) => {
  let items = [ ...state.items ]
  let item = items.find((item) => item._id === action.item._id)
  if (item && item.content_mercury) {
    item.showMercuryContent = !item.showMercuryContent
  }
  return {
    ...state,
    items
  }
}

export const itemDecorationSuccess = (action, state) => {
  const testAndDecorate = (item) => {
    if (item._id === action.item._id) {
      item = addMercuryStuffToItem(item, action.mercuryStuff)
      return setShowCoverImage(addCoverImageToItem(item, action.imageStuff))
    } else {
      return item
    }
  }

  if (!action.item) {
    throw "action.item is not defined in itemDecorationSuccess"
  }
  items = state.items.map(testAndDecorate).map(addStylesIfNecessary)
  return {
    ...state,
    items
  }
}

export const updateCurrentItemTitleFontSize = (action, state) => {
  let stateChanged = false
  const newItems = state.items.map(item => {
    if (item._id === action.item._id) {
      if (item.styles.title.fontSize !== action.fontSize) {
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

export const updateCurrentItemTitleFontResized = (action, state) => {
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

export const itemsFlate = (action, state) => {
  // the items in the action are already inflated/deflated
  const flatedItems = action.itemsToInflate
    .concat(action.itemsToDeflate)
  items = [...state.items]
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