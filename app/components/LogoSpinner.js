import React from 'react'
import { Animated, Dimensions, Image, View } from 'react-native'

class LogoSpinner extends React.Component {


  constructor (props) {
    super(props)
    this.props = props

    this.state = {
      rotate: new Animated.Value(0)
    }

    this.animation = Animated.loop(Animated.spring(this.state.rotate, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
      bounciness: 15,
      speed: 5,
      isInteraction: false
    }))
  }

  componentDidMount () {
    if (this.props.showLoadingAnimation) {
      this.animation.start()
    }
  }

  componentDidUpdate () {
    if (this.props.showLoadingAnimation) {
      this.animation.start()
    } else {
      this.animation.stop()
    }
  }

  render () {
    const {height, width} = Dimensions.get('window')
    const spin = this.state.rotate.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    })
    return (
      <View style={{
            position: 'absolute',
            top: height / 2 - 20,
            left: width / 2 - 48,
            width: 96,
            height: 48,
            flexDirection: 'row',
            alignItems: 'flex-end'
          }}>
        <Image source={require('../assets/images/r.png')} style={{
          width: 32,
          height: 48
        }}/>
        <Animated.Image source={require('../assets/images/z.png')} style={{
          width: 32,
          height: 33,
          transform: [{
            rotate: spin
          }]
        }}/>
        <Image source={require('../assets/images/l.png')} style={{
          width: 32,
          height: 48
        }}/>
      </View>
    )
  }

}

export default LogoSpinner
