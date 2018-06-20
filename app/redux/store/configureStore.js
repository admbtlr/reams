import { combineReducers, createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import thunk from 'redux-thunk'
import reducers from '../reducers'
import {updateCurrentIndex} from '../sagas'
import {persistCombineReducers, persistStore} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import {AsyncStorage} from 'react-native'
import FilesystemStorage from 'redux-persist-filesystem-storage'
import {composeWithDevTools} from 'redux-devtools-extension'

export default function configureStore (initialState) {
  const composeEnhancers = composeWithDevTools({
    realtime: window.__DEV__
  })

  const sagaMiddleware = createSagaMiddleware()

  const config = {
    key: 'primary',
    storage: FilesystemStorage,
    throttle: 5000
  }
  let reducer = persistCombineReducers(config, reducers)

  const store = createStore(
    reducer,
    // combineReducers(reducers),
    initialState,
    composeEnhancers(
      applyMiddleware(thunk),
      applyMiddleware(sagaMiddleware)
    )
  )

  const onCompletion = () => {}
  persistStore(store, null, onCompletion)

  sagaMiddleware.run(updateCurrentIndex)

  if (window.__DEV__) {
    window.getState = store.getState
  }

  return store
}
