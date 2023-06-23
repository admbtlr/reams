import React, { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { getMargin } from '../utils'
import { hslString } from '../utils/colors'
import { textInfoStyle } from '../utils/styles'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'

interface RadioButtonProps {
  data: { 
    value: number 
    label: string
    icon?: string
  }[]
  selected: number
  onSelect: (value: number) => void
}

export default function RadioButtons({ data, selected, onSelect }: RadioButtonProps) {
  return (
    <View style={{ 
      flex: 1,
      flexDirection: 'row',
    }}>
      {data.map((item, index) => {
        return (
          <View 
            key={index}
            style={{
              flex: 1,
              marginRight: index < data.length - 1 ? getMargin() : 0,
              padding: getMargin() * 0.5,
              borderColor: item.value === selected ? hslString('logo1') : hslString('rizzleText'),
              borderWidth: 1,
              borderRadius: getMargin() * 0.5,
              backgroundColor: item.value === selected ? hslString('logo1') : hslString('white'),
            }}>
            <Pressable
              style={{
                // flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => onSelect(item.value)}>
              { item.icon && getRizzleButtonIcon(item.icon, item.value === selected ? hslString('white') : hslString('rizzleText'))}
              <Text 
                style={{
                  ...textInfoStyle('rizzleText', 0, true),
                  color: item.value === selected ? hslString('white') : hslString('rizzleText')
                }}> {item.label}</Text>
            </Pressable>
          </View>
        )
      })}
    </View>
  )
}