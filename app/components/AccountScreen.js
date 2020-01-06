import React, { Fragment } from 'react'
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import TextButton from './TextButton'
import GoogleAuth from './GoogleAuth'
import AccountCredentialsForm from './AccountCredentialsForm'
import XButton from './XButton'
import { hslString } from '../utils/colors'
import { fontSizeMultiplier } from '../utils'

class AccountScreen extends React.Component {

  constructor (props) {
    super(props)
    this.props = props
  }

  componentDidUpdate (prevProps) {
    if (this.props.backend && this.props.backend !== prevProps.backend) {
      this.props.navigation.navigate('Feeds')
    }
  }

  render () {
    const { backend } = this.props
    const width = Dimensions.get('window').width
    const margin = width * 0.05
    const height = Dimensions.get('window').height
    const textStyles = {
      fontFamily: 'IBMPlexSans',
      fontSize: 20 * fontSizeMultiplier(),
      lineHeight: 32 * fontSizeMultiplier(),
      marginTop: margin,
      marginBottom: margin,
      padding: 8 * fontSizeMultiplier(),
      textAlign: 'left',
      color: hslString('rizzleText')
    }
    const textTipStyles = {
      ...textStyles,
      fontSize: 14 * fontSizeMultiplier(),
      lineHeight: 20 * fontSizeMultiplier(),
      marginTop: 0,
      marginBottom: 0
    }
    const backendName = {
      rizzle: 'Rizzle',
      feedwrangler: 'Feedwrangler'
    }[backend] || ''
    return (
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flex: 1,
          backgroundColor: hslString('rizzleBG')
        }}
        resetScrollToCoords={{ x: 0, y: 0 }}
        style={{
          backgroundColor: hslString('rizzleBG')
        }}
      >
        <ScrollView>
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
                title='Your Account'
                showBack={ this.props.user.uid !== null }
                onBack={() => {
                  this.props.navigation.navigate('Feeds')
                }}
              />
              <TextButton
                text={ backend && backend === 'rizzle' ? 'Account Details' : 'Log in to Rizzle' }
                buttonStyle={{ marginBottom: 0 }}
                isExpandable={true}
                isExpanded={true}
                renderExpandedView={() => <AccountCredentialsForm
                  backend={backend}
                  service='rizzle'
                  user={this.props.user}
                  setSignInEmail={this.props.setSignInEmail}
                />}
              />
              {/*}<Text style={ textTipStyles }>If you use the Rizzle service to manage your feeds, you will also be able to save external web pages to read in Rizzle.</Text>
              { (backend || backend !== '') && <Text style={ textTipStyles }>When you switch to Rizzle it will automatically subscribe to all your feeds from {backendName}.</Text> }
              <Text style={ textTipStyles }>Rizzle will cost you $x / month. For you, though, the first month is free.</Text>
              <Heading title='' />
              <Text style={{
                ...textTipStyles,
                marginBottom: 21 }}>If you prefer you can use another RSS service. You’ll need a subscription with them, obvs.</Text>
              { backend !== 'feedwrangler' && <TextButton
                text="Feed Wrangler"
                buttonStyle={{ marginBottom: 42 }}
                isExpandable={true}
                renderExpandedView={() => <AccountCredentialsForm
                  service='feedwrangler'
                  setBackend={this.props.setBackend}
                />}
              /> }
              {*/}
              { /* }
              { backend !== 'feedbin' && <TextButton
                text="Feedbin"
                buttonStyle={{ marginBottom: 42 }}
                isExpandable={true}
                renderExpandedView={() => <AccountCredentialsForm
                  service='feedbin'
                  setBackend={this.props.setBackend}
                />}
              /> }
              { backend !== 'feedly' && <TextButton
                text="Feedly"
                buttonStyle={{ marginBottom: 42 }}
                isExpandable={true}
                renderExpandedView={() => <AccountCredentialsForm
                  service='feedly'
                  setBackend={this.props.setBackend}
                />}
              /> }
            { */ }
            </View>
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    )
  }
}

export default AccountScreen
