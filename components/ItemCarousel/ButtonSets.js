import React from 'react'
import {
  Dimensions,
} from 'react-native'
import ButtonSet from './ButtonSet'

import { useRenderedWindow } from './bufferedItemsStore'
import { useBufferedItemsManager } from './useBufferedItemsManager'

const ButtonSets = (props) => {
  if (props.isOnboarding) {
    return null
  }

  // One ButtonSet per rendered window slot only (≤ window size)
  const renderedWindow = useRenderedWindow()

  if (renderedWindow.length === 0) return null

  return renderedWindow.map(({ slotIndex }) => (
    <ButtonSet
      key={`button-set-${slotIndex}`}
      slotIndex={slotIndex}
    />
  ))
}

export default ButtonSets
