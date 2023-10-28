import { compose, createStore, applyMiddleware } from 'redux'
import { AsyncThunk, AsyncThunkPayloadCreator, Dispatch, configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import makeRootReducer, { RootState } from './reducers'
import {backgroundFetch, initSagas} from '../sagas'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  createMigrate, 
  createTransform, 
  persistReducer, 
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import { state } from '../__mocks__/state-input'
import Config from 'react-native-config'
import log from '../utils/log'
import { Dimensions, Platform } from 'react-native'
import { migrations } from './migrations'
import { ConfigState } from './config/config'

let store = null
let persistor = null
let sagaMiddleware = null

function initStore (rehydrateCallback?: () => void) {
  sagaMiddleware = createSagaMiddleware({
    onError: (error, { sagaStack}) => {
      log('sagas', error, sagaStack)
    }
  })

  const {width, height } = Dimensions.get('window')

  const orientationTransform = createTransform(null, (state: ConfigState, key) => {
    const newState = {...state}
    newState.orientation = height > width ? 'portrait' : 'landscape'
    return newState
  }, { whitelist: ['config'] })

  let storage
  if (Platform.OS === 'web') {
    storage = AsyncStorage
  } else {
    // storage = require('redux-persist-filesystem-storage').FilesystemStorage
  }

  const persistConfig = {
    key: 'primary',
    storage,
    timeout: 30000,
    transforms: [orientationTransform],
    blacklist: ['animatedValues'],
    migrate: createMigrate(migrations, { debug: true }),
    version: 11
  }

  const persistedReducer = persistReducer(persistConfig, makeRootReducer())
  const middlewareConf = {
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }

  if (Config.USE_STATE) {
    store = configureStore({
      reducer: makeRootReducer(),
      state,
      middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware(middlewareConf).prepend(sagaMiddleware);
      }
    })  
  } else {
    store = configureStore({
      reducer: persistedReducer,
      middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware(middlewareConf).prepend(sagaMiddleware);
      }
    })
    persistor = persistStore(store, null, rehydrateCallback || onCompletion)
  }

  const onCompletion = () => {
    console.log('Store persisted')
  }

  sagaMiddleware.run(initSagas)

  if (window.__DEV__) {
    window.getState = store.getState
  }

  return store
}

async function doBackgroundFetch(callback) {
  await sagaMiddleware.run(backgroundFetch, callback)
}

export { store, initStore, doBackgroundFetch, persistor }

// https://stackoverflow.com/a/66382690
declare module "@reduxjs/toolkit" {
  type AsyncThunkConfig = {
    state?: unknown;
    dispatch?: Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
  };

  function createAsyncThunk<
    Returned,
    ThunkArg = void,
    ThunkApiConfig extends AsyncThunkConfig = {
      state: RootState; // this line makes a difference
    }
  >(
    typePrefix: string,
    payloadCreator: AsyncThunkPayloadCreator<
      Returned,
      ThunkArg,
      ThunkApiConfig
    >,
    options?: any
  ): AsyncThunk<Returned, ThunkArg, ThunkApiConfig>;
}
