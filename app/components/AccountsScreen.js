import React from 'react'
import {
  Dimensions,
  FlatList,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Feed from '../containers/Feed'
import TextButton from './TextButton'
import Heading from './Heading'
import XButton from './XButton'
import { hslString } from '../utils/colors'

class AccountsScreen extends React.Component {

  constructor (props) {
    super(props)
    this.props = props
    this.state = {
      scrollEnabled: true,
      selectedFeedElement: null
    }

    this.disableScroll = this.disableScroll.bind(this)
    this.renderFeed = this.renderFeed.bind(this)
    this.clearFeedFilter = this.clearFeedFilter.bind(this)
  }

  clearFeedFilter = () => {
    this.props.clearFeedFilter()
    this.props.clearReadItems()
  }

  render = () => {
    const margin = Dimensions.get('window').width * 0.05
    const textStyles = {
      fontFamily: 'IBMPlexSans',
      fontSize: 20,
      lineHeight: 32,
      marginTop: margin,
      marginBottom: margin,
      padding: 8,
      textAlign: 'left',
      color: 'hsl(300, 20%, 20%)'
    }
    return (
      <View style={{
        marginTop: 55,
        marginBottom: 64
      }}>
        <Heading
          title='Your Accounts'
          showClose={true}
          onClose={() => {
            this.props.navigation.navigate('Feeds')
          }}
        />
        <Text style={textStyles}>You are currently using <Text style={{ fontFamily: 'IBMPlexSans-Bold'}}>Rizzle</Text> to manage your feeds.</Text>
        <TextButton text="Use a different account" />
        <Text style={textStyles}>You have subscribed to <Text style={{ fontFamily: 'IBMPlexSans-Bold'}}>{ this.props.numFeeds } feeds</Text> and have <Text style={{ fontFamily: 'IBMPlexSans-Bold'}}>{ this.props.numItems } unread items</Text>.</Text>
        <View style={{
          flexDirection: 'row',
          marginBottom: margin,
          marginRight: 0 - margin
        }}>
          <TextButton
            buttonStyle={{
              marginRight: margin
            }}
            text="Remove items" />
          <TextButton
            buttonStyle={{
              marginRight: margin
            }}
            text="Go to items" />
        </View>
        <TextButton text="Add a new feed" />
      </View>
    )
  }
}

export default AccountsScreen
