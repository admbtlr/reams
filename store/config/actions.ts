import {
  SET_BACKEND,
} from './types'

export function setBackend (backend: string) {
  return {
    type: SET_BACKEND,
    backend
  }
}
