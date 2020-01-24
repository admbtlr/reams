import { combineReducers } from 'redux'

import { itemsUnread, itemsHasErrored } from './items-unread'
import { itemsSaved } from './items-saved'
import { itemsMeta } from './items-meta'
import { feeds } from './feeds'
import { feedsLocal } from './feeds-local'
import { toolbar } from './toolbar'
import { ui } from './ui'
import { user } from './user'
import { webView } from './webView'
import { config } from './config'
import { remoteActionQueue } from './remote-action-queue'
import { animatedValues } from './animated-values'

// export default {
//   itemsUnread,
//   itemsSaved,
//   itemsMeta,
//   itemsHasErrored,
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
    itemsHasErrored,
    feeds,
    feedsLocal,
    toolbar,
    ui,
    webView,
    remoteActionQueue,
    config,
    user,
    animatedValues
  })
}
