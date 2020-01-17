import { compose, createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
// import thunk from 'redux-thunk'
import makeRootReducer from '../reducers'
import {initSagas} from '../sagas'
import {persistReducer, persistStore} from 'redux-persist'
import FilesystemStorage from 'redux-persist-filesystem-storage'
import firestore from '@react-native-firebase/firestore'
import { getFirebase } from 'react-redux-firebase'
import {composeWithDevTools} from 'redux-devtools-extension'
import log from '../../utils/log'
import Reactotron from '../../reactotron.config'

let store = null

function configureStore () {
  const composeEnhancers = composeWithDevTools({
    realtime: window.__DEV__
  })

  const sagaMonitor = Reactotron.createSagaMonitor()
  const sagaMiddleware = createSagaMiddleware({ sagaMonitor })

  const persistConfig = {
    key: 'primary',
    storage: FilesystemStorage
  }

  firestore()

  const persistedReducer = persistReducer(persistConfig, makeRootReducer())

  store = createStore(
    persistedReducer,
    // combineReducers(reducers),
    {},
    // composeEnhancers(
    compose(
      // applyMiddleware(thunk),
      // reactReduxFirebase(firebase, reactReduxFirebaseConfig),
      // reduxFirestore(firebase),
      applyMiddleware(sagaMiddleware),
      Reactotron.createEnhancer()
    )
  )

  const onCompletion = () => {
    console.log('Store persisted')
  }
  persistStore(store, null, onCompletion)

  sagaMiddleware.run(initSagas, getFirebase)

  if (window.__DEV__) {
    window.getState = store.getState
  }

  return store
}

export { store, configureStore }
