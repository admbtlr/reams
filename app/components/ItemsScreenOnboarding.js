import React, { Fragment, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dimensions,
  StyleSheet,
  Text,
  View
} from 'react-native'
import Svg, {Polygon, Polyline, Rect, Path, Line} from 'react-native-svg'
import RizzleButton from './RizzleButton'
import TextButton from './TextButton'
import { hslString } from '../utils/colors'
import { isIphoneX, fontSizeMultiplier } from '../utils'

const screenWidth = Dimensions.get('window').width

function getStyles () {
  let textStyle = {
    textAlign: 'left',
    fontFamily: 'IBMPlexSans',
    fontSize: 16 * fontSizeMultiplier(),
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
  <Fragment>
    <Text style={ getStyles().textStyle }><Text style={ getStyles().boldStyle }>The Big Button</Text> shows you how many articles are currently in your feed, and how many you have already read (or swiped past).</Text>
    <Text style={ getStyles().textStyle }>Tap it to switch to the <Text style={ getStyles().boldStyle }>Saved Stories Screen</Text>: this is how you can access all the articles you’ve saved, either from within Rizzle, or by copying a URL and opening Rizzle, or by using the <Text style={ getStyles().boldStyle }>Rizzle Share Extension</Text>.</Text>
  </Fragment>,
  <Fragment>
    <Text style={ getStyles().textStyle }><Text style={ getStyles().boldStyle }>The Rizzle Button</Text> saves a story. You access the Saved Stories Screen by tapping The Big Button.</Text>
    <Text style={ getStyles().textStyle }>(You remember The Big Button, right?)</Text>
  </Fragment>,
  <Text style={ getStyles().textStyle }><Text style={ getStyles().boldStyle }>The Share Button</Text> is a share button. It works like every other share button you’ve ever used.</Text>,
  <Fragment>
    <Text style={ getStyles().textStyle }><Text style={ getStyles().boldStyle }>The Mysterious Fourth Button...</Text> Some sites only include teasers in their feed. This button toggles between the teaser and the whole story, in all its full-bore glory.</Text>
  </Fragment>,
  <Text style={ getStyles().textStyle }><Text style={ getStyles().boldStyle }>The Eye</Text> lets you change the text size. Also dark mode (which by the way happens automatically too, obvs).</Text>,
  <Text style={ getStyles().textStyle }><Text style={ getStyles().boldStyle }>The Ellipsis</Text> takes you to the feeds screen, where you can see all the sites you’ve subscribed to.</Text>,
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

  const multiplier = fontSizeMultiplier()

  return step === 8 ? null : (
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
          bottom: step < 5 ? 80 : 'auto',
          top: step >= 5 && step < 7 ?
            (isIphoneX() ? 100 : 80) :
            'auto',
          left: step < 5 ?
            (screenWidth > 500 ? (screenWidth - 500) / 2 : 25) :
            step === 5 ? 10 : 'auto',
          right: step === 6 ? 10 : 'auto',
          // height: 200,
          width: screenWidth > 500 ? 500 : screenWidth - 50,
          backgroundColor: hslString('rizzleBG'),
          padding: 20 * fontSizeMultiplier(),
          paddingBottom: step < 5 ? 50 : 20,
          paddingTop: step >= 5 && step < 7 ? 50 : 20,
          borderRadius: 10,
          flexDirection: 'column'
        }}>
          { getTexts()[step] }
          <TextButton
            noResize={true}
            onPress={() => {
              if (step === 7) {
                dispatch({
                  type: 'CONFIG_ITEMS_ONBOARDING_DONE'
                })
              }
              setStep(step + 1)
            }}
            text={[
              'Got it',
              'Got it',
              'Got it',
              'Got it',
              'Hunky Dory',
              'Eye understand',
              'Got it already...',
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
          <View>
            <RizzleButton
              style={{
                width: 'auto',
                paddingHorizontal: 25,
                opacity: 0
              }}
            >
              <Text style={ getStyles().buttonTextStyle }>
                {index + 1} / {numItems}
              </Text>
            </RizzleButton>
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
        </View>
        <View style={{
          position: 'absolute',
          zIndex: 100,
          top: isIphoneX() ? 105 : 85,
          left: screenWidth * 0.05 - 7,
          width: 40,
          height: 40
        }}>
          { step === 5 && upArrow()}
        </View>
        <View style={{
          position: 'absolute',
          zIndex: 100,
          top: isIphoneX() ? 105 : 85,
          right: screenWidth * 0.05 - 4,
          width: 40,
          height: 40
        }}>
          { step === 6 && upArrow()}
        </View>
      </View>
    </Fragment>
  )
}
