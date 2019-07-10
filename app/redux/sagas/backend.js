import { call, select } from 'redux-saga/effects'

import { syncFeeds } from './feeds'
import { getItemsAS } from '../async-storage'
import { addSavedItemsFS, upsertFeedsFS } from '../firestore'
import { getConfig, getFeeds, getItems, getUid, getUser } from './selectors'
import { setBackend } from '../backends'

export function * initBackend (getFirebase, action) {
  const config = yield select(getConfig)
  const user = yield select(getUser)

  let backend = config.backend
  let backendConfig = ({
    ...config,
    ...user
  })

  // are we setting a new backend, rather than just rehydrating?
  const isNew = action.type === 'CONFIG_SET_BACKEND'

  if (isNew) {
    backend = action.backend
    backendConfig = action
  }

  if (backend === 'rizzle') {
    const uid = yield select(getUid)
    backendConfig = {
      getFirebase,
      uid
    }
  }

  setBackend(backend, backendConfig)

  if (backend === 'rizzle') {
    if (isNew) {
      // copy existing feeds over to rizzle
      const feeds = yield select(getFeeds)
      yield call(upsertFeedsFS, feeds)

      // copy existing saved items over to rizzle
      let savedItems = yield select(getItems, 'saved')
      savedItems = savedItems.map(item => item.savedAt ?
        item :
        {
          ...item,
          savedAt: item.savedAt || item.created_at || Date.now()
        })
      savedItems = yield call(getItemsAS, savedItems)
      yield call(addSavedItemsFS, savedItems)
    }

    yield syncFeeds()
  }
}
