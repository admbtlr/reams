import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
// import thunk from 'redux-thunk'
import makeRootReducer from '../reducers'
import {updateCurrentIndex} from '../sagas'
import {persistReducer, persistStore} from 'redux-persist'
import FilesystemStorage from 'redux-persist-filesystem-storage'
import firebase from 'react-native-firebase'
import { getFirebase, reactReduxFirebase } from 'react-redux-firebase'
import { reduxFirestore } from 'redux-firestore'
import {composeWithDevTools} from 'redux-devtools-extension'

let store = null

function configureStore () {
  const composeEnhancers = composeWithDevTools({
    realtime: window.__DEV__
  })

  const sagaMiddleware = createSagaMiddleware()

  const persistConfig = {
    key: 'primary',
    storage: FilesystemStorage,
    // debug: true,
    // blacklist: ['itemsUnread', 'itemsSaved']
  }

  const reactReduxFirebaseConfig = {
    userProfile: 'users', // firebase root where user profiles are stored
    // enableLogging: false, // enable/disable Firebase's database logging
    enableRedirectHandling: false // https://github.com/invertase/react-native-firebase/issues/431
  }

  firebase.firestore()

  const persistedReducer = persistReducer(persistConfig, makeRootReducer())

  store = createStore(
    persistedReducer,
    // combineReducers(reducers),
    {},
    composeEnhancers(
      // applyMiddleware(thunk),
      reactReduxFirebase(firebase, reactReduxFirebaseConfig),
      reduxFirestore(firebase),
      applyMiddleware(sagaMiddleware)
    )
  )

  const onCompletion = () => {
    console.log('Store persisted')
  }
  persistStore(store, null, onCompletion)

  sagaMiddleware.run(updateCurrentIndex, getFirebase)

  if (window.__DEV__) {
    window.getState = store.getState
  }

  return store
}

export { store, configureStore }