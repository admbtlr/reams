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
import RNFirebase from 'react-native-firebase'
import { firebaseReducer, getFirebase, reactReduxFirebase } from 'react-redux-firebase'
import { reduxFirestore, firestoreReducer } from 'redux-firestore'
import {composeWithDevTools} from 'redux-devtools-extension'

export default function configureStore (initialState) {
  const composeEnhancers = composeWithDevTools({
    realtime: window.__DEV__
  })

  const sagaMiddleware = createSagaMiddleware()

  const persistConfig = {
    key: 'primary',
    storage: FilesystemStorage,
    throttle: 5000,
    debug: true,
    blackList: ['itemsUnread', 'itemsSaved']
  }

  const firebaseConfig = {
    apiKey: "AIzaSyDsV89U3hnA0OInti2aAlCVk_Ymi04-A-o",
    authDomain: "rizzle-base.firebaseapp.com",
    databaseURL: "https://rizzle-base.firebaseio.com",
    storageBucket: "rizzle-base.appspot.com",
    messagingSenderId: "801044191408"
  }

  const reactReduxFirebaseConfig = {
    userProfile: 'users', // firebase root where user profiles are stored
    // enableLogging: false, // enable/disable Firebase's database logging
  }

  const firebase = RNFirebase.initializeApp(firebaseConfig);
  firebase.firestore()

  const persistedReducer = persistReducer(persistConfig, makeRootReducer())

  const store = createStore(
    persistedReducer,
    // combineReducers(reducers),
    initialState,
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
