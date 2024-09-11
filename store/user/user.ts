import { id } from '../../utils'
import { 
  ConfigActionTypes
} from '../config/types'
import {
  SET_SIGN_IN_EMAIL,
  SET_USER_DETAILS,
  SET_BACKEND,
  UNSET_BACKEND,
  UserActionTypes,
} from '../user/types'

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
  readonly password?: string
  readonly accessToken?: string
  readonly email?: string
}

export interface UserState {
  readonly userId?: string
  readonly email?: string
  readonly codeName?: string
  readonly backends: Backend[]
  readonly analyticsId: string
  readonly signInEmail?: string
}

const initialState = {
  userId: '',
  email: '',
  codeName: '',
  // this ternary is because id isn't a function in the test environment
  analyticsId: typeof id === 'function' ? id() : '',
  backends: []
}

export function user (
  state: UserState = (!!process.env.USER_STATE ? JSON.parse(process.env.USER_STATE) : initialState), 
  action: ConfigActionTypes | UserActionTypes
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
          userId: details.id,
          codeName: details.codeName
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
      if (action.backend === 'reams') {
        return initialState
      } else {
        backends = state.backends.filter((b: Backend) => b.name !== action.backend)
        return {
          ...state,
          backends
        }
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
