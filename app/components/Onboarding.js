import React, { useEffect, useState } from 'react'
import {ActionSheetIOS, Animated, Dimensions, Easing, Image, Linking, Pressable, Text, TextInput, View} from 'react-native'
import {WebView} from 'react-native-webview'
import { openLink } from '../utils/open-link'
import { hslString } from '../utils/colors'
import TextButton from './TextButton'
import { useDispatch, useSelector } from 'react-redux'
import { HIDE_ALL_BUTTONS, HIDE_LOADING_ANIMATION } from '../store/ui/types'
import { TOGGLE_ONBOARDING, UPDATE_ONBOARDING_INDEX } from '../store/config/types'
import LinearGradient from 'react-native-linear-gradient'
import { fontSizeMultiplier, getMargin } from '../utils'
import { textInputStyle } from '../utils/styles'
import { supabase } from '../storage/supabase'
import { useSession } from './AuthProvider'

export const pages = [{
    heading: 'Reams',
    subhead: 'Deeply Superficial Reading',
    body: 'Reams is for people who love to read. It‘s all about the immersive pleasures of text and image.'
  },
  {
    body: 'Reams uses <strong>infernally complex logic</strong>, a <strong>sprinkling of AI</strong> and a <strong>whole lot of attention to typrographic detail</strong> to turn your reading into a stunning, immersive experience.'
  },
  {
    body: 'New articles flow through your <strong>feed</strong>. Want to keep one of them? Save it to your <strong>library</strong>.</p><p>You can also save articles to your library from Safari with the <strong>Reams share extension</strong>, which also lets you add new sites to your feed.</p>'
  },
  {
    body: 'Enter your email address, and we’ll send you a link to log into Reams.'
  },
  {
    body: `Now let's set up the share extension now. When you press the button below, you\'ll see the share sheet. Scroll to the right and tap <strong>More</strong>:</p>
    <img src="webview/img/enable-share-1.jpg" style="width: 890px;">
    <p>Tap <strong>Edit</strong>:</p>
    <img src="webview/img/enable-share-2.jpg">
    <p>Turn on the switch next to <strong>Reams</strong>:</p>
    <img src="webview/img/enable-share-3.jpg">
    <p>Then tap <strong>Done</strong>, then <strong>Done</strong> again.`
  },
  {
    body: 'Now you\'re ready to use Reams. Tap the button below to get started.'
  }
]

export default function Onboarding ({index, navigation, isVisible}) {
  const dispatch = useDispatch()
  const isDarkMode = useSelector(state => state.ui.isDarkMode)

  const hideAllButtons = () => dispatch({ type: HIDE_ALL_BUTTONS })
  const hideLoadingAnimation = () => dispatch({ type: HIDE_LOADING_ANIMATION })
  const endOnboarding = () => dispatch({ type: TOGGLE_ONBOARDING, isOnboarding: false })

  hideAllButtons()
  hideLoadingAnimation()

  const endOnboardingAndResetNav = () => {
    endOnboarding()
    navigation.reset({
      index: 0,
      routes: [{name: 'Account'}]})
  }

  const openShareSheet = () => {
    ActionSheetIOS.showShareActionSheetWithOptions({
      url: 'https://reams.app',
      message: 'Reams is for people who love to read. It‘s all about the immersive pleasures of text and image.',
      title: 'Reams'
    },
    (error) => {
      console.error(error)
    },
    (success, method) => {
    }
  )

  }

  let server = ''
  if (__DEV__) {
    server = 'http://localhost:8888/'
  }

  const session = useSession()

  if (session) {
    return <Onboarding4 index={index} />
  } else if (index === 0) {
    return <Onboarding1 isVisible={isVisible} />
  } else if (index === 1) {
    return <Onboarding2 index={index} />
  } else if (index === 2) {
    return <Onboarding3 index={index} />
  } else if (index === 3) {
    return <Onboarding4 index={index} />
  } else {
    return null
  }

}

const textStyle = {
  fontFamily: 'IBMPlexSans',
  fontSize: 20 * fontSizeMultiplier(),
  lineHeight: 28 * fontSizeMultiplier(),
  color: 'white',
  marginTop: 26,
  // textAlign: 'center',
}

