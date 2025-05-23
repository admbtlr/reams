import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import { Image, Keyboard, KeyboardAvoidingView, PixelRatio, Platform, Text, TextInput, View } from 'react-native'
import { useSelector } from 'react-redux'
import { useSession } from './AuthProvider'
import { supabase } from '../storage/supabase'
import { fontSizeMultiplier, getMargin } from '../utils/dimensions'
import { opacitise, textInfoBoldStyle, textInfoStyle, textInputStyle } from '../utils/styles'
import appleAuth, { AppleButton } from '@invertase/react-native-apple-authentication'
import TextButton from './TextButton'
import { hslString } from '../utils/colors'
import log from '../utils/log'
import type { RootState } from '../store/reducers'
import type { AuthOtpResponse } from '@supabase/supabase-js'

const Login = ({
  inputRef,
  cta,
  inputColor,
  textColor,
  hideHeader,
  marginTop,
  backgroundColor,
  focusCondition
}: {
  inputRef: React.RefObject<TextInput>,
  cta: string,
  inputColor?: string,
  textColor: string,
  hideHeader: boolean | undefined,
  marginTop: number | undefined,
  backgroundColor: string | undefined,
  focusCondition: boolean | undefined
}) => {
  const navigation = useNavigation()
  const isLoggedIn = useSelector((state: RootState) => state.user.userId !== '')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState<string | null>(null)
  const isEmailValid = email?.match(/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/)
  const session = useSession()

  useEffect(() => {
    if (isLoggedIn) {
      navigation.popToTop()
    }
  }, [isLoggedIn, navigation])

  if (!inputRef) {
    inputRef = useRef<TextInput>(null)
  }

  if (!textColor) {
    textColor = hslString('rizzleText')
  }

  if (!inputColor) {
    inputColor = hslString('logo1')
  }

  if (!cta) {
    cta = 'Welcome back to Reams'
  }

  useEffect(() => {
    if (inputRef && (focusCondition === undefined || focusCondition)) {
      inputRef?.current?.focus()
    }
  }, [inputRef, focusCondition])

  async function sendMagicLink(email: string) {
    const redirectURL = 'already://onboarding'
    if (email) {
      setIsSubmitting(true)
      let result: AuthOtpResponse | null = null
      try {
        result = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectURL,
          },
        })
        setMessage('Check your email for the magic link')
      } catch (e) {
        console.log(e)
      } finally {
        setIsSubmitting(false);
        if (result?.error) {
          console.log(result.error)
        }
      }
    }
  }

  async function onAppleButtonPress() {
    // performs login request
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        // Note: it appears putting FULL_NAME first is important, see issue #293
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
        nonce: 'apple'
      })

      // This method must be tested on a real device. On the iOS simulator it always throws an error.
      const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user)

      // use credentialState response to ensure the user is authenticated
      if (credentialState === appleAuth.State.AUTHORIZED) {
        const token = appleAuthRequestResponse.identityToken
        const result = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: token || '',
          nonce: 'apple',
        })
        console.log(result)
      }
    } catch (error) {
      log('onAppleButtonPress', error)
    }
  }

  const inlineMessage = message || (isSubmitting ? 'Sending...' : null)

  const orSeparator = (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24 * fontSizeMultiplier(),
        marginBottom: 24 * fontSizeMultiplier(),
      }}
    >
      <View style={{
        flex: 1,
        height: 1 / PixelRatio.get(),
        backgroundColor: opacitise(textColor, 0.5)
      }} />
      <Text style={{
        color: textColor,
        fontSize: 16 * fontSizeMultiplier(),
        fontFamily: 'IBMPlexSerif-Italic',
        textAlign: 'center',
        marginHorizontal: 12 * fontSizeMultiplier(),
        marginBottom: 4,
        padding: 0
      }}>or</Text>
      <View style={{
        flex: 1,
        height: 1 / PixelRatio.get(),
        backgroundColor: opacitise(textColor, 0.5),
      }} />
    </View>)

  const textLargeStyle = {
    ...textInfoStyle(textColor),
    fontFamily: 'IBMPlexSerif-Light',
    fontWeight: 'light',
    fontSize: 24 * fontSizeMultiplier()
  }

  return (
    <View
      style={{
        backgroundColor: backgroundColor || hslString('rizzleBG'),
        flex: 1,
        marginTop: marginTop || 0,
        paddingHorizontal: getMargin(),
        paddingTop: hideHeader ?
          10 * fontSizeMultiplier() : 0
      }}>
      {hideHeader || (
        <Image
          source={require('../assets/images/ream.png')}
          style={{
            width: 128,
            height: 128,
            alignSelf: 'center',
            margin: 32
          }}
        />
      )}
      <Text style={{
        ...textLargeStyle,
        textAlign: 'center',
        marginBottom: 24 * fontSizeMultiplier(),
      }}>{cta}</Text>
      {session?.error ? (
        <Text style={{
          ...textLargeStyle,
          textAlign: 'center',
          marginBottom: 48 * fontSizeMultiplier(),
          backgroundColor: 'red',
        }}>Error: {session.error}. Please try again.</Text>
      ) : (
        <Text style={{
          ...textInfoStyle(textColor),
          textAlign: 'center',
          marginTop: 24 * fontSizeMultiplier(),
          marginBottom: 12 * fontSizeMultiplier(),
        }}>Enter your email, and we’ll send you a magic sign-in link:</Text>
      )}
      <TextInput
        autoCapitalize='none'
        autoCorrect={false}
        editable={!isSubmitting}
        keyboardType='email-address'
        onChangeText={setEmail}
        ref={inputRef}
        selectionColor={inputColor}
        style={{
          ...textInputStyle(inputColor),
          color: inputColor,
          textAlign: 'center',
          borderBottomWidth: 0,
          marginBottom: 24 * fontSizeMultiplier(),
        }}
      />
      {!!inlineMessage && !session.error ?
        <Text style={{
          ...textInfoBoldStyle(textColor),
          fontSize: 18 * fontSizeMultiplier(),
          textAlign: 'center',
          marginVertical: 4 * fontSizeMultiplier(),
        }}>{inlineMessage}</Text> :
        (<TextButton
          isDisabled={!isEmailValid || isSubmitting}
          buttonStylea={{
            opacity: isEmailValid ? 1 : 0.5
          }}
          onPress={() => {
            Keyboard.dismiss()
            setIsSubmitting(true)
            sendMagicLink(email)
          }}
          text='Send me a link'
        />)
      }
      {!!inlineMessage && !session.error ? null : (
        <>
          {orSeparator}
          <AppleButton
            buttonStyle={AppleButton.Style.BLACK}
            buttonType={AppleButton.Type.SIGN_IN}
            style={{
              width: '100%',
              height: 40 * fontSizeMultiplier(),
              maxWidth: 700,
              borderRadius: 20 * fontSizeMultiplier(),
              alignSelf: 'center',
            }}
            onPress={() => onAppleButtonPress()}
          />
          {__DEV__ &&
            <>
              {orSeparator}
              <TextButton
                onPress={() => supabase.auth.signInWithPassword({
                  email: 'a@btlr.eu',
                  password: 'Asdfasdf'
                })}
                text='Log in with password' />
            </>}
        </>
      )}
    </View>
  )
}

export default Login
