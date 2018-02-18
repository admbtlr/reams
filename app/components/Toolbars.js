import React from 'react'
import {View} from 'react-native'
import TopBarContainer from '../containers/TopBar.js'
import ButtonsContainer from '../containers/Buttons.js'
import ViewButtonsContainer from '../containers/ViewButtons.js'

class Toolbars extends React.PureComponent {
  // shouldComponentUpdate (nextProps, nextState) {
  // }

  render () {
    return (
      <View
        style={styles.base}
        pointerEvents='box-none'>
        <TopBarContainer />
        <ButtonsContainer />
        <ViewButtonsContainer />
      </View>
    )
  }

}

const styles = {
  base: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 10,
    height: '100%'
  }
}
export default Toolbars
