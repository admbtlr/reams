import { AsyncThunk, AsyncThunkPayloadCreator, Dispatch, EnhancedStore, configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import makeRootReducer, { RootState } from './reducers'
import FilesystemStorage from 'redux-persist-filesystem-storage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { initSagas } from '../sagas'
import {
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

let store: EnhancedStore | undefined = undefined
let sagaMiddleware: any = null

function initStore() {
  sagaMiddleware = createSagaMiddleware({
    onError: (error, { sagaStack }) => {
      log('sagas', error, sagaStack)
    }
  })

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

  let storage: typeof AsyncStorage | typeof FilesystemStorage
  if (Platform.OS === 'web') {
    storage = AsyncStorage
  } else {
    storage = FilesystemStorage
  }

  const persistConfig = {
    key: 'primary',
    storage,
    timeout: 30000,
    transforms: [messageQueueTransform, orientationTransform],
    // @ts-ignore
    migrate: createMigrate(migrations, { debug: true }),
    version: 22
  }

  const persistedReducer = persistReducer(persistConfig, makeRootReducer())
  const middlewareConf = {
    serializableCheck: false,
    immutableCheck: false
  }

  if (process.env.USE_STATE) {
    store = configureStore({
      reducer: makeRootReducer(),
      // @ts-ignore
      state,
      middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware(middlewareConf)
          .prepend(sagaMiddleware)
          .prepend(downloadsListenerMiddleware.middleware)
      }
    })
  } else {
    store = configureStore({
      reducer: persistedReducer,
      middleware: (getDefaultMiddleware) => {
        const middleware = getDefaultMiddleware(middlewareConf)
          .prepend(sagaMiddleware)
          .prepend(downloadsListenerMiddleware.middleware)
        return middleware
      },
      devTools: false,
      // @ts-ignore
      enhancers: (getDefaultEnhancers) =>
        getDefaultEnhancers().concat(devToolsEnhancer({}))
    })
  }

  sagaMiddleware.run(initSagas)

  // @ts-ignore
  if (window.__DEV__) {
    // @ts-ignore
    window.getState = store.getState
  }

  return store
}

export { initStore }

// https://stackoverflow.com/a/66382690
// declare module "@reduxjs/toolkit" {
//   type AsyncThunkConfig = {
//     state?: unknown;
//     dispatch?: Dispatch;
//     extra?: unknown;
//     rejectValue?: unknown;
//     serializedErrorType?: unknown;
//   };

//   function createAsyncThunk<
//     Returned,
//     ThunkArg = void,
//     ThunkApiConfig extends AsyncThunkConfig = {
//       state: RootState; // this line makes a difference
//     }
//   >(
//     typePrefix: string,
//     payloadCreator: AsyncThunkPayloadCreator<
//       Returned,
//       ThunkArg,
//       ThunkApiConfig
//     >,
//     options?: any
//   ): AsyncThunk<Returned, ThunkArg, ThunkApiConfig>;
// }
