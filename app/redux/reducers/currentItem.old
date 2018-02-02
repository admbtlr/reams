export function currentItem (state = 0, action) {
  switch (action.type) {
    case 'CURRENT_ITEM_UPDATE_CURRENT_ITEM':
      return {
        item: action.item,
        index: action.index
      }
    case 'CURRENT_ITEM_KEEP_UNREAD':
      return {
        item: {
          ...state.item,
          keepUnread: true
        },
        index: state.index
      }
    default:
      return state
  }
}
