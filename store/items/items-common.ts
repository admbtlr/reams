import { Platform } from 'react-native'
import { RootState } from '../reducers'
import {
  Item,
  ItemType,
  ItemsState,
  itemDecorationFailureAction,
  itemDecorationSuccessAction,
  imageAnalysisSuccessAction,
  markItemReadAction,
  markItemsReadAction,
  resetDecorationFailuresAction,
  setScrollOffsetAction,
  // setTitleFontResizedAction,
  setTitleFontSizeAction,
  toggleMercuryViewAction
} from './types'

export const itemMarkRead = (action: markItemReadAction, state: ItemsState) => {
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

export function itemsMarkRead(action: markItemsReadAction, state: ItemsState) {
  if (action.items.length === 0) {
    return state
  }
  const items = state.items.map((item) => {
    const readItem = action.items.find((ai) => ai._id === item._id)
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

export function itemSetScrollOffset(
  action: setScrollOffsetAction,
  state: ItemsState
) {
  let items = state.items.map((i: Item) => {
    let item = {
      ...i,
      // need to gracefully migrate to new format
      scrollRatio: i.scrollRatio
        ? typeof i.scrollRatio === 'object'
          ? { ...i.scrollRatio }
          : {
              html: 0,
              mercury: 0
            }
        : {
            html: 0,
            mercury: 0
          }
    }
    if (item._id === action.item._id) {
      const content = item.showMercuryContent ? 'mercury' : 'html'
      item.scrollRatio[content] = Math.max(
        action.scrollRatio,
        item.scrollRatio[content] || 0
      )
    }
    return item
  })
  return {
    ...state,
    items
  }
}

export function itemToggleMercury(
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

export function itemDecorationSuccess(
  action: itemDecorationSuccessAction,
  state: ItemsState,
  isCurrentDisplayMode: boolean
) {
  const items = state.items.map((i: Item) => {
    if (i._id === action.item._id) {
      return {
        ...i,
        coverImageUrl: action.mercuryStuff?.lead_image_url,
        hasCoverImage:
          Platform.OS === 'web'
            ? !!action.mercuryStuff?.lead_image_url
            : !!action.imageStuff?.imageDimensions,
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

export function imageAnalysisSuccess(
  action: imageAnalysisSuccessAction,
  state: ItemsState
) {
  const items = state.items.map((i: Item) =>
    i._id === action.item._id
      ? {
          ...i,
          isAnalysed: true
        }
      : i
  )
  return {
    ...state,
    items
  }
}

export function itemDecorationFailure(
  action: itemDecorationFailureAction,
  state: ItemsState
) {
  const items = state.items.map((i: Item) => {
    const item = { ...i }
    if (item._id === action.item._id) {
      item.decoration_failures = item.decoration_failures || 0
      item.decoration_failures++
      // if (item.decoration_failures > 4 && !item.content_html) {
      //   item.content_html = '<p>This story could not be loaded 😞</p><p>'
      //     + item.url + '</p>' +
      //     (action.mercuryStuff?.message ? ('<p>' + action.mercuryStuff.message + '</p>') : '')
      // }
    }
    return item
  })
  return {
    ...state,
    items
  }
}

export function itemBodyCleaned(
  action: setTitleFontSizeAction,
  state: ItemsState
) {
  const items = state.items.map((i: Item) => {
    const item = { ...i }
    if (item._id === action.item._id) {
      if (item.showMercuryContent) {
        item.isMercuryCleaned = true
      } else {
        item.isHtmlCleaned = true
      }
    }
    return item
  })
  return {
    ...state,
    items
  }
}

export function resetDecorationFailures(
  action: resetDecorationFailuresAction,
  state: ItemsState
) {
  const items = state.items.map((i: Item) => {
    const item = { ...i }
    if (item._id === action.itemId) {
      item.decoration_failures = 0
    }
    return item
  })
  return {
    ...state,
    items
  }
}

export function updateCurrentItemTitleFontSize(
  action: setTitleFontSizeAction,
  state: ItemsState
) {
  let stateChanged = false
  const newItems = state.items.map((item) => {
    if (item._id === action.item._id) {
      // if (item.styles && item.styles.title.fontSize !== action.fontSize) {
      //   item.styles.title.fontSize = action.fontSize
      //   item.styles.title.lineHeight = action.fontSize
      //   item.styles.title.fontResized = true
      //   stateChanged = true
      // }
    }
    return item
  })
  return stateChanged
    ? {
        ...state,
        items: newItems
      }
    : state
}
