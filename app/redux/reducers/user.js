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

    case 'USER_SET_DETAILS':
      return {
        ...state,
        displayName: action.details.displayName,
        email: action.details.email,
        uid: action.details.uid
      }

    default:
      return state
  }
}
