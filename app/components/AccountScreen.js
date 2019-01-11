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

class AccountScreen extends React.Component {

  constructor (props) {
    super(props)
    this.props = props
  }

  render = () => {
    const width = Dimensions.get('window').width
    const margin = width * 0.05
    const height = Dimensions.get('window').height
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
      <ScrollView style={{
        flex: 1,
        backgroundColor: '#F2ECD9'
      }}>
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          // backgroundColor: hslString('rizzleBG'),
        }}>
          <StatusBar
            showHideTransition="slide"
            barStyle="dark-content" />
          <View style={{
            marginTop: 55,
            marginBottom: 64,
            minHeight: height - 55 - 64,
            width: width * 0.9,
            marginLeft: margin,
            marginRight: margin
          }}>
            <Heading
              title='Your Accounts'
              showClose={true}
              onClose={() => {
                this.props.navigation.navigate('Feeds')
              }}
            />
            <Text style={textStyles}>You are currently using <Text style={{ fontFamily: 'IBMPlexSans-Bold'}}>Rizzle</Text> to manage your feeds.</Text>
            <Text style={{
              ...textStyles,
              marginBottom: 21
            }}>Other Options:</Text>
            <TextButton
              text="Feed Wrangler"
              buttonStyle={{ marginBottom: 42 }}
              isExpandable = {true} />
            <TextButton
              text="Feedbin"
              buttonStyle={{ marginBottom: 42 }}
              isExpandable = {true} />
            <TextButton
              text="Feedly"
              buttonStyle={{ marginBottom: 42 }}
              isExpandable = {true} />
          </View>
        </View>
      </ScrollView>
    )
  }
}

export default AccountScreen
