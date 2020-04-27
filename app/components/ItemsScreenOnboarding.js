import React, { Fragment, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dimensions,
  StyleSheet,
  Text,
  View
} from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { ITEMS_ONBOARDING_DONE } from '../store/config/types'
import { SHOW_ITEM_BUTTONS } from '../store/ui/types'
import TextButton from './TextButton'
import { hslString } from '../utils/colors'
import { isIphoneX, fontSizeMultiplier } from '../utils'

const screenWidth = Dimensions.get('window').width

function getStyles () {
  let textStyle = {
    textAlign: 'left',
    fontFamily: 'IBMPlexSans',
    fontSize: 16 * fontSizeMultiplier(),
    lineHeight: 22 * fontSizeMultiplier(),
    color: hslString('rizzleText'),
    marginBottom: 16 * fontSizeMultiplier()
  }
  return {
    buttonTextStyle: {
      textAlign: 'center',
      fontFamily: 'IBMPlexMono',
      fontSize: 16,
      color: 'white',
      opacity: 0
    },
    textStyle,
    boldStyle: {
      ...textStyle,
      fontFamily: 'IBMPlexSans-Bold'
    }
  }
}

const getTexts = () => [
  <Fragment>
    <Text style={ getStyles().textStyle }>This is the <Text style={ getStyles().boldStyle }>Unread Stories Screen</Text>. It shows all the new stories from the sites that you have subscribed to.</Text>
    <Text style={ getStyles().textStyle }>Scroll down to read a story, or just swipe on to the next one.</Text>
  </Fragment>,
  <Text style={ getStyles().textStyle }><Text style={ getStyles().boldStyle }>The Eye</Text> lets you change the text size. Also dark mode (which by the way happens automatically too, if that’s how you roll).</Text>,
  <Text style={ getStyles().textStyle }><Text style={ getStyles().boldStyle }>The Share Button</Text> is a share button. It works like every other share button you’ve ever used.</Text>,
  <Fragment>
    <Text style={ getStyles().textStyle }><Text style={ getStyles().boldStyle }>The Rizzle Button</Text> saves a story. You can then access your saved stories by tapping the big box in the top right-hand corner.</Text>
    <Text style={ getStyles().textStyle }>(We’ll get to that in a minute)</Text>
  </Fragment>,
  <Text style={ getStyles().textStyle }><Text style={ getStyles().boldStyle }>The Browser Button</Text> opens the page that this story originally came from, so that you can view it in its natural habitat.</Text>,
  <Fragment>
    <Text style={ getStyles().textStyle }><Text style={ getStyles().boldStyle }>The Show Full Text Button</Text> (a/k/a The Weird Button On The End)</Text>
    <Text style={ getStyles().textStyle }>Some sites only include teasers in their feed. This button toggles between the teaser and the whole story, in all its full-bore glory.</Text>
    <Text style={ getStyles().textStyle }>You can turn on the full text view for whole feeds in the feed details screen.</Text>
  </Fragment>,
  <Text style={ getStyles().textStyle }><Text style={ getStyles().boldStyle }>The Back Button</Text> takes you to the feeds screen, where you can see all the sites you’ve subscribed to.</Text>,
  <Text style={ getStyles().textStyle }>Hit the feed name to open the <Text style={ getStyles().boldStyle }>feed details screen</Text>, where you can see info and stats about this feed, and configure how it behaves.</Text>,
  <Fragment>
    <Text style={ getStyles().textStyle }><Text style={ getStyles().boldStyle }>The Big Box Button</Text> takes you to the <Text style={ getStyles().boldStyle }>Saved Stories Screen</Text>: this is how you can access all the articles you’ve saved, either from within Rizzle, or by copying a URL and opening Rizzle, or by using the <Text style={ getStyles().boldStyle }>Rizzle Share Extension</Text>.</Text>
  </Fragment>,
  <Fragment>
    <Text style={ getStyles().textStyle }><Text style={ getStyles().boldStyle }>That’s it!</Text> For now, at least...</Text>
    <Text style={ getStyles().textStyle }>Now swipe your way through your stories, and enjoy unencumbered edification – free of advertising, paywalls, shouty comments and everything else that turned the internet from 🦄 🌈 to 😭.</Text>
  </Fragment>
]

