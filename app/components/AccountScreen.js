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
import AccountCredentialsForm from './AccountCredentialsForm'
import { hslString } from '../utils/colors'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import { fontSizeMultiplier } from '../utils'

class AccountScreen extends React.Component {

  constructor (props) {
    super(props)
    this.props = props
    this.state = {
      expandedBackend: null
    }
    this.setExpandedBackend = this.setExpandedBackend.bind(this)
  }

  componentDidUpdate (prevProps) {
    if (this.props.backend && this.props.backend !== prevProps.backend) {
      this.props.navigation.navigate('Feeds')
    }
  }

  setExpandedBackend (backend) {
    this.setState({
      expandedBackend: backend
    })
  }

  render () {
    const { backend } = this.props
    const { expandedBackend } = this.state
    const width = Dimensions.get('window').width
    const buttonWidth = width > 950 ?
      600 :
      '100%'

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
                buttonStyle={{ 
                  alignSelf: 'center',
                  marginBottom: 42,
                  width: buttonWidth 
                }}
                iconBg={true}
                iconCollapsed={ getRizzleButtonIcon('rizzle', null, hslString(backend === 'basic' ? 'logo1' : 'white')) }
                iconExpanded={ getRizzleButtonIcon('rizzle', null, hslString(backend === 'basic' ? 'logo1' : 'white')) }
                isExpandable={true}
                isExpanded={backend === 'basic' || expandedBackend === 'basic'}
                isInverted={ backend === 'basic' }
                onExpand={() => this.setExpandedBackend('basic')}
                fgColor={ backend === 'basic' && hslString('logo1') }
                renderExpandedView={() => <AccountCredentialsForm
                  backend={backend}
                  isActive={ backend === 'basic' }
                  service='basic'
                  setSignInEmail={this.props.setSignInEmail}
                  unsetBackend={this.props.unsetBackend}
                  user={this.props.user}
                />}
              />
              <TextButton
                buttonStyle={{ 
                  alignSelf: 'center',
                  marginBottom: 42,
                  width: buttonWidth 
                }}
                iconBg={true}
                iconCollapsed={ getRizzleButtonIcon('feedbin', null, hslString(backend === 'feedbin' ? 'logo1' : 'white')) }
                iconExpanded={ getRizzleButtonIcon('feedbin', null, hslString(backend === 'feedbin' ? 'logo1' : 'white')) }
                isExpandable={true}
                isExpanded={ backend === 'feedbin' || expandedBackend === 'feedbin'}
                isInverted={ backend === 'feedbin' }
                fgColor={ backend === 'feedbin' && hslString('logo1') }
                onExpand={() => this.setExpandedBackend('feedbin')}
                renderExpandedView={() => <AccountCredentialsForm
                  isActive={ backend === 'feedbin' }
                  service='feedbin'
                  setBackend={this.props.setBackend}
                  unsetBackend={this.props.unsetBackend}
                  user={this.props.user}
                />}
                testID='feedbin-button'
                text='Feedbin'
              />
              <TextButton
                text="Feedly"
                buttonStyle={{ 
                  alignSelf: 'center',
                  marginBottom: 42,
                  width: buttonWidth 
                }}
                iconBg={true}
                iconCollapsed={ getRizzleButtonIcon('feedly', null, hslString(backend === 'feedly' ? 'logo1' : 'white')) }
                iconExpanded={ getRizzleButtonIcon('feedly', null, hslString(backend === 'feedly' ? 'logo1' : 'white')) }
                isExpandable={true}
                isExpanded={backend === 'feedly' || expandedBackend === 'feedly'}
                onExpand={() => this.setExpandedBackend('feedly')}
                renderExpandedView={() => <AccountCredentialsForm
                  isActive={ backend === 'feedly' }
                  service='feedly'
                  setBackend={this.props.setBackend}
                  unsetBackend={this.props.unsetBackend}
                  user={this.props.user}
                isInverted={ backend === 'feedly' }
                />}
              />
              <TextButton
                text="Feed Wrangler"
                buttonStyle={{ 
                  alignSelf: 'center',
                  marginBottom: 42,
                  width: buttonWidth 
                }}
                isExpandable={true}
                isExpanded={ backend === 'feedwrangler' }
                isInverted={ backend === 'feedwrangler' }
                bgColor={ backend === 'feedwrangler' && hslString('logo1') }
                onExpand={() => this.setExpandedBackend('feedwrangler')}
                renderExpandedView={() => <AccountCredentialsForm
                  isActive={ backend === 'feedwrangler' || expandedBackend === 'feedwrangler'}
                  service='feedwrangler'
                  setBackend={this.props.setBackend}
                  unsetBackend={this.props.unsetBackend}
                  user={this.props.user}
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
