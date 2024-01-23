import React, { Fragment, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dimensions,
  StyleSheet,
  Text,
  View
} from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { FEED_ONBOARDING_DONE } from '../store/config/types'
import TextButton from './TextButton'
import { hslString } from '../utils/colors'
import { fontSizeMultiplier, getMargin } from '../utils'

const screenWidth = Dimensions.get('window').width
const margin = getMargin() / 2

const textStyle = () => ({
  textAlign: 'left',
  fontFamily: 'IBMPlexSans',
  fontSize: 16 * fontSizeMultiplier(),
  color: hslString('rizzleText'),
  marginBottom: 16 * fontSizeMultiplier()
})
const boldStyle = {
  fontFamily: 'IBMPlexSans-Bold'
}

const texts = () => [
  <Text style={ textStyle() }><Text style={ boldStyle }>Unsubscribe</Text> removes this site from your feed.</Text>,
  <Text style={ textStyle() }><Text style={ boldStyle }>Discard stories</Text> gets rid of all the stories from this site that you haven’t yet read.</Text>,
  <Text style={ textStyle() }><Text style={ boldStyle }>Show full</Text> lets you specify that you always want the full text view for stories from this site.</Text>,
  <Text style={ textStyle() }><Text style={ boldStyle }>Filter stories</Text> lets you read stories from only this site, without being distracted by other stories from other sites trying to tell you other things.</Text>,
  <Text style={ textStyle() }><Text style={ boldStyle }>Mute</Text> lets you keep a site in your feed, but not actually see any of the its stories. It’s sometimes a handy temporary measure.</Text>,
  <Text style={ textStyle() }>If you <Text style={ boldStyle }>Like</Text> a site, its stories will always move to the front of your feed, so you’ll see them first.</Text>
]

const arrow = () => (
  <View style={{
    position: 'absolute',
    zIndex: 100,
    transform: [{
      translateY: -55 * fontSizeMultiplier()
    }]
  }}>
    <Svg
      width={40 * fontSizeMultiplier()}
      height={40 * fontSizeMultiplier()}
      fill='none'
      stroke={hslString('rizzleText')}
      strokeWidth='3'
      strokeLinecap='round'
      strokeLinejoin='round'
      viewBox='0 0 24 24'
    >
      <Path d='M12 5v13M5 12l7 7 7-7' />
    </Svg>
  </View>
)

const buttonStyle = {
  minWidth: '48%',
  marginBottom: margin,
  height: 42 * fontSizeMultiplier(),
  justifyContent: 'center',
  flexDirection: 'row'
}

export default function FeedExpandedOnboarding (props) {

  const index = useSelector(state => {
    return state.itemsUnread.index
  })
  const numItems = useSelector(state => {
    return state.itemsUnread.items.length
  })
  const [ step, setStep ] = useState(0)
  const dispatch = useDispatch()

  return step === 7 ? null : (
    <Fragment>
      <View style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)'
      }} />
      <View style={{
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <View style={{
          position: 'absolute',
          bottom: margin * 4 +
            210 * (1 + (fontSizeMultiplier() - 1) * 1.4) -
            Math.round((step+1) / 2) * 54 * (1 + (fontSizeMultiplier() - 1) * 1.8),
          left: step % 2 == 0 ?
            (screenWidth > 600 ? (screenWidth - 600) / 2 : 25) :
            'auto',
          right: step % 2 == 1 ?
            (screenWidth > 600 ? (screenWidth - 600) / 2 : 25) :
            'auto',
          // height: 200,
          width: screenWidth > 600 ? 600 : screenWidth - 50,
          backgroundColor: hslString('rizzleBG'),
          padding: 20 * fontSizeMultiplier(),
          paddingBottom: 50 * fontSizeMultiplier(),
          paddingTop: 20 * fontSizeMultiplier(),
          borderRadius: 10,
          flexDirection: 'column'
        }}>
          { texts()[step] }
          <TextButton
            noResize={true}
            onPress={() => {
              if (step === 5) {
                dispatch({
                  type: FEED_ONBOARDING_DONE
                })
              }
              setStep(step + 1)
            }}
            text={[
              'Got it',
              'Got it',
              'Got it',
              'Got it',
              'Got it',
              'Got it'
            ][step]} />
        </View>
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          zIndex: 10,
          flex: 1,
          flexDirection: 'column',
          alignItems: 'flex-end',
          marginBottom: margin * 0.5,
          paddingLeft: margin,
          paddingRight: margin
        }}
        pointerEvents='none'>
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: margin * 3
        }}>
          <View
            style={{
              ...buttonStyle,
              marginRight: margin,
            }}>{ step === 0 && arrow() }</View>
          <View
            style={buttonStyle}>{ step === 1 && arrow() }</View>
          <View
            style={{
              ...buttonStyle,
              marginRight: margin,
            }}>{ step === 2 && arrow() }</View>
          <View
            style={buttonStyle}>{ step === 3 && arrow() }</View>
          <View
            style={{
              ...buttonStyle,
              marginRight: margin,
              marginBottom: 0
            }}>{ step === 4 && arrow() }</View>
          <View
            style={{
              ...buttonStyle,
              marginBottom: 0
            }}>{ step === 5 && arrow() }</View>
        </View>
      </View>
    </Fragment>
  )
}
