import React from 'react'
import {
  Dimensions,
} from 'react-native'
import ButtonSet from './ButtonSet'

import { useBufferedItems } from './BufferedItemsContext'

const ButtonSets = (props) => {
  if (props.isOnboarding) {
    return null
  }

  const {
    bufferedItems,
  } = useBufferedItems()

  return bufferedItems ?
    bufferedItems.map((item, i) => {
      return item ? (
        <ButtonSet
          item={item}
          key={`buttons: ${item._id}`}
          itemIndex={i}
        />
      ) : null
    })
    :
    null
}

export default ButtonSets
