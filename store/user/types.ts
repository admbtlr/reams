import { user } from "./user"
import { User } from "@supabase/supabase-js"

export const SET_BACKEND = 'SET_BACKEND'
export const UNSET_BACKEND = 'UNSET_BACKEND'
export const SET_EXTRA_BACKEND = 'SET_EXTRA_BACKEND'
export const UNSET_EXTRA_BACKEND = 'UNSET_EXTRA_BACKEND'
export const SET_UID = 'SET_UID'
export const SET_USER_DETAILS = 'SET_USER_DETAILS'
export const SET_SIGN_IN_EMAIL = 'SET_SIGN_IN_EMAIL'

interface credentials {
  username?: string
  accessToken?: string
  email?: string
}

interface UserDetails extends User {
  codeName?: string
}

interface setBackendAction {
  type: typeof SET_BACKEND
  backend: string
  credentials: credentials | null
}

interface unsetBackendAction {
  backend: string | null
  type: typeof UNSET_BACKEND
}

interface setExtraBackend {
  type: typeof SET_EXTRA_BACKEND
  backend: string
  credentials: {
    token?: string
  }
}

interface unsetExtraBackend {
  type: typeof UNSET_EXTRA_BACKEND
  backend: string
}

interface setUidAction {
  type: typeof SET_UID
  uid: string
}

interface setUserDetailsAction {
  type: typeof SET_USER_DETAILS
  details: UserDetails
}

interface setSignInEmailAction {
  type: typeof SET_SIGN_IN_EMAIL
  email: string
}

export type UserActionTypes = setBackendAction | 
  unsetBackendAction | 
  setExtraBackend | 
  unsetExtraBackend |
  setUidAction |
  setUserDetailsAction |
  setSignInEmailAction