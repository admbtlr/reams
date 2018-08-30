import { combineReducers, createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import thunk from 'redux-thunk'
import reducers from '../reducers'
import {createItemsUnreadReducer} from '../reducers/items-unread'
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
    throttle: 5000,
    debug: true
  }
  let reducer = persistCombineReducers(config, {
    ...reducers,
    itemsData0: createItemsUnreadReducer('0'),
    itemsData1: createItemsUnreadReducer('1'),
    itemsData2: createItemsUnreadReducer('2'),
    itemsData3: createItemsUnreadReducer('3'),
    itemsData4: createItemsUnreadReducer('4'),
    itemsData5: createItemsUnreadReducer('5'),
    itemsData6: createItemsUnreadReducer('6'),
    itemsData7: createItemsUnreadReducer('7'),
    itemsData8: createItemsUnreadReducer('8'),
    itemsData9: createItemsUnreadReducer('9'),
    itemsDataA: createItemsUnreadReducer('A'),
    itemsDataB: createItemsUnreadReducer('B'),
    itemsDataC: createItemsUnreadReducer('C'),
    itemsDataD: createItemsUnreadReducer('D'),
    itemsDataE: createItemsUnreadReducer('E'),
    itemsDataF: createItemsUnreadReducer('F'),
  })

  const store = createStore(
    reducer,
    // combineReducers(reducers),
    initialState,
    composeEnhancers(
      applyMiddleware(thunk),
      applyMiddleware(sagaMiddleware)
    )
  )

  const onCompletion = () => {
    console.log('Store persisted')
  }
  persistStore(store, null, onCompletion)

  sagaMiddleware.run(updateCurrentIndex)

  if (window.__DEV__) {
    window.getState = store.getState
  }

  return store
}
