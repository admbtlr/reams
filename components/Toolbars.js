import React from 'react'
import {View} from 'react-native'
import TopBarContainer from '../containers/TopBar'
import ButtonsContainer from '../containers/Buttons'
import ViewButtonsContainer from '../containers/ViewButtons'

class Toolbars extends React.PureComponent {
  // shouldComponentUpdate (nextProps, nextState) {
  // }

  render () {
    return (
      <View
        style={styles.base}
        pointerEvents='box-none'>
        <TopBarContainer
          navigation={this.props.navigation}
        />
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
    height: '100%',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center'
  }
}
export default Toolbars
