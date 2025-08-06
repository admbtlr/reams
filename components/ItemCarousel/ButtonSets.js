import React from 'react'
import {
  Dimensions,
} from 'react-native'
import ButtonSet from './ButtonSet'

import { useBufferedItemsLength } from './bufferedItemsStore'
import { useBufferedItemsManager } from './useBufferedItemsManager'

const ButtonSets = (props) => {
  if (props.isOnboarding) {
    return null
  }

  // Get buffered items length from Zustand store
  const bufferedItemsLength = useBufferedItemsLength()

  if (bufferedItemsLength === 0) return null

  return Array.from({ length: bufferedItemsLength }, (_, i) => (
    <ButtonSet
      key={`button-set-${i}`}
      itemIndex={i}
    />
  ))
}

export default ButtonSets
