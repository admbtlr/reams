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
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
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
    const boldStyles = {
      fontFamily: 'IBMPlexSans-Bold'
    }
    const italicStyles = {
      fontFamily: 'IBMPlexSans-Italic'
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
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            testID='account-screen'
          >
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
                isBigger={false}
                showBack={ this.props.user.uid !== null }
                onBack={() => {
                  this.props.navigation.navigate('Feeds')
                }}
              />
              <Text style={ textTipStyles }>If you have an account with an RSS service, enter your details below.</Text>
              <Text style={{
                ...textTipStyles,
                marginBottom: 30
              }}>If you don’t have an account, you can use <Text style={italicStyles}>Rizzle Basic</Text> for free. <Text style={italicStyles}>Rizzle Basic</Text> lets you subscribe to RSS feeds and read stories, but what happens in Rizzle stays in Rizzle: you can’t sync your data with <Text style={italicStyles}>Rizzle Basic</Text>.</Text>
              <TextButton
                text={ 'Rizzle Basic' }
                buttonStyle={{ marginBottom: 42 }}
                iconBg={true}
                iconCollapsed={ getRizzleButtonIcon('rizzle', null, hslString(backend === 'rizzle' ? 'logo1' : 'white')) }
                iconExpanded={ getRizzleButtonIcon('rizzle', null, hslString(backend === 'rizzle' ? 'logo1' : 'white')) }
                isExpandable={true}
                isExpanded={backend && backend === 'rizzle'}
                isInverted={ backend === 'rizzle' }
                renderExpandedView={() => <AccountCredentialsForm
                  backend={backend}
                  isActive={ backend === 'feedwrangler' }
                  service='rizzle'
                  user={this.props.user}
                  setSignInEmail={this.props.setSignInEmail}
                />}
              />
              <TextButton
                buttonStyle={{ marginBottom: 42 }}
                iconBg={true}
                iconCollapsed={ getRizzleButtonIcon('feedbin', null, hslString(backend === 'feedbin' ? 'logo1' : 'white')) }
                iconExpanded={ getRizzleButtonIcon('feedbin', null, hslString(backend === 'feedbin' ? 'logo1' : 'white')) }
                isExpandable={true}
                isExpanded={ backend === 'feedbin' }
                isInverted={ backend === 'feedbin' }
                fgColor={ backend === 'feedbin' && hslString('logo1') }
                renderExpandedView={() => <AccountCredentialsForm
                  isActive={ backend === 'feedbin' }
                  service='feedbin'
                  setBackend={this.props.setBackend}
                  unsetBackend={this.props.unsetBackend}
                />}
                testID='feedbin-button'
                text='Feedbin'
              />
              <TextButton
                text="Feedly"
                buttonStyle={{ marginBottom: 42 }}
                iconBg={true}
                iconCollapsed={ getRizzleButtonIcon('feedly', null, hslString(backend === 'feedly' ? 'logo1' : 'white')) }
                iconExpanded={ getRizzleButtonIcon('feedly', null, hslString(backend === 'feedly' ? 'logo1' : 'white')) }
                isExpandable={true}
                isExpanded={backend && backend === 'feedly'}
                renderExpandedView={() => <AccountCredentialsForm
                  isActive={ backend === 'feedly' }
                  service='feedly'
                  setBackend={this.props.setBackend}
                  unsetBackend={this.props.unsetBackend}
                isInverted={ backend === 'feedly' }
                />}
              />
              <TextButton
                text="Feed Wrangler"
                buttonStyle={{ marginBottom: 42 }}
                isExpandable={true}
                isExpanded={ backend === 'feedwrangler' }
                isInverted={ backend === 'feedwrangler' }
                bgColor={ backend === 'feedwrangler' && hslString('logo1') }
                renderExpandedView={() => <AccountCredentialsForm
                  isActive={ backend === 'feedwrangler' }
                  service='feedwrangler'
                  setBackend={this.props.setBackend}
                  unsetBackend={this.props.unsetBackend}
                />}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    )
  }
}

export default AccountScreen
