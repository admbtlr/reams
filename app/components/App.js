import React from 'react'
import {
  Animated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native'

import FeedListContainer from '../containers/FeedList.js'
import RizzleModalContainer from '../containers/RizzleModal.js'
import ToolbarsContainer from '../containers/Toolbars.js'
import AppStateListenerContainer from '../containers/AppStateListener.js'
import { VibrancyView } from 'react-native-blur'
import SplashScreen from 'react-native-splash-screen';
// import ClipboardWatcher from '../containers/ClipboardWatcher.js'

// const App = () => (
//   <div>
//     <FeedListContainer />
//     <ButtonsContainer />
//   </div>
// )

class App extends React.Component {

  constructor (props) {
    super(props)
    this.props = props

    this.state = {
      rotate: new Animated.Value(0)
    }

  }

  componentDidMount() {
    SplashScreen.hide()

    Animated.loop(Animated.spring(this.state.rotate, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
      bounciness: 15,
      speed: 5
    })).start()
  }

  render () {
    const {height, width} = Dimensions.get('window')
    const spin = this.state.rotate.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    })
    return (
      <View style={styles.mainView}>
        <AppStateListenerContainer />
        <StatusBar barStyle='light-content' />
        <RizzleModalContainer />
        <ToolbarsContainer />
        <View style={styles.infoView} />
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
        <FeedListContainer style={styles.feedList} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1
  },
  infoView: {
    position: 'absolute',
    top: 0,
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#332233'
    // backgroundColor: 'white'
  },
  infoText: {
    fontFamily: 'Avenir',
    color: '#f6f6f6'
  },
  feedList: {
    flex: 1,
    justifyContent: 'center'
  }
})

export default App
