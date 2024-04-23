import { Source } from '../feeds/types'

export interface Newsletter extends Source {
}

export interface NewslettersState {
  newsletters: Newsletter[]
  updatedAt: number
  queryState: string | undefined
}