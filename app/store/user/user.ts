import { id } from '../../utils'
import { 
  SET_BACKEND, 
  SET_SIGN_IN_EMAIL,
  SET_UID,
  SET_USER_DETAILS,
  UNSET_BACKEND,
  ConfigActionTypes
} from '../config/types'

// export interface UserState {
//   readonly displayName: string
//   readonly email: string
//   readonly password: string
//   readonly accessToken: string
//   readonly uid: string
//   readonly username: string
//   readonly supaUserId: string
//   readonly supaEmail: string | undefined
//   readonly analyticsId: string
// }

export interface Backend {
  readonly name: string
  readonly username?: string
  readonly accessToken?: string
  readonly email?: string
}

export interface UserState {
  readonly userId?: string
  readonly email?: string
  readonly backends: Backend[]
  readonly analyticsId: string
}


const initialState = {
  userId: '',
  email: '',
  analyticsId: id(),
  backends: []
}

export function user (
  state = initialState, 
  action: ConfigActionTypes
) : UserState {
  let backends: Backend[]
  switch (action.type) {
    // case SET_UID:
    //   return {
    //     ...state,
    //     uid: action.uid
    //   }

    case SET_USER_DETAILS:
      const { details } = action
      if (!details) {
        return state
      } else {
        return {
          ...state,
          email: details.email,
          userId: details.id
        }
      }

    case SET_BACKEND:
      const {
        backend,
        credentials
      } = action
      backends = state.backends.filter((b: Backend) => b.name !== action.backend)
      return {
        ...state,
        backends: [
          ...backends,
          {
            name: backend,
            username: credentials?.username,
            accessToken: credentials?.accessToken,
            email: credentials?.email
          }
        ],
      }

    case UNSET_BACKEND:
      backends = state.backends.filter((b: Backend) => b.name !== action.backend)
      return {
        ...state,
        backends
      }

    case SET_SIGN_IN_EMAIL:
      return {
        ...state,
        signInEmail: action.email
      }

    default:
      return state
  }
}
