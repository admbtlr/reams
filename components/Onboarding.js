import React, { createRef, useEffect, useRef, useState } from 'react'
import {ActionSheetIOS, Animated, Dimensions, Easing, Image, Keyboard, Linking, Pressable, Text, TextInput, View} from 'react-native'
import { hslString } from '../utils/colors'
import TextButton from './TextButton'
import { useDispatch, useSelector } from 'react-redux'
import { HIDE_ALL_BUTTONS, HIDE_LOADING_ANIMATION } from '../store/ui/types'
import { TOGGLE_ONBOARDING } from '../store/config/types'
import { getMargin } from '../utils/dimensions'
import { fontSizeMultiplier } from '../utils/dimensions'
import { textInfoStyle, textInputStyle } from '../utils/styles'
import { supabase } from '../storage/supabase'
import { useSession } from './AuthProvider'
import { appleAuth, AppleButton } from '@invertase/react-native-apple-authentication'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import { BackgroundGradient } from './BackgroundGradient'
import Login from './Login'

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

  useEffect(() => {
    const hideAllButtons = () => dispatch({ type: HIDE_ALL_BUTTONS })
    const hideLoadingAnimation = () => dispatch({ type: HIDE_LOADING_ANIMATION })
    hideAllButtons()
    hideLoadingAnimation()
  })

  let server = ''
  if (__DEV__) {
    server = 'http://localhost:8888/'
  }

  if (index === 0) {
    return <Onboarding1 isVisible={isVisible} />
  } else if (index === 1) {
    return <Onboarding2 index={index} />
  } else if (index === 2) {
    return <Onboarding3 index={index} />
  } else if (index === 3) {
    return <Onboarding4 index={index} />
  } else if (index === 4) {
    return <Onboarding5 index={index} navigation={navigation} />
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

const textLargeBoldStyle = {
  ...textLargeStyle,
  fontFamily: 'IBMPlexSans-Bold',
}

const Onboarding1 = ({ index, navigation }) => {
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
    <OnboardingPage index={index}>
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
            inputRange: [0, 0.08, 0.1, 1],
            outputRange: [0, 1, 1, 1]
          }),
          overflow: 'hidden'
        }}>Reams</Animated.Text>
        <Animated.Text style={{
          fontFamily: 'IBMPlexSansCond',
          fontSize: 24 * fontSizeMultiplier(),
          color: 'white',
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.1, 0.2, 1],
            outputRange: [0, 0, 1, 1]
          })
        }}>The Serious, Joyful and Open App for Readers</Animated.Text>
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
        }}>Imagine an endless, beautiful magazine, filled only with articles that you want to read, from sources you choose.</Animated.Text>
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
    </OnboardingPage>
  )
}

