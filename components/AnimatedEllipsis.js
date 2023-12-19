import React, { Component } from 'react';
import { 
  Text, 
  Animated, 
  View, 
  StyleSheet
} from 'react-native';


export default class AnimatedEllipsis extends Component {

  constructor(props) {
    super(props);

    this.opacityMaps = [
      {
        inputRange: [0, 0.167, 0.333, 0.5, 0.667, 0.833, 1],
        outputRange: [0.2, 1, 1, 1, 1, 0.2, 0.2]
      },
      {
        inputRange: [0, 0.167, 0.333, 0.5, 0.667, 0.833, 1],
        outputRange: [0.2, 0.2, 1, 1, 1, 1, 0.2]
      },
      {
        inputRange: [0, 0.167, 0.333, 0.5, 0.667, 0.833, 1],
        outputRange: [0.2, 0.2, 0.2, 1, 1, 1, 1]
      }
    ]
    this.anim = new Animated.Value(0)
  }

  componentDidMount() {
    this.loop = Animated.loop(
      Animated.timing(
        this.anim,
        {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
          isInteraction: false
        }
      )
    ).start()
  }

  componentWillUnmount() {
    // this.loop.stop()
  }

  render () {
    let dots = [1, 1, 1].map((o, i) =>
      <Animated.Text 
        key={i} 
        style={{
          ...this.props.style, 
          opacity: this.anim.interpolate(this.opacityMaps[i]),
        }}
      >.</Animated.Text>
    );

    // return <View style={styles.container}>{dots}</View>
    return <React.Fragment>{dots}</React.Fragment>
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row'
  }
});
