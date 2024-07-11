import React, { useState } from "react"
import { Image, Text, TextInput, View } from "react-native"
import { BackgroundGradient } from '../BackgroundGradient'
import { textInfoBoldStyle, textInfoStyle } from '../../utils/styles'
import TextButton from "../TextButton"
import { supabase } from "../../storage/supabase"
import { useSession } from "../AuthProvider"


interface Props {
  // navigation: any
}

export default function Onboarding(props: Props) {
  const [email, setEmail] = useState<string>('')
  const [isSending, setIsSending] = useState(false)
  const [isTextInputFocused, setIsTextInputFocused] = useState(false)
  const isEmailValid = email && email.match(/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/)
  const session = useSession()
  console.log(session)

  async function sendMagicLink(email: string) {
    let redirectURL = __DEV__ ? 
      'http://localhost:8081' : 
      'https://web.reams.app/'
    if (email) {
      setIsSending(true)
      let result
      try {
        result = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectURL,
          },
        })  
      } catch (e) {
        console.log(e)
      }
      setIsSending(false);

      if (result?.error) {
        console.log(result.error)
      }
    }
  }

  return (
    <View 
      style={{
        backgroundColor: 'red',
        flex: 1,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <BackgroundGradient />
      <View style={{
        width: 600,
        height: 600,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 300,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        flex: -1
      }}>
        <Text style={{
          fontFamily: 'PTSerif',
          fontSize: 40,
          color: 'white',
        }}>Welcome to Reams</Text>
        <Text style={{
          fontFamily: 'PTSerif',
          fontSize: 20,
          color: 'white',
        }}>Enter your email address to get started</Text>
        <Image
          source={require('../../assets/images/figures.png')}
          style={{
            height: 200,
            width: 600,
            marginVertical: 50,
          }}
        />
        <TextInput 
          autoFocus={true}
          onChangeText={setEmail}
          onFocus={() => setIsTextInputFocused(true)}
          placeholder="Email address"
          placeholderTextColor='rgba(255,255,255,0.2)'
          style={{
            ...textInfoStyle('white'),
            borderWidth: 0,
            borderBottomColor: 'white',
            borderBottomWidth: 1,
            textAlign: 'center',
          }}
        />
        <TextButton
          isDisabled={!isEmailValid}
          buttonStyle={{
            marginTop: 20,
            opacity: isEmailValid ? 1 : 0.5,
            width: 200,
          }}
          showMaxHeight={true}
          onPress={() => {
            sendMagicLink(email)
          }}
          text='Send me a link'
        />
        {__DEV__ && (
          <TextButton
            buttonStyle={{
              marginTop: 20,
              width: 200,
            }}
            showMaxHeight={true}
            onPress={() => supabase.auth.signInWithPassword({
              email: 'a@btlr.eu',
              password: 'Asdfasdf'
            })}
            text='Log in with password' />
        )}

      </View>
    </View>
  )
}