const Onboarding2 = ({ index }) => {
  const mainAnim = new Animated.Value(0)
  const loopAnim = new Animated.Value(0)
  const onboardingIndex = useSelector(state => state.config.onboardingIndex)
  const [isVisible, setIsVisible] = useState(onboardingIndex === index)
  useEffect(() => {
    setIsVisible(onboardingIndex === index)
  }, [onboardingIndex])

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
    <OnboardingPage index={index}>
      <View style={{
        flex: 1,
        // alignItems: 'center',
        marginTop: 80 * fontSizeMultiplier(),
        marginHorizontal: getMargin(),
        overflow: 'hidden'
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
    </OnboardingPage>
  )
}

export const Onboarding3 = ({ index }) => {
  const onboardingIndex = useSelector(state => state.config.onboardingIndex)
  const inputRef = createRef()
  useEffect(() => {
    if (!!onboardingIndex && onboardingIndex === index) {
      inputRef?.current?.focus()
    }
  }, [onboardingIndex])

  return (
    <OnboardingPage index={index}>
      <Login 
        backgroundColor='transparent'
        cta='Ready to get started?'
        inputRef={inputRef} 
        textColor={'white'}
        inputColor={'white'}
        marginTop={50}
      />
    </OnboardingPage>
  )
}

const Onboarding4 = ({ index }) => {
  const mainAnim = new Animated.Value(0)
  const onboardingIndex = useSelector(state => state.config.onboardingIndex)

  // so this is weird
  // if the app has been opened from an emailed link, the onboardingIndex will be 2, 
  // because that's where it left off with the enter email screen
  // but if the user is going back and forth between the onboarding screens, it might be 0
  const [isVisible, setIsVisible] = useState(onboardingIndex === 2 || onboardingIndex === 0)
  useEffect(() => {
    setIsVisible(onboardingIndex === 2 || onboardingIndex === 0)
  }, [onboardingIndex])

  useEffect(() => {
    if (isVisible)  {
      Animated.timing(mainAnim, {
        toValue: 1,
        duration: 25000,
        delay: 0,
        useNativeDriver: true
      }).start()
    }
  }, [isVisible])

  return (
    <OnboardingPage index={index}>
      <View style={{
        flex: 1,
        marginHorizontal: getMargin(),
        justifyContent: 'center',
      }}>
        <Animated.Text style={{
          ...textLargeBoldStyle,
          textAlign: 'left',
          marginBottom: 24 * fontSizeMultiplier(),
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.03, 1],
            outputRange: [0, 1, 1]
          }),
        }}>Thanks for choosing Reams!</Animated.Text>
        { /* Using a View here because android can't do opacity on the icons */}
        <Animated.View style={{
          marginBottom: 24 * fontSizeMultiplier(),
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.07, 0.1, 1],
            outputRange: [0, 0, 1, 1]
          }),
        }}>
          <Text style={{
            ...textStyle,
            textAlign: 'left',
          }}>There are two areas in Reams: the {getRizzleButtonIcon('rss', 'white', null, null, true, 0.7)}&#160;<Text style={textBoldStyle}>Feed</Text> and the {getRizzleButtonIcon('saved', 'white', null, null, true, 0.7)}&#160;<Text style={textBoldStyle}>Library</Text>.</Text>
        </Animated.View>
        { /* Using a View here because android can't do opacity on the icons */}
        <Animated.View style={{
          marginBottom: 24 * fontSizeMultiplier(),
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.2, 0.23, 1],
            outputRange: [0, 0, 1, 1]
          }),
        }}>
          <Animated.Text style={{
            ...textStyle,
            textAlign: 'left',
          }}>New articles enter your {getRizzleButtonIcon('rss', 'white', null, null, true, 0.7)}&#160;<Text style={textBoldStyle}>Feed</Text> via RSS, or from newsletters. Want to keep one of the articles forever? Save it to your {getRizzleButtonIcon('saved', 'white', null, null, true, 0.7)}&#160;<Text style={textBoldStyle}>Library</Text>.</Animated.Text>
        </Animated.View>
        <Animated.Text style={{
          ...textStyle,
          textAlign: 'left',
          marginBottom: 24 * fontSizeMultiplier(),
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.6, 0.63, 1],
            outputRange: [0, 0, 1, 1]
          }),
        }}>You can also save articles to your library from Safari (or 3rd party apps) with the <Text style={textBoldStyle}>Reams share extension</Text>.</Animated.Text> 
        <Animated.Text style={{
          ...textStyle,
          textAlign: 'left',
          marginBottom: 24 * fontSizeMultiplier(),
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.9, 0.93, 1],
            outputRange: [0, 0, 1, 1]
          }),
        }}>(Extensions for desktop browsers will be available very soon!)</Animated.Text> 
      </View>
      <Animated.Text style={{
        fontFamily: 'IBMPlexSans-Italic',
        fontSize: 14 * fontSizeMultiplier(),
        color: 'white',
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        opacity: mainAnim.interpolate({
          inputRange: [0, 0.97, 1],
          outputRange: [0, 0, 1]
        }),
      }}>swipe >>></Animated.Text>
    </OnboardingPage>
  )
}

