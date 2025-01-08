import React from 'react'
import { Animated, Dimensions, Image } from 'react-native'

const Figures = ({ anim }: {anim: any}) => {
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
          source={require('../../assets/images/figures.png')}
          style={{
            height,
            width
          }}
        />
    </Animated.View>
  )
}

export default Figures