const textBoldStyle = {
  ...textStyle,
  fontFamily: 'IBMPlexSans-Bold',
}

const textLargeStyle = {
  ...textStyle,
  fontSize: 24 * fontSizeMultiplier(),
  lineHeight: 32 * fontSizeMultiplier(),
  marginTop: 0,
  // marginTop: 0,
  textAlign: 'right',
}

const Onboarding1 = ({ navigation }) => {
  const mainAnim = new Animated.Value(0)

  useEffect(() => {
    Animated.timing(mainAnim, {
      toValue: 1,
      duration: 15000,
      delay: 0,
      useNativeDriver: true
    }).start()
  }, [])

  return (
    <View
      style={{
        backgroundColor: hslString('rizzleBG'),
        flex: 1,
        overflow: 'hidden',
        width: Dimensions.get('window').width
      }}
    >
      <LinearGradient 
        colors={[hslString('logo2'), hslString('logo1')]} 
        end={{x: 0, y: 1}}
        start={{x: 2, y: 0}}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }} />
      <View style={{
        flex: 1,
        // alignItems: 'center',
        marginTop: 100,
        marginHorizontal: getMargin()
      }}>
        <Animated.Text style={{
          fontFamily: 'PTSerif-Bold',
          fontSize: 64 * fontSizeMultiplier(),
          color: 'white',
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.02, 0.1, 1],
            outputRange: [0, 0, 1, 1]
          }),
        }}>Reams</Animated.Text>
        <Animated.Text style={{
          fontFamily: 'IBMPlexSansCond',
          fontSize: 24 * fontSizeMultiplier(),
          color: 'white',
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.1, 0.2, 1],
            outputRange: [0, 0, 1, 1]
          })
        }}>Deeply Superficial Reading</Animated.Text>
        <Animated.Text style={{
          fontFamily: 'IBMPlexSans',
          fontSize: 20 * fontSizeMultiplier(),
          lineHeight: 28,
          color: 'white',
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.22, 0.3, 1],
            outputRange: [0, 0, 1, 1]
          }),
          marginTop: getMargin() * 4,
        }}>Imagine an endless, beautiful magazine, filled with all the articles that you want to read.</Animated.Text>
        <Animated.Text style={{
          fontFamily: 'IBMPlexSans',
          fontSize: 20 * fontSizeMultiplier(),
          color: 'white',
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.75, 0.85, 1],
            outputRange: [0, 0, 1, 1]
          }),
          marginTop: getMargin()
        }}>Imagine <Text style={{ fontFamily: 'IBMPlexSans-Bold'}}>Reams</Text>.</Animated.Text>
      </View>
      <Animated.Text style={{
        fontFamily: 'IBMPlexSans-Italic',
        fontSize: 16 * fontSizeMultiplier(),
        color: 'white',
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        opacity: mainAnim.interpolate({
          inputRange: [0, 0.1, 0.9, 1],
          outputRange: [0, 0, 0, 1] 
        })
      }}>swipe >>></Animated.Text>
      <Figures anim={mainAnim} />
    </View>
  )
}

