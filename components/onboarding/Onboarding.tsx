import React, { createRef, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HIDE_ALL_BUTTONS, HIDE_LOADING_ANIMATION } from '../../store/ui/types'
import { fontSizeMultiplier } from '../../utils/dimensions'
import { RootState } from '../../store/reducers'
import Onboarding3 from './Onboarding3'
import Onboarding5 from './Onboarding5'
import Onboarding1 from './Onboarding1'
import Onboarding2 from './Onboarding2'
import Onboarding4 from './Onboarding4'

export default function Onboarding ({index, navigation, isVisible}: {index: number, navigation: any, isVisible: boolean}) {
  const dispatch = useDispatch()
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode)

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

export const textStyle = {
  fontFamily: 'IBMPlexSans',
  fontSize: 20 * fontSizeMultiplier(),
  lineHeight: 28 * fontSizeMultiplier(),
  color: 'white',
  marginTop: 26,
  // textAlign: 'center',
}

export const textBoldStyle = {
  ...textStyle,
  fontFamily: 'IBMPlexSans-Bold',
}

export const textLargeStyle = {
  ...textStyle,
  fontSize: 24 * fontSizeMultiplier(),
  lineHeight: 32 * fontSizeMultiplier(),
  marginTop: 0,
  // marginTop: 0,
  textAlign: 'right',
}

export const textLargeBoldStyle = {
  ...textLargeStyle,
  fontFamily: 'IBMPlexSans-Bold',
}
