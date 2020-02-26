import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import {
  Dimensions,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { Direction, SET_ITEM_SORT, SET_SHOW_NUM_UNREAD } from '../store/config/types'
import TextButton from './TextButton'
import { hslString } from '../utils/colors'
import { fontSizeMultiplier } from '../utils'

class ItemsDirectionRadios extends React.Component {
  constructor (props) {
    super(props)
    this.props = props
  }

  render () {
    const screenWidth = Dimensions.get('window').width
    const margin = screenWidth * 0.05
    const buttonWidth = (screenWidth - margin * 3) / 2
    const textStyles = {
      fontFamily: 'IBMPlexSans',
      fontSize: 18 * fontSizeMultiplier(),
      lineHeight: 27 * fontSizeMultiplier(),
      marginTop: margin / 2 ,
      marginBottom: margin / 2,
      padding: 8 * fontSizeMultiplier(),
      textAlign: 'left',
      color: hslString('rizzleText')
    }
    const buttonStyle = {
      alignSelf: 'flex-end',
      marginBottom: margin / 2,
      width: buttonWidth
    }
    return (
      <Fragment>
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
              isActive={this.props.itemSort === Direction.backwards}
              isCompact={true}
              onPress={() => {
                this.props.setItemSort(Direction.backwards)
              }}
              text="Backwards" />
            <TextButton
              buttonStyle={buttonStyle}
              bgColor='transparent'
              isActive={this.props.itemSort === Direction.forwards}
              isCompact={true}
              onPress={() => {
                this.props.setItemSort(Direction.forwards)
              }}
              text="Forwards" />
          </View>
        </View>
        <View style={{
          flexDirection: 'row',
          marginTop: margin
        }}>
          <Text style={{
            ...textStyles,
            flex: 5,
            marginTop: 0,
            paddingTop: 0
          }}>Show number of unread items:</Text>
          <View style={{
            flex: 1
          }}>
            <Switch
              onValueChange={this.props.setShowNumUnread}
              trackColor={{
                false: hslString('rizzleText', '', 0.3),
                true: hslString('rizzleText')
              }}
              value={this.props.showNumUnread}
            />
          </View>
        </View>
      </Fragment>
    )
  }
}

let ItemsDirectionRadiosContainer = connect(
  state => ({
    itemSort: state.config.itemSort,
    showNumUnread: state.config.showNumUnread
  }),
  dispatch => ({
    setItemSort: (itemSort) => dispatch({
      type: SET_ITEM_SORT,
      itemSort
    }),
    setShowNumUnread: (showNumUnread) => dispatch({
      type: SET_SHOW_NUM_UNREAD,
      showNumUnread
    })
  })
)(ItemsDirectionRadios)

export default ItemsDirectionRadiosContainer
