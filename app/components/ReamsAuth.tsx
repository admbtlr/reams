import React from 'react'
import {
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import Svg, {Path} from 'react-native-svg'
import { textInfoStyle, textInputStyle, textLabelStyle } from '../utils/styles'
import {hslString} from '../utils/colors'
import supabase from '../storage/supabase';
import { useDispatch } from 'react-redux'
import { ADD_MESSAGE } from '../store/ui/types'
import { useRoute } from '@react-navigation/native'


export default function ReamsAuth({ }) {
  const [email, setEmail] = React.useState<string>();
  const [isSending, setSending] = React.useState(false);
  const dispatch = useDispatch()
  const route = useRoute()

  React.useEffect(() => {
    if (route.params?.refresh_token) {
      supabase.auth.signIn({refreshToken: route.params.refresh_token});
    }
  }, [route]);

  async function sendMagicLink() {
    if (email) {
      setSending(true);
      let result = await supabase.auth.signIn(
        {email},
        {redirectTo: 'reams://Main/login-callback/'},
      );

      setSending(false);

      if (result.error) {
        dispatch({
          type: ADD_MESSAGE,
          message: {
            messageString: 'Error sending link',
            isSelfDestruct: true,
            type: 'error'
          }
        })
      } else {
        dispatch({
          type: ADD_MESSAGE,
          message: {
            messageString: 'Sign in link sent',
            isSelfDestruct: true
          }
        })
      }
    }
  }

  return (
    <View style={{
      paddingTop: 16,
      paddingLeft: 16,
      paddingRight: 16,
      marginTop: 16,
      marginBottom: 16
    }}>
      <TextInput
        autoCapitalize='none'
        keyboardType='email-address'
        onChangeText={setEmail}
        style={textInputStyle()}
        value={email}
      />
      <Text style={textLabelStyle()}>Email address</Text>
      <TouchableOpacity
        color={hslString('white')}
        disabled={isSending}
        onPress={sendMagicLink}
        style={{
          alignSelf: 'center',
          marginTop: 5,
          marginBottom: 5
        }}
        // testID={`${service}-submit-button`}
      >
        <Text style={{
          ...textInfoStyle('logo1'),
          textDecorationLine: 'underline'
        }}>Get magic link</Text>
      </TouchableOpacity>
    </View>
  )
}