const Onboarding5 = ({ index, navigation }) => {
  const dispatch = useDispatch()
  const [isFinished, setIsFinished] = useState(false)
  const [isShareSheetClosed, setIsShareSheetClosed] = useState(false)
  const endOnboarding = () => dispatch({ type: TOGGLE_ONBOARDING, isOnboarding: false })
  const anim = new Animated.Value(0)

  const endOnboardingAndResetNav = () => {
    endOnboarding()
    navigation.reset({
      index: 0,
      routes: [{name: 'Initial'}]})
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
        setIsShareSheetClosed(true)
      }
    )
  }

  useEffect(() => {
    if (!isFinished) return
    Animated.timing(anim, {
      toValue: 1,
      duration: 800,
      delay: 0,
      useNativeDriver: true,
      easing: Easing.linear
    }).start()
  }, [isFinished])

  return (
    <OnboardingPage index={index}>
      <View style={{
        flex: 1,
        marginHorizontal: getMargin(),
        marginTop: getMargin() * 2,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Animated.Text style={{
          ...textLargeStyle,
          textAlign: 'center',
          marginBottom: 24 * fontSizeMultiplier(),
          opacity: anim.interpolate({
            inputRange: [0, 0.25, 0.75, 1],
            outputRange: [1, 1, 0, 0]
          }),
        }}>Let’s set up the share extension now</Animated.Text>
        <Animated.Text style={{
          ...textStyle,
          textAlign: 'center',
          marginBottom: 24 * fontSizeMultiplier(),
          opacity: anim.interpolate({
            inputRange: [0, 0.25, 0.75, 1],
            outputRange: [1, 1, 0, 0]
          }),
        }}>Watch the short video below to see how to enable the extension:</Animated.Text>
        <Animated.View style={{
          opacity: anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 0, 0]
          }),
        }}>
          <Image 
            source={require('../assets/images/reams-enable-share.webp')} 
            style={{
              backgroundColor: 'white',
              borderColor: 'rgba(0,0,0,0.8)',
              borderWidth: 2,
              width: 150,
              height: 328,
              margin: getMargin(),
              marginBottom: 48 * fontSizeMultiplier(),
              borderRadius: 18
            }}
          />
        </Animated.View>
        <Animated.View style={{
          position: 'absolute',
          opacity: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1]
          }),
        }}>
          <Text style={{
            ...textLargeBoldStyle,
            textAlign: 'center',
            marginBottom: 24 * fontSizeMultiplier(),
          }}>You’re ready to go. Hit the button below to fall in love with reading online again.</Text>
          <Image 
            source={require('../assets/images/ream.png')} 
            style={{
              alignSelf: 'center'
            }}
          />
        </Animated.View>
        {isFinished ? (
          <TextButton
            onPress={endOnboardingAndResetNav}
            text='Start using Reams!'
          />
        ) : (
          <>
            <TextButton
              buttonStyle={{marginBottom: 24 * fontSizeMultiplier()}}              
              onPress={openShareSheet}
              text='Open share sheet'
            />
            <TextButton
              buttonStyle={{opacity: isShareSheetClosed ? 1 : 0}}
              onPress={() => setIsFinished(true)}
              text='OK, done!'
            />
            <Pressable 
              onPress={() => setIsFinished(true)}
              style={{
                marginTop: -24 * fontSizeMultiplier(),
                opacity: isShareSheetClosed ? 0 : 1
              }}>
              <Text style={ textInfoStyle() }>Skip</Text>
            </Pressable>
          </>
        )}
      </View>
    </OnboardingPage>
  )
}

const OnboardingPage = ({ children, index }) => (
  <View
    style={{
      backgroundColor: hslString('rizzleBG'),
      flex: 1,
      overflow: 'hidden',
      width: Dimensions.get('window').width
    }}
  >
    <BackgroundGradient index={index} />
    {children}
  </View>
)


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
