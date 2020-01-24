const initialState = {
  scrollAnim: undefined,
  scrollAnimId: undefined,
  panAnim: undefined
}

export function animatedValues (state = initialState, action) {
  let fontSize
  switch (action.type) {
    case 'SET_SCROLL_ANIM':
      return {
        ...state,
        scrollAnim: action.scrollAnim,
        scrollAnimId: action.item_id
      }

    case 'SET_PAN_ANIM':
      return {
        ...state,
        panAnim: action.panAnim
      }

    default:
      return state
  }
}
