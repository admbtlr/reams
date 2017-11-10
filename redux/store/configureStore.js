import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import thunk from 'redux-thunk'
import rootReducer from '../reducers'
import {updateCurrentIndex} from '../sagas'
import {persistStore, autoRehydrate} from 'redux-persist'
import {AsyncStorage} from 'react-native'
import {composeWithDevTools} from 'remote-redux-devtools'

export default function configureStore (initialState) {
  const composeEnhancers = composeWithDevTools({
    realtime: window.__DEV__
  })

  const sagaMiddleware = createSagaMiddleware()

  let store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(
      applyMiddleware(thunk),
      applyMiddleware(sagaMiddleware),
      autoRehydrate()
    )
  )

  const onCompletion = () => {}
  persistStore(store, {storage: AsyncStorage}, onCompletion)

  sagaMiddleware.run(updateCurrentIndex)

  if (window.__DEV__) {
    window.getState = store.getState
  }

  return store
}
