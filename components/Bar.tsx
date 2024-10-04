import React from 'react'
import { View } from "react-native"
import { useColor } from "../hooks/useColor"
import { getMargin } from '../utils/dimensions'
import { Item } from '../store/items/types'

export const Bar = ({ item }: { item: Item }) => {
  const color = useColor(item.url)
  return <View style={{
    height: 20,
    width: 100,
    backgroundColor: color,
    borderRadius: 10
  }} />
}