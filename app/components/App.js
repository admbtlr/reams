import React from 'react'
import {
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
  }

  componentDidMount() {
    SplashScreen.hide()
  }

  render () {
    return (
      <View style={styles.mainView}>
        <AppStateListenerContainer />
        <StatusBar barStyle='light-content' />
        <RizzleModalContainer />
        <ToolbarsContainer />
        <View style={styles.infoView} />
        <FeedListContainer
          style={styles.feedList}
        />
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
