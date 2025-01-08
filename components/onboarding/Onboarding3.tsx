import React, { createRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/reducers'
import OnboardingPage from './OnboardingPage'
import Login from '../Login'

const Onboarding3 = ({ index }: { index: number }) => {
  const onboardingIndex = useSelector((state: RootState) => state.config.onboardingIndex)
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
        focusCondition={onboardingIndex === index}
        hideHeader={true}
        inputRef={inputRef} 
        textColor={'white'}
        inputColor={'white'}
        marginTop={50}
      />
    </OnboardingPage>
  )
}

export default Onboarding3
