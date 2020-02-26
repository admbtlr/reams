import { 
  SET_BACKEND, 
  SET_SIGN_IN_EMAIL,
  SET_UID,
  SET_USER_DETAILS,
  UNSET_BACKEND 
} from './types'

const initialState = {
  displayName: '',
  email: '',
  password: '',
  accessToken: '',
  signInEmail: '',
  uid: '',
  username: ''
}

export function user (state = initialState, action) {
  switch (action.type) {
    case SET_UID:
      return {
        ...state,
        uid: action.uid
      }

    case SET_USER_DETAILS:
      const { details } = action
      if (!details) {
        return state
      } else {
        return {
          ...state,
          ...details
        }
      }

    case SET_BACKEND:
      const {
        credentials
      } = action
      return {
        ...state,
        ...credentials
      }

    case UNSET_BACKEND:
      return initialState

    case SET_SIGN_IN_EMAIL:
      return {
        ...state,
        signInEmail: action.email
      }

    default:
      return state
  }
}
