import React from 'react'
import { Animated, ViewStyle } from 'react-native'
import { Bar as BarComponent } from '@/components/Bar'
import { getMargin } from '@/utils/dimensions'

interface BarProps {
  item: any
  styles: any
  barAnimation?: any
  addAnimation?: (style: any, anim: any, isVisible: boolean) => any
  isVisible?: boolean
  anims?: any
}

const Bar: React.FC<BarProps> = ({
  item,
  styles,
  barAnimation,
  addAnimation,
  isVisible,
  anims
}) => {
  if (!item) return null

  const horizontalMargin: number = getMargin() * 0.8

  let style: ViewStyle = {}

  // if (anims && addAnimation) {
  //   style = addAnimation({}, barAnimation, !!isVisible)
  // }

  return (
    <Animated.View style={{
      ...style,
      marginLeft: styles?.textAlign === 'center' ? 0 : horizontalMargin
    }}>
      <BarComponent item={item} />
    </Animated.View>
  )
}

export default Bar