const Onboarding2 = ({ index }) => {
  const mainAnim = new Animated.Value(0)
  const loopAnim = new Animated.Value(0)
  const onboardingIndex = useSelector(state => state.config.onboardingIndex)
  const isVisible = onboardingIndex === index

  useEffect(() => {
    console.log('onboarding2 effect', isVisible)
    if (isVisible) {
      Animated.parallel([
      Animated.timing(mainAnim, {
        toValue: 1,
        duration: 15000,
        delay: 0,
        useNativeDriver: true
      }),
      Animated.loop(Animated.timing(loopAnim, {
        toValue: 1.2,
        duration: 10000,
        delay: 0,
        easing: Easing.linear,
        useNativeDriver: true
      }))
    ]).start()
    }
  }, [isVisible])

  const textLargeAbsoluteStyle = {
    ...textLargeStyle,
    fontFamily: 'IBMPlexSans-Bold',
    fontSize: 25 * fontSizeMultiplier(),
    color: hslString('logo3'),
    position: 'absolute',
    right: 0,
    // top: 1,
    // textAlign: 'center',
  }

  return (
    <View
      style={{
        backgroundColor: hslString('rizzleBG'),
        flex: 1,
        overflow: 'hidden',
        width: Dimensions.get('window').width
      }}
    >
      <LinearGradient 
        colors={[hslString('logo2'), hslString('logo1')]} 
        end={{x: -1, y: 1}}
        start={{x: 1, y: 0}}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }} />
      <View style={{
        flex: 1,
        // alignItems: 'center',
        marginTop: 80 * fontSizeMultiplier(),
        marginHorizontal: getMargin()
      }}>
        <Animated.Text style={{
          ...textStyle,
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.03, 0.05, 1],
            outputRange: [0, 1, 1, 1]
          }),
        }}>Reams uses <Text style={textBoldStyle}>infernally complex logic</Text>, a <Text style={textBoldStyle}>sprinkling of AI</Text> and a whole lot of attention to <Text style={textBoldStyle}>typrographic detail</Text> to turn your reading into a stunning, immersive experience.</Animated.Text>
        <Animated.Text style={{
          ...textStyle,
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.2, 0.25, 1],
            outputRange: [0, 0, 1, 1]
          }),
        }}>All you have to do is <Text style={textBoldStyle}>swipe</Text> between the articles, like <Text style={textBoldStyle}>flipping the pages of a magazine</Text>.</Animated.Text>
        <Animated.View style={{ 
          // marginTop: 48,
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.4, 0.45, 1],
            outputRange: [0, 0, 1, 1]
          }),
        }}>
          <Animated.Text style={{
            ...textLargeStyle,
            marginTop: 24
          }}>And of course you can</Animated.Text>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}>
            <View style={{ flex: 1 }}>
            <Animated.Text style={{
              ...textLargeAbsoluteStyle,
              opacity: loopAnim.interpolate({
                inputRange: [0, 0.15, 0.2, 0.35, 0.4, 0.55, 0.6, 0.75, 0.8, 0.95, 1, 1.15, 1.2],
                outputRange: [1, 1,    0,   0,    0,   0,    0,   0,    0,   0,   0,  0,    1]
              })}}>read </Animated.Text>
            <Animated.Text style={{
              ...textLargeAbsoluteStyle,
              opacity: loopAnim.interpolate({
                inputRange: [0, 0.15, 0.2, 0.35, 0.4, 0.55, 0.6, 0.75, 0.8, 0.95, 1, 1.15, 1.2],
                outputRange: [0, 0,    1,   1,    0,   0,    0,   0,    0,   0,   0,  0,    0]
              })}}>save</Animated.Text>
            <Animated.Text style={{
              ...textLargeAbsoluteStyle,
              opacity: loopAnim.interpolate({
                inputRange: [0, 0.15, 0.2, 0.35, 0.4, 0.55, 0.6, 0.75, 0.8, 0.95, 1, 1.15, 1.2],
                outputRange: [0, 0,    0,   0,    1,   1,    0,   0,    0,   0,   0,  0,    0]
              })}}>tag</Animated.Text>
            <Animated.Text style={{
              ...textLargeAbsoluteStyle,
              opacity: loopAnim.interpolate({
                inputRange: [0, 0.15, 0.2, 0.35, 0.4, 0.55, 0.6, 0.75, 0.8, 0.95, 1, 1.15, 1.2],
                outputRange: [0, 0,    0,   0,    0,   0,    1,   1,    0,   0,   0,  0,    0]
              })}}>annotate</Animated.Text>
            <Animated.Text style={{
              ...textLargeAbsoluteStyle,
              opacity: loopAnim.interpolate({
                inputRange: [0, 0.15, 0.2, 0.35, 0.4, 0.55, 0.6, 0.75, 0.8, 0.95, 1, 1.15, 1.2],
                outputRange: [0, 0,    0,   0,    0,   0,    0,   0,    1,   1,   0,  0,    0]
              })}}>share</Animated.Text>
            <Animated.Text style={{
              ...textLargeAbsoluteStyle,
              opacity: loopAnim.interpolate({
                inputRange: [0, 0.15, 0.2, 0.35, 0.4, 0.55, 0.6, 0.75, 0.8, 0.95, 1, 1.15, 1.2],
                outputRange: [0, 0,    0,   0,    0,   0,    0,   0,    0,   0,   1,  1,    0]
              })}}>highlight</Animated.Text>
            </View>
            <View style={{ flex: 0 }}>
              <Text style={textLargeStyle}> each article.</Text>
            </View>            
          </View>
        </Animated.View>
      </View>
      <Animated.Text style={{
        fontFamily: 'IBMPlexSans-Italic',
        fontSize: 14 * fontSizeMultiplier(),
        color: 'white',
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        opacity: mainAnim.interpolate({
          inputRange: [0, 0.8, 0.85, 1],
          outputRange: [0, 0, 1, 1]
        }),
      }}>swipe >>></Animated.Text>
      <Figures anim={mainAnim} />
    </View>
  )
}

