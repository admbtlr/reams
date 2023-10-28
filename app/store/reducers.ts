import { combineReducers, Reducer } from 'redux'

import { itemsUnread } from './items/items-unread'
import { itemsSaved } from './items/items-saved'
import { itemsMeta, ItemsMetaState } from './items/items-meta'
import { feeds } from './feeds/feeds'
import { feedsLocal } from './feeds/feeds-local'
import { ui } from './ui/ui'
import { user, UserState } from './user/user'
import { config, ConfigState } from './config/config'
import { remoteActionQueue, RemoteActionQueueState } from './config/remote-action-queue'
import { categories } from './categories/categories'
import annotations  from './annotations/annotations'
import { ItemsState } from './items/types'
import { FeedsLocalState, FeedsState } from './feeds/types'
import { UIState } from './ui/types'
import { CategoriesState } from './categories/types'
import { Annotation, AnnotationsState } from './annotations/types'

// export default {
//   itemsUnread,
//   itemsSaved,
//   itemsMeta,
//   feeds,
//   toolbar,
//   ui,
//   webView,
//   remoteActionQueue,
//   config
// }

export interface RootState {
  itemsUnread: ItemsState
  itemsSaved: ItemsState
  itemsMeta: ItemsMetaState
  feeds: FeedsState
  feedsLocal: FeedsLocalState
  ui: UIState
  remoteActionQueue: RemoteActionQueueState
  config: ConfigState
  user: UserState
  categories: CategoriesState
  annotations: AnnotationsState
  _persist?: {
    version: number
    rehydrated: boolean
  }
}

export default function makeRootReducer (): Reducer<RootState> {
  return combineReducers({
    // firebase: persistReducer(
    //   {
    //     key: 'firebaseState',
    //     storage: FilesystemStorage,
    //     stateReconciler: hardSet
    //   },
    //   firebase
    // ),
    itemsUnread,
    itemsSaved,
    itemsMeta,
    feeds,
    feedsLocal,
    ui,
    remoteActionQueue,
    config,
    user,
    categories,
    annotations
  })
}
