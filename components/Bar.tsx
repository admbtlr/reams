import React from 'react'
import { View } from 'react-native'
import { useColor } from '../hooks/useColor'
import { getMargin } from '../utils/dimensions'
import { Item } from '../store/items/types'

export const Bar = ({ item, testID }: { item: Item; testID?: string }) => {
  const color = useColor(item.host)
  return (
    <View
      testID={testID}
      style={{
        height: 20,
        width: 100,
        backgroundColor: color,
        borderRadius: 10,
        overflow: 'hidden'
      }}
    />
  )
}
