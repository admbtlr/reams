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
import AccountCredentialsForm from './AccountCredentialsForm'
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
      color: hslString('rizzleText')
    }
    return (
      <ScrollView style={{
        flex: 1,
        backgroundColor: hslString('rizzleBG')
      }}>
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
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
            <TextButton
              text="Log in to Rizzle"
              buttonStyle={{ marginBottom: 42 }}
              isExpandable={true}
              renderExpandedView={() => <AccountCredentialsForm service='rizzle' />}
            />
            <Text style={{
              ...textStyles,
              marginBottom: 21
            }}>Other Options:</Text>
            <TextButton
              text="Feed Wrangler"
              buttonStyle={{ marginBottom: 42 }}
              isExpandable={true}
              renderExpandedView={() => <AccountCredentialsForm service='feedwrangler' />}
            />
            <TextButton
              text="Feedbin"
              buttonStyle={{ marginBottom: 42 }}
              isExpandable={true}
              renderExpandedView={() => <AccountCredentialsForm service='feedbin' />}
            />
            <TextButton
              text="Feedly"
              buttonStyle={{ marginBottom: 42 }}
              isExpandable={true}
              renderExpandedView={() => <AccountCredentialsForm service='feedly' />}
            />
          </View>
        </View>
      </ScrollView>
    )
  }
}

export default AccountScreen