const downArrowPath = 'M12 5v13M5 12l7 7 7-7'
const upArrowPath = 'M12 19V6M5 12l7-7 7 7'
const arrowStyles = {
  position: 'absolute',
  transform: [{
    translateY: -55
  }],
  alignItems: 'center',
  width: '100%'
}
const svgProps = {
  width: '40',
  height: '40',
  fill: 'none',
  stroke: hslString('rizzleText'),
  strokeWidth: '3',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24'
}
const downArrow = () => (
  <View style={ arrowStyles }>
    <Svg
      {...svgProps}
      stroke={hslString('rizzleText')}
    >
      <Path d={downArrowPath} />
    </Svg>
  </View>
)
const upArrow = () => (
  <View style={{
    ...arrowStyles,
    transform: []
  }}>
    <Svg
      {...svgProps}
      stroke={hslString('rizzleText')}
    >
      <Path d={upArrowPath} />
    </Svg>
  </View>
)

export default function ItemsScreenOnboarding (props) {

  const index = useSelector(state => {
    return state.itemsUnread.index
  })
  const numItems = useSelector(state => {
    return state.itemsUnread.items.length
  })
  const [ step, setStep ] = useState(0)
  const dispatch = useDispatch()

  dispatch({
    type: SHOW_ITEM_BUTTONS
  })

  const multiplier = fontSizeMultiplier()

  return step === 10 ? null : (
    <Fragment>
      <View style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)'
      }} />
      <View style={{
        ...StyleSheet.absoluteFillObject,
        zIndex: 100,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <View style={{
          position: 'absolute',
          bottom: step < 6 ? 85 : 'auto',
          top: step >= 6 && step < 9 ?
            (isIphoneX() ? 110 : 90) :
            'auto',
          left: step < 6 ?
            (screenWidth > 500 ? (screenWidth - 500) / 2 : 25) :
            step === 6 ? 10 : 'auto',
          right: step === 8 ? 10 : 'auto',
          // height: 200,
          width: screenWidth > 500 ? 500 : screenWidth - 50,
          backgroundColor: hslString('rizzleBG'),
          padding: 20 * fontSizeMultiplier(),
          paddingBottom: step < 6 ? 50 : 20,
          paddingTop: step >= 6 && step < 9 ? 50 : 20,
          borderRadius: 10,
          flexDirection: 'column'
        }}>
          { getTexts()[step] }
          <TextButton
            noResize={true}
            onPress={() => {
              if (step === 8) {
                dispatch({
                  type: ITEMS_ONBOARDING_DONE
                })
              }
              setStep(step + 1)
            }}
            text={[
              'Got it',
              'Eye understand',
              'Got it',
              'Got it',
              'Hunky Dory',
              'Got it',
              'Got it already...',
              'Are we there yet?',
              'Finally!'
            ][step]} />
        </View>
        <View style={{
          position: 'absolute',
          bottom: 0,
          width: screenWidth < 500 ?
            '100%' :
            500,
          zIndex: 10,
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 20,
          paddingLeft: 20,
          paddingRight: 20,
          height: 50
        }}>
          <View style={{
            width: 40,
            height: 50,
            marginLeft: 10
          }}>
            { step === 1 && downArrow()}
          </View>
          <View style={{
            width: 50,
            height: 50
          }}>
            { step === 2 && downArrow()}
          </View>
          <View style={{
            width: 50,
            height: 50
          }}>
            { step === 3 && downArrow()}
          </View>
          <View style={{
            width: 50,
            height: 50
          }}>
            { step === 4 && downArrow()}
          </View>
          <View style={{
            width: 40,
            height: 50,
            marginRight: 10
          }}>
            { step === 5 && downArrow()}
          </View>
        </View>
        <View style={{
          position: 'absolute',
          zIndex: 100,
          top: isIphoneX() ? 115 : 95,
          left: screenWidth * 0.05 - 3,
          width: 40,
          height: 40
        }}>
          { step === 6 && upArrow()}
        </View>
        <View style={{
          position: 'absolute',
          zIndex: 100,
          top: isIphoneX() ? 115 : 95,
          left: screenWidth * 0.5 - 20,
          width: 40,
          height: 40
        }}>
          { step === 7 && upArrow()}
        </View>
        <View style={{
          position: 'absolute',
          zIndex: 100,
          top: isIphoneX() ? 115 : 95,
          right: screenWidth * 0.05 - 4,
          width: 40,
          height: 40
        }}>
          { step === 8 && upArrow()}
        </View>
      </View>
    </Fragment>
  )
}
