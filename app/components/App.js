import React from 'react'
import {
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native'

import FeedListContainer from '../containers/FeedList.js'
import ToolbarsContainer from '../containers/Toolbars.js'
import AppStateListenerContainer from '../containers/AppStateListener.js'
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

  render () {
    return (
      <View style={styles.mainView}>
        <AppStateListenerContainer />
        <StatusBar barStyle='light-content' />
        <ToolbarsContainer />
        <View style={styles.infoView}>
          <Text style={styles.infoText}>Loading items...</Text>
        </View>
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
