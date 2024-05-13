import React from 'react'
import {
  Button,
  Text,
  View
} from 'react-native'
import { hasNotchOrIsland } from '../utils/dimensions'

export default function ModalScreen ({ child, navigation, route }) {
  return (
    <View style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white',
      // marginTop: hasNotchOrIsland() ? 50 : 30,
      // borderTopLeftRadius: 10,
      // borderTopRightRadius: 10,
      overflow: 'hidden'
    }}>
      { route.params.childView ||
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
