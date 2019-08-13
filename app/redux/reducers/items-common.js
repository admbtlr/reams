import {
  addStylesIfNecessary,
  addMercuryStuffToItem,
  addCoverImageToItem,
  removeDuplicateImage,
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

export const itemsMarkRead = (action, state) => {
  const items = state.items.map(item => {
    if (action.items.find(ai => ai._id === item._id)) {
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
      item.scrollOffset = action.offset
      if (action.scrollRatio > item.maxScrollRatio) {
        item.maxScrollRatio = action.scrollRatio
      }
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
    item.hasShownMercury = true
  }
  return {
    ...state,
    items
  }
}

export const itemDecorationSuccess = (action, state) => {
  const testAndDecorate = (item) => {
    if (item._id === action.item._id) {
      // note that I'm using action.item as the base
      // there's a small chance that this might be stale,
      // if e.g. it's been read since it was initially plucked in the decorate-item saga
      item = addMercuryStuffToItem(action.item, action.mercuryStuff)
      item = setShowCoverImage(addCoverImageToItem(item, action.imageStuff))
      // this is just to pick up styles.coverImage.isInline
      // item.styles = action.item.styles
    }
    return item
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

export const itemDecorationFailure = (action, state) => {
  const items = state.items.map(item => {
    if (item._id === action.item._id) {
      item.decoration_failures = item.decoration_failures || 0
      item.decoration_failures++
    }
    return item
  })
  return {
    ...state,
    items
  }
}

export const updateCurrentItemTitleFontSize = (action, state) => {
  let stateChanged = false
  const newItems = state.items.map(item => {
    if (item._id === action.item._id) {
      if (item.styles.title === undefined) debugger
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