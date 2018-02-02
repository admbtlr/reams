import { ADD_ITEM } from './actions'

const initialState = {
  items: []
}

const rizzle = (state = initialState, action) => {
  console.log(state)
  console.log(action)
  switch (action.type) {
    case ADD_ITEM:
      return Object.assign({}, state, {
        items: [
          ...state.items,
          action.item
        ]
      })
    default:
      return state
  }
}

export default rizzle
