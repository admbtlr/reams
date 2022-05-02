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


export default function ReamsAuth({ }) {
  const [email, setEmail] = React.useState<string>();
  const [isSending, setSending] = React.useState(false);

  // React.useEffect(() => {
  //   if (route.params?.refresh_token) {
  //     supabase.auth.signIn({refreshToken: route.params.refresh_token});
  //   }
  // }, [route]);

  async function sendMagicLink(email?: string) {
    if (email) {
      setSending(true);
      let result = await supabase.auth.signIn(
        {email},
        {redirectTo: 'io.supabase.rnquickstart://login-callback/'},
      );

      setSending(false);

      if (result.error) {
        // toast.show({
        //   placement: 'top',
        //   title: 'Sign In',
        //   status: 'error',
        //   description: 'There was a problem sending your link',
        // });
      } else {
        // toast.show({
        //   placement: 'top',
        //   title: 'Sign In',
        //   status: 'success',
        //   description: 'A sign in link has been sent to your email',
        // });
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
        // disabled={isSubmitting || !isValid}
        // onPress={handleSubmit}
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
