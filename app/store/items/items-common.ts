import {
  Item,
  ItemsState,
  itemDecorationFailureAction,
  itemDecorationSuccessAction,
  markItemReadAction,
  markItemsReadAction,
  setScrollOffsetAction,
  setTitleFontResizedAction,
  setTitleFontSizeAction,
  toggleMercuryViewAction
} from './types'

export const itemMarkRead = (
  action: markItemReadAction, 
  state: ItemsState
) => {
  const items = state.items.map((i: Item) => {
    let item = { ...i }
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
      item = {
        ...item,
        readAt: readItem.readAt || Date.now()
      }
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
  let items = state.items.map((i: Item) => {
    let item = { 
      ...i,
      // need to gracefully migrate to new format
      scrollRatio: i.scrollRatio ?
        typeof i.scrollRatio === 'object' ?
          { ...i.scrollRatio } :
          {
            html: 0,
            mercury: 0
          } :
        {
          html: 0,
          mercury: 0
        }
    }
    if (item._id === action.item._id) {
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
  let items = state.items.map((i: Item) => {
    let item = { ...i }
    if (item._id === action.item._id) {
      item.showMercuryContent = !item.showMercuryContent
      item.hasShownMercury = true
    }
    return item
  })
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
  const items = state.items.map((i: Item) => {
    if (i._id === action.item._id) {
      return {
        ...i,
        coverImageFile: action.imageStuff?.coverImageFile,
        coverImageUrl: action.mercuryStuff?.lead_image_url,
        hasCoverImage: !!action.imageStuff?.coverImageFile,
        imageDimensions: action.imageStuff?.imageDimensions,
        isDecorated: true
      }
    } else {
      return i
    }
  })
  return {
    ...state,
    items
  }

}

export function itemDecorationFailure (
  action: itemDecorationFailureAction, 
  state: ItemsState
) {
  const items = state.items.map((i: Item) => {
    const item = { ...i }
    if (item._id === action.item._id) {
      item.decoration_failures = item.decoration_failures || 0
      item.decoration_failures++
      if (item.decoration_failures > 4 && !item.content_html) {
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

// export function itemsFlate (
//   action: flateItemsAction, 
//   state: ItemsState
// ) {
//   // the items in the action are already inflated/deflated
//   const flatedItems = action.itemsToInflate
//     .concat(action.itemsToDeflate)
//   let items = [...state.items]
//   flatedItems.forEach(fi => {
//     // some of the items might have been deleted in Firebase
//     // which means that they will come back as undefined
//     // I think we can just ignore them
//     // TODO check whether this is really the case!
//     if (fi) {
//       const index = items.findIndex(item => item._id === fi._id)
//       // don't deflate an item that is currently in view
//       if (!(Math.abs(index - state.index) <= 1
//         && typeof fi.content_html === 'undefined')) {
//         items[index] = fi
//       }
//     }
//   })
//   return {
//     ...state,
//     items
//   }
// }

// export function itemsFlateError (
//   action: flateItemsErrorAction, 
//   state: ItemsState
// ) {
//   // something's gone wrong, so just remove them
//   const erroredItems = action.items
//   const items = [...state.items].filter(i => (
//     erroredItems.find(ei => ei._id === i._id) === undefined
//   ))
//   return {
//     ...state,
//     items
//   }
// }

