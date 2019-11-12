import React from 'react'
import {
  Button,
  Text,
  View
} from 'react-native'

export default function ModalScreen ({ navigation }) {
  return (
    <View style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white',
      marginTop: 50,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30
    }}>
      <Text style={{ fontSize: 30 }}>This is a modal!</Text>
      <Button
        onPress={() => navigation.goBack()}
        title="Dismiss"
      />
    </View>
  )
}
