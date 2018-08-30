import {
  addStylesIfNecessary,
  addMercuryStuffToItem,
  addCoverImageToItem
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
      item =  addMercuryStuffToItem(item, action.mercuryStuff)
      return addCoverImageToItem(item, action.imageStuff)
    } else {
      return item
    }
  }

  items = state.items.map(testAndDecorate).map(addStylesIfNecessary)
  return {
    ...state,
    items
  }
}

export const updateCurrentItemTitleFontSize = (action, state) => {
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

export const updateCurrentItemTitleFontResized = (action, state) => {
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
    } : state
}