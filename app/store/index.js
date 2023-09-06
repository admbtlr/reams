import { compose, createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import makeRootReducer from './reducers'
import {backgroundFetch, initSagas} from '../sagas'
import {createMigrate, createTransform, persistReducer, persistStore} from 'redux-persist'
import FilesystemStorage from 'redux-persist-filesystem-storage'
import {composeWithDevTools} from 'redux-devtools-extension'
import { state } from '../__mocks__/state-input'
import Config from 'react-native-config'
import log from '../utils/log'
import { Dimensions } from 'react-native'
import { migrations } from './migrations'

let store = null
let persistor = null
let sagaMiddleware = null

function configureStore (rehydrateCallback) {
  const composeEnhancers = composeWithDevTools({
    realtime: window.__DEV__
  })

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

  const persistConfig = {
    key: 'primary',
    storage: FilesystemStorage,
    timeout: 30000,
    transforms: [orientationTransform],
    blacklist: ['animatedValues'],
    migrate: createMigrate(migrations, { debug: true }),
    version: 10
  }

  const persistedReducer = persistReducer(persistConfig, makeRootReducer())

  if (Config.USE_STATE) {
    store = createStore(
      makeRootReducer(),
      state,
      composeEnhancers(
        applyMiddleware(sagaMiddleware),
        // Reactotron.createEnhancer()
      )
    )  
  } else {
    store = createStore(
      persistedReducer,
      {},
      composeEnhancers(
        applyMiddleware(sagaMiddleware),
        // Reactotron.createEnhancer()
      )
    )
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

export { store, configureStore, doBackgroundFetch, persistor }
