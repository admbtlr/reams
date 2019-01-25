import React from 'react'
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native'
import ItemCarouselContainer from '../containers/ItemCarousel.js'
import RizzleImageViewerContainer from '../containers/RizzleImageViewer.js'
import LogoSpinnerContainer from '../containers/LogoSpinner.js'
import SplashScreen from 'react-native-splash-screen'
import ToolbarsContainer from '../containers/Toolbars.js'
import { hslString } from '../utils/colors'

class ItemsScreen extends React.Component {

  componentDidMount () {
    // SplashScreen.hide()
  }

  // render = () => (
  //   <View style={{flex: 1}}>
  //     <StatusBar
  //       showHideTransition="slide"
  //       barStyle="light-content" />
  //     <ToolbarsContainer navigation={this.props.navigation}/>
  //     <View style={styles.infoView} />
  //     <Image
  //       source={require('../assets/images/dark-splash.png')}
  //       style={styles.image}
  //       onLoad={() => {
  //         SplashScreen.hide()
  //       }}
  //     />
  //     <LogoSpinnerContainer />
  //     <ItemCarouselContainer style={styles.ItemCarousel} />
  //     <RizzleImageViewerContainer />
  //   </View>
  // )

  render = () => (
    <View style={{
      flex: 1,
      backgroundColor: hslString('bodyBGLight')
    }}>
      <StatusBar
        showHideTransition="slide"
        barStyle="light-content" />
      <ToolbarsContainer navigation={this.props.navigation}/>
      <View style={styles.infoView} />
      <LogoSpinnerContainer />
      <ItemCarouselContainer style={styles.ItemCarousel} />
      <RizzleImageViewerContainer />
    </View>
  )

  // render = () => (
  //   <View style={{flex: 1}}>
  //     <StatusBar barStyle='light-content' />
  //     <AppStateListenerContainer />
  //     <ToolbarsContainer navigation={this.props.navigation}/>
  //     <View style={styles.infoView} />
  //     <Image
  //       source={require('../assets/images/dark-splash.png')}
  //       style={styles.image}
  //       onLoad={() => {
  //         SplashScreen.hide()
  //       }}
  //     />
  //     <LogoSpinnerContainer />
  //     <RizzleImageViewerContainer />
  //   </View>
  // )
}

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
    backgroundColor: 'hsl(42, 12%, 95%)'
    // backgroundColor: 'white'
  },
  infoText: {
    fontFamily: 'Avenir',
    color: '#f6f6f6'
  },
  ItemCarousel: {
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

export default ItemsScreen
