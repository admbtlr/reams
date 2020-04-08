import { ItemType } from '../store/items/types'
import React from 'react'
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  View
} from 'react-native'
import ItemCarouselContainer from '../containers/ItemCarousel.js'
import RizzleImageViewerContainer from '../containers/RizzleImageViewer.js'
import { hslString } from '../utils/colors'

class ItemsScreen extends React.Component {

  constructor (props) {
    super(props)
    this.props = props
  }

  componentDidMount () {
    const { screenDidFocus, screenWillBlur } = this.props
    this.focusListener = this.props.navigation.addListener('focus', screenDidFocus)
    this.blurListener = this.props.navigation.addListener('blur', screenWillBlur)
    screenDidFocus()
  }

  componentDidUpdate () {
  }

  componentWillUnmount () {
    this.focusListener.remove()
    this.blurListener.remove()
  }

  render = () => {
    const { displayMode, navigation } = this.props
    return (
      <View style={{
        flex: 1,
        backgroundColor: hslString('bodyBG')
      }}>
        <StatusBar
          showHideTransition="slide"
          barStyle={ displayMode === ItemType.saved ? 'dark-content' : 'light-content' }
          hidden={false} />
        <View style={styles.infoView} />
        <ItemCarouselContainer
          navigation={navigation}
          style={styles.ItemCarousel} />
        <RizzleImageViewerContainer />
      </View>
    )
  }
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
    backgroundColor: hslString('rizzleBG')
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
