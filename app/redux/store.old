import { createStore } from 'redux'
import rizzle from './reducers'
import { addItem } from './actions'

let store = createStore(rizzle)

let unsubscribe = store.subscribe(() =>
  console.log(store.getState())
)

console.log(store.getState())

store.dispatch(addItem({ title: 'First item' }))
store.dispatch(addItem({ title: 'Second item' }))

unsubscribe()

export default store