const Onboarding3 = ({ index }) => {
  const [email, setEmail] = useState('')
  const isEmailValid = email && email.match(/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/)
  const [isSending, setIsSending] = useState(false)

  async function sendMagicLink(email) {
    let redirectURL = 'reams://onboarding'
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

      if (result.error) {
        console.log(result.error)
      }
    }
  }

  return (
    <View
      style={{
        backgroundColor: hslString('rizzleBG'),
        flex: 1,
        overflow: 'hidden',
        width: Dimensions.get('window').width
      }}
    >
      <LinearGradient 
        colors={[hslString('logo2'), hslString('logo1')]} 
        end={{x: 2, y: 1}}
        start={{x: 0, y: 0}}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }} />
      <View style={{
        flex: 1,
        marginTop: 200,
        marginHorizontal: getMargin()
      }}>
        <Text style={{
          ...textLargeStyle,
          textAlign: 'center',
          marginBottom: 24 * fontSizeMultiplier(),
        }}>Ready to get started?</Text>
        <Text style={{
          ...textLargeStyle,
          textAlign: 'center',
          marginBottom: 48 * fontSizeMultiplier(),
        }}>Enter your email, and we’ll send you a magic sign-in link:</Text>
        <TextInput
          autoCapitalize='none'
          autoCorrect={false}
          autoFocus={true}
          keyboardType='email-address'
          onChangeText={setEmail}
          style={{
            ...textInputStyle('white'),
            textAlign: 'center',
            borderBottomWidth: 0,
            marginBottom: 24 * fontSizeMultiplier(),
          }}
        />
        <TextButton
          isDisabled={!isEmailValid}
          onPress={() => {
            sendMagicLink(email)
          }}
          text='Send me a link'
        />
      </View>

    </View>
  )
}

const Onboarding4 = ({ index }) => {
  return (
    <View
      style={{
        backgroundColor: hslString('rizzleBG'),
        flex: 1,
        overflow: 'hidden',
        width: Dimensions.get('window').width
      }}
    >
      <LinearGradient 
        colors={[hslString('logo2'), hslString('logo1')]} 
        end={{x: 0, y: 1}}
        start={{x: 2, y: 0}}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }} />
      <View style={{
        flex: 1,
        marginTop: 200,
        marginHorizontal: getMargin()
      }}>
        <Text style={{
          ...textLargeStyle,
          textAlign: 'center',
          marginBottom: 24 * fontSizeMultiplier(),
        }}>Heeeeeeeello</Text>
        </View>
    </View>
  )
}

const Figures = ({ anim }) => {
  const imageDimensions = {
    width: 1300,
    height: 409
  }
  const screenDimensions = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  }
  const height= screenDimensions.height * 0.4
  const ratio = height / imageDimensions.height
  const width = imageDimensions.width * ratio
  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 10,
        left: 0,
        height,
        width: '100%',
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        opacity: anim.interpolate({
          inputRange: [0, 0.1, 0.9, 1],
          outputRange: [0, 1, 1, 0]
        }),
        resizeMode: 'contain',
        transform: [
          {translateX: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -width + screenDimensions.width]
          })
          }
        ]
      }}
    >
      <Image
          source={require('../assets/images/figures.png')}
          style={{
            height,
            width
          }}
        />
    </Animated.View>
  )
}
