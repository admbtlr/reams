import { combineReducers } from 'redux'

import { itemsUnread } from './items/items-unread'
import { itemsSaved } from './items/items-saved'
import { itemsMeta } from './items/items-meta'
import { feeds } from './feeds/feeds'
import { feedsLocal } from './feeds/feeds-local'
import { toolbar } from './ui/toolbar'
import { ui } from './ui/ui'
import { user } from './config/user'
import { config } from './config/config'
import { remoteActionQueue } from './config/remote-action-queue'

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

export default function makeRootReducer () {
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
    toolbar,
    ui,
    remoteActionQueue,
    config,
    user
  })
}
