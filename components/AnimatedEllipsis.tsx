import React from 'react'
import { View, StyleSheet } from 'react-native'
import type { TextStyle, ViewStyle } from 'react-native'
import Reanimated, { 
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
  useDerivedValue,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'

// Define prop types for the component
interface AnimatedEllipsisProps {
  style?: TextStyle
  containerStyle?: ViewStyle
}

const AnimatedEllipsis: React.FC<AnimatedEllipsisProps> = ({ style, containerStyle }) => {
  // Create a continuously increasing shared value
  const progress = useSharedValue<number>(0)
  
  // Create derived values for each dot that cycle between 0-1
  // Dot 1 (first)
  const firstDotProgress = useDerivedValue(() => {
    return (progress.value % 1)
  })
  
  // Dot 2 (second) - delay by 1/3 of the cycle
  const secondDotProgress = useDerivedValue(() => {
    return ((progress.value - 0.33) % 1 + 1) % 1
  })
  
  // Dot 3 (third) - delay by 2/3 of the cycle
  const thirdDotProgress = useDerivedValue(() => {
    return ((progress.value - 0.66) % 1 + 1) % 1
  })
  
  // Create animated styles using the derived values
  const firstDotStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      firstDotProgress.value,
      [0, 0.5, 1],
      [0.1, 1, 0.1],
      Extrapolation.CLAMP
    )
    return { opacity }
  })

  const secondDotStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      secondDotProgress.value,
      [0, 0.5, 1],
      [0.1, 1, 0.1],
      Extrapolation.CLAMP
    )
    return { opacity }
  })

  const thirdDotStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      thirdDotProgress.value,
      [0, 0.5, 1],
      [0.1, 1, 0.1],
      Extrapolation.CLAMP
    )
    return { opacity }
  })

  // Start the animation on mount - continuously increasing value
  React.useEffect(() => {
    progress.value = 0
    progress.value = withRepeat(
      withTiming(100, { 
        duration: 100 * 1500, // Scale the duration with the animation range
        easing: Easing.linear 
      }), 
      -1,
      false
    )
    
    // Cleanup on unmount
    return () => {
      cancelAnimation(progress)
    }
  }, [])

  const dotStyles = [firstDotStyle, secondDotStyle, thirdDotStyle]

  return (
    <View style={[styles.container, containerStyle]}>
      {[0, 1, 2].map((i) => (
        <Reanimated.Text
          key={i}
          style={[style, styles.dotStyle, dotStyles[i]]}
        >
          .
        </Reanimated.Text>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row'
  },
  dotStyle: {
    marginBottom: -2
  }
})

export default AnimatedEllipsis