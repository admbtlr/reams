import React from 'react'
import { connect } from 'react-redux'
import {
  Dimensions,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import TextButton from './TextButton'
import { hslString } from '../utils/colors'

class ItemsDirectionRadios extends React.Component {
  constructor (props) {
    super(props)
    this.props = props
  }

  render () {
    const screenWidth = Dimensions.get('window').width
    const margin = screenWidth * 0.05
    const textStyles = {
      fontFamily: 'IBMPlexSans',
      fontSize: 18,
      lineHeight: 27,
      marginTop: margin / 2 ,
      marginBottom: margin / 2,
      padding: 8,
      textAlign: 'left',
      color: hslString('rizzleText')
    }
    const buttonStyle = {
      marginBottom: margin / 2
    }
    return (
      <View style={{
        flexDirection: 'row',
        marginTop: margin
      }}>
        <Text style={{
          ...textStyles,
          flex: 1,
          marginTop: 0,
          paddingTop: 0
        }}>View items:</Text>
        <View style={{
          flex: 1
        }}>
          <TextButton
            buttonStyle={buttonStyle}
            bgColor='transparent'
            isActive={this.props.itemSort === 'backwards'}
            isCompact={true}
            onPress={() => {
              this.props.setItemSort('backwards')
            }}
            text="Backwards" />
          <TextButton
            buttonStyle={buttonStyle}
            bgColor='transparent'
            isActive={this.props.itemSort === 'forwards'}
            isCompact={true}
            onPress={() => {
              this.props.setItemSort('forwards')
            }}
            text="Forwards" />
          <TextButton
            buttonStyle={buttonStyle}
            bgColor='transparent'
            isActive={this.props.itemSort === 'rizzlewards'}
            isCompact={true}
            onPress={() => {
              this.props.setItemSort('rizzlewards')
            }}
            text="Rizzlewards" />
        </View>
      </View>
    )
  }
}

let ItemsDirectionRadiosContainer = connect(
  state => ({
    itemSort: state.config.itemSort
  }),
  dispatch => ({
    setItemSort: (itemSort) => dispatch({
      type: 'CONFIG_SET_ITEM_SORT',
      itemSort
    })
  })
)(ItemsDirectionRadios)

export default ItemsDirectionRadiosContainer
