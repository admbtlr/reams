import React from 'react'
import {
  Button,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native'

import FeedListContainer from '../containers/FeedList.js'
import RizzleModalContainer from '../containers/RizzleModal.js'
import RizzleImageViewerContainer from '../containers/RizzleImageViewer.js'
import ToolbarsContainer from '../containers/Toolbars.js'
import LogoSpinnerContainer from '../containers/LogoSpinner.js'
import AppStateListenerContainer from '../containers/AppStateListener.js'
import SplashScreen from 'react-native-splash-screen'
import { createStackNavigator } from 'react-navigation';

// temporary hacky approach
class ItemsView extends React.Component {
  render = () => (
    <View style={{flex: 1}}>
      <ToolbarsContainer navigation={this.props.navigation}/>
      <View style={styles.infoView} />
      <Image
        source={require('../assets/images/dark-splash.png')}
        style={styles.image}
        onLoad={() => {
          SplashScreen.hide()
        }}
      />
      <LogoSpinnerContainer />
      <FeedListContainer style={styles.feedList} />
      <RizzleImageViewerContainer />
      <Button
        title="Go to Details"
        onPress={() => this.props.navigation.navigate('Feeds')}
      />
    </View>
  )
}

class DetailsScreen extends React.Component {
  render = () =>(
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Details Screen</Text>
    </View>
  )
}

// class App extends React.Component {

//   constructor (props) {
//     super(props)
//     this.props = props
//   }

//   componentDidMount () {
//     SplashScreen.hide()
//   }

//   render () {
//     return (
//       <View style={styles.mainView}>
//         <AppStateListenerContainer />
//         <StatusBar barStyle='dark-content' />
//         <RizzleModalContainer />
//         <FeedView />
//       </View>
//     )
//   }
// }

export default createStackNavigator(
  {
    Feeds: DetailsScreen,
    Items: ItemsView
  },
  {
    initialRouteName: 'Items',
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false
    }

  }
)

const {height, width} = Dimensions.get('window')

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
    backgroundColor: '#443344'
    // backgroundColor: 'white'
  },
  infoText: {
    fontFamily: 'Avenir',
    color: '#f6f6f6'
  },
  feedList: {
    flex: 1,
    justifyContent: 'center'
  },
  image: {
    position: 'absolute',
    width: 1024,
    height: 1366,
    top: (height - 1366) / 2,
    left: (width - 1024) / 2
  }
})

// export default App
