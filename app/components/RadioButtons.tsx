import React, { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { getMargin } from '../utils'
import { hslString } from '../utils/colors'
import { textInfoStyle } from '../utils/styles'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'

interface RadioButtonProps {
  data: { value: string }[]
  onSelect: (value: string) => void
}

export default function RadioButtons({ data, onSelect }: RadioButtonProps) {
  const [userOption, setUserOption] = useState<string>(null)
  const selectHandler = (value: string) => {
    onSelect(value)
    setUserOption(value)
  }
  return (
    <View style={{ 
      flex: 1,
      flexDirection: 'row',
    }}>
      {data.map((item, index) => {
        return (
          <View style={{
            flex: 1,
            marginRight: index < data.length - 1 ? getMargin() : 0,
            padding: getMargin() * 0.5,
            borderColor: item.value === userOption ? hslString('logo1') : hslString('rizzleText'),
            borderWidth: 1,
            borderRadius: getMargin() * 0.5,
            backgroundColor: item.value === userOption ? hslString('logo1') : hslString('white'),
          }}>
            <Pressable
              style={{
                // flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => selectHandler(item.value)}>
              { item.icon && getRizzleButtonIcon(item.icon, item.value === userOption ? hslString('white') : hslString('rizzleText'))}
              <Text 
                style={{
                  ...textInfoStyle('rizzleText', 0, true),
                  color: item.value === userOption ? hslString('white') : hslString('rizzleText')
                }}> {item.label}</Text>
            </Pressable>
          </View>
        )
      })}
    </View>
  )
}