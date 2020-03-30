import React from 'react'
import {
  Button,
  Text,
  View
} from 'react-native'
import { isIphoneX } from '../utils'

export default function ModalScreen ({ child, navigation }) {
  return (
    <View style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white',
      marginTop: isIphoneX() ? 50 : 30,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      overflow: 'hidden'
    }}>
      { navigation.getParam('childView') ||
        <React.Fragment>
          <Text style={{ fontSize: 30 }}>This is a modal!</Text>
          <Button
            onPress={() => navigation.goBack()}
            title='Dismiss'
          />
        </React.Fragment>
      }
    </View>

  )
}
