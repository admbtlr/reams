import { compose, createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import makeRootReducer from './reducers'
import {initSagas} from '../sagas'
import {persistReducer, persistStore} from 'redux-persist'
import FilesystemStorage from 'redux-persist-filesystem-storage'
import {composeWithDevTools} from 'redux-devtools-extension'
import { state } from '../__mocks__/state-input'
import Config from 'react-native-config'
import log from '../utils/log'

let store = null
let persistor = null

function configureStore () {
  const composeEnhancers = composeWithDevTools({
    realtime: window.__DEV__
  })

  const sagaMiddleware = createSagaMiddleware({
    onError: (error, { sagaStack}) => {
      log('sagas', error, sagaStack)
    }
  })

  const persistConfig = {
    key: 'primary',
    storage: FilesystemStorage,
    timeout: 30000,
    blacklist: ['animatedValues']
  }

  const persistedReducer = persistReducer(persistConfig, makeRootReducer())

  console.log(state)
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

  sagaMiddleware.run(initSagas)

  if (window.__DEV__) {
    window.getState = store.getState
  }

  return store
}

export { store, configureStore, persistor }
