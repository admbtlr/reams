export const ITEM_DID_SCROLL_UP = 'ITEM_DID_SCROLL_UP'
export const ITEM_DID_SCROLL_DOWN = 'ITEM_DID_SCROLL_DOWN'
export const ITEM_SCROLL_ZERO = 'ITEM_SCROLL_ZERO'
export const ITEM_HAS_ERRORED = 'ITEM_HAS_ERRORED'
export const ITEM_IS_LOADING = 'ITEM_IS_LOADING'

let scrollPosition = 0

export function itemHasErrored (bool) {
  return {
    type: ITEM_HAS_ERRORED,
    hasErrored: bool
  }
}
export function itemIsLoading (bool) {
  return {
    type: ITEM_IS_LOADING,
    isLoading: bool
  };
}
