import { AsyncThunk, AsyncThunkPayloadCreator, Dispatch, EnhancedStore, configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import makeRootReducer, { RootState } from './reducers'
import FilesystemStorage from 'redux-persist-filesystem-storage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { initSagas } from '../sagas'
import {
  PersistPartial,
  createMigrate,
  createTransform,
  persistReducer,
  persistStore,
} from 'redux-persist'
import { state } from '../__mocks__/state-input'
import log from '../utils/log'
import { Dimensions, Platform } from 'react-native'
import { migrations } from './migrations'
import { ConfigState } from './config/config'
import { UIState } from './ui/types'
import { downloadsListenerMiddleware } from './listenerMiddleware'
import devToolsEnhancer from 'redux-devtools-expo-dev-plugin'
import { getStyle } from 'react-native-svg/lib/typescript/xml'
import { getStoredState } from 'redux-persist/es/integration/getStoredStateMigrateV4'

let store: EnhancedStore | undefined = undefined
let persistor: any = null
let sagaMiddleware: any = null

let storage: typeof AsyncStorage | typeof FilesystemStorage
if (Platform.OS === 'web') {
  storage = AsyncStorage
} else {
  storage = FilesystemStorage
}

const getPersistedReducer = () => {
  const { width, height } = Dimensions.get('window')
  // @ts-ignore
  const orientationTransform = createTransform(null, (state: ConfigState, _) => {
    const newState = { ...state }
    newState.orientation = height > width ? 'portrait' : 'landscape'
    return newState
  }, { whitelist: ['config'] })

  // remove the message queue
  // @ts-ignore
  const messageQueueTransform = createTransform(null, (state: UIState, _) => {
    const newState = { ...state }
    newState.messageQueue = []
    return newState
  }, { whitelist: ['ui'] })

  const persistConfig = {
    key: 'primary',
    storage,
    timeout: 30000,
    transforms: [messageQueueTransform, orientationTransform],
    // @ts-ignore
    migrate: createMigrate(migrations, { debug: true }),
    version: 27
  }

  return persistReducer(persistConfig, makeRootReducer())
}

const middlewareConf = {
  serializableCheck: false,
  immutableCheck: false
}

// https://redux.js.org/usage/writing-tests
const setupStore = (preloadedState?: RootState & PersistPartial) => {
  if (!sagaMiddleware) {
    sagaMiddleware = createSagaMiddleware()
  }
  return configureStore({
    reducer: getPersistedReducer(),
    middleware: (getDefaultMiddleware) => {
      // @ts-ignore
      const middleware = getDefaultMiddleware(middlewareConf)
        .prepend(sagaMiddleware)
        .prepend(downloadsListenerMiddleware.middleware)
      return middleware
    },
    preloadedState,
    devTools: false,
    // @ts-ignore
    enhancers: (getDefaultEnhancers) =>
      getDefaultEnhancers().concat(devToolsEnhancer({}))
  })
}

function initStore() {
  sagaMiddleware = createSagaMiddleware({
    onError: (error, { sagaStack }) => {
      log('sagas', error, sagaStack)
    }
  })

  // if (process.env.USE_STATE) {
  //   store = setupStore(state)
  // } else {
  store = setupStore()
  // }

  persistor = persistStore(store)
  sagaMiddleware.run(initSagas)

  // @ts-ignore
  if (window.__DEV__) {
    // @ts-ignore
    window.getState = store.getState
  }

  return store
}

export { initStore, persistor, setupStore, store }
