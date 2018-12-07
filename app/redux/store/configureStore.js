import { combineReducers, createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
// import thunk from 'redux-thunk'
import makeRootReducer from '../reducers'
import {createItemsUnreadReducer} from '../reducers/items-unread'
import {updateCurrentIndex} from '../sagas'
import {persistReducer, persistStore} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import {AsyncStorage} from 'react-native'
import FilesystemStorage from 'redux-persist-filesystem-storage'
import firebase from 'react-native-firebase'
import { firebaseReducer, getFirebase, reactReduxFirebase } from 'react-redux-firebase'
import { reduxFirestore, firestoreReducer } from 'redux-firestore'
import {composeWithDevTools} from 'redux-devtools-extension'

export default function configureStore () {
  const composeEnhancers = composeWithDevTools({
    realtime: window.__DEV__
  })

  const sagaMiddleware = createSagaMiddleware()

  const persistConfig = {
    key: 'primary',
    storage: FilesystemStorage,
    throttle: 5000,
    debug: true,
    blacklist: ['itemsUnread', 'itemsSaved']
  }

  const reactReduxFirebaseConfig = {
    userProfile: 'users', // firebase root where user profiles are stored
    // enableLogging: false, // enable/disable Firebase's database logging
  }

  firebase.firestore()

  const persistedReducer = persistReducer(persistConfig, makeRootReducer())

  const store = createStore(
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
