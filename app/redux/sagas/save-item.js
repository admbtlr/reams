import { addSavedItemToFirestore } from '../firestore/'

export function * saveItem (action) {
  yield addSavedItemToFirestore(action.item)
}

