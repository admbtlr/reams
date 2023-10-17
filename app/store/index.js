import { compose, createStore, applyMiddleware } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import makeRootReducer from './reducers'
import {backgroundFetch, initSagas} from '../sagas'
import {createMigrate, createTransform, persistReducer, persistStore} from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FilesystemStorage from 'redux-persist-filesystem-storage'
import { state } from '../__mocks__/state-input'
import Config from 'react-native-config'
import log from '../utils/log'
import { Dimensions, Platform } from 'react-native'
import { migrations } from './migrations'

let store = null
let persistor = null
let sagaMiddleware = null

function initStore (rehydrateCallback) {
  sagaMiddleware = createSagaMiddleware({
    onError: (error, { sagaStack}) => {
      log('sagas', error, sagaStack)
    }
  })

  const {width, height } = Dimensions.get('window')

  const orientationTransform = createTransform(null, (state, key) => {
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
    version: 10
  }

  const persistedReducer = persistReducer(persistConfig, makeRootReducer())

  if (Config.USE_STATE) {
    store = configureStore({
      reducer: makeRootReducer(),
      state,
      middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware({ thunk: false }).prepend(sagaMiddleware);
      }
    })  
  } else {
    store = configureStore({
      reducer: persistedReducer,
      middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware({ thunk: false }).prepend(sagaMiddleware);
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
