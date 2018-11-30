const initialState = {
  uid: ''
}

export function user (state = initialState, action) {
  switch (action.type) {
    case 'USER_SET_UID':
      return {
        ...state,
        uid: action.uid
      }

    default:
      return state
  }
}
