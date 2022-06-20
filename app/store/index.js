import { compose, createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import makeRootReducer from './reducers'
import {initSagas} from '../sagas'
import {createTransform, persistReducer, persistStore} from 'redux-persist'
import FilesystemStorage from 'redux-persist-filesystem-storage'
import {composeWithDevTools} from 'redux-devtools-extension'
import { state } from '../__mocks__/state-input'
import Config from 'react-native-config'
import log from '../utils/log'
import { Dimensions } from 'react-native'

let store = null
let persistor = null

function configureStore (backgroundFetchCallback) {
  const composeEnhancers = composeWithDevTools({
    realtime: window.__DEV__
  })

  const sagaMiddleware = createSagaMiddleware({
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
    blacklist: ['animatedValues']
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
    persistor = persistStore(store, null, onCompletion)
  }



  const onCompletion = () => {
    console.log('Store persisted')
  }

  sagaMiddleware.run(initSagas, backgroundFetchCallback)

  if (window.__DEV__) {
    window.getState = store.getState
  }

  return store
}

export { store, configureStore, persistor }
