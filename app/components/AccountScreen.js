import React, { Fragment } from 'react'
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  Text,
  View
} from 'react-native'
import Config from "react-native-config"
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import TextButton from './TextButton'
import NavButton from './NavButton'
import AccountCredentialsForm from './AccountCredentialsForm'
import { hslString } from '../utils/colors'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import { fontSizeMultiplier, getInset } from '../utils'
import { textInfoStyle, textInfoBoldStyle } from '../utils/styles'
import { ItemType } from '../store/items/types'

class AccountScreen extends React.Component {

  constructor (props) {
    super(props)
    this.props = props
    this.state = {
      expandedBackend: null
    }
    this.setExpandedBackend = this.setExpandedBackend.bind(this)
  }

  redirectToItems () {
    const { backend, displayMode } = this.props
    if (backend) {
      if (displayMode === ItemType.unread) {
        this.props.navigation.push('Feeds')
      }
      this.props.navigation.push('Items')
    }
  }

  componentDidMount () {
    this.redirectToItems()
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
    const feedWranglerLogo = <Image
      source={require('../img/feedwrangler.png')}
      width={24 * fontSizeMultiplier()}
      height={24 * fontSizeMultiplier()}
      style={{
        left: -2,
        top: -2,
        width: 32 * fontSizeMultiplier(),
        height: 32 * fontSizeMultiplier()
      }}
    />

    const getAttributes = (service) => ({
      borderColor: backend === service && hslString('logo1'),
      buttonStyle: { 
        alignSelf: 'center',
        marginBottom: 42,
        // width: buttonWidth 
      },
      iconBg: true,
      iconCollapsed:  getRizzleButtonIcon(service, null, hslString(backend === service ? 'logo1' : 'buttonBG')), 
      iconExpanded:  getRizzleButtonIcon(service, null, hslString(backend === service ? 'logo1' : 'buttonBG')),
      isExpandable: true,
      isExpanded: backend === service || expandedBackend === service,
      isInverted: backend === service,
      fgColor:  backend === service && hslString('logo1'),
      onExpand: () => this.setExpandedBackend(service),
      renderExpandedView: () => <AccountCredentialsForm
        isActive={backend === service}
        service={service}
        setBackend={this.props.setBackend}
        unsetBackend={this.props.unsetBackend}
        user={this.props.user}
      />,
      testID: `${service}-button`
    })

    console.log(Config)

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
        <ScrollView
          showsVerticalScrollIndicator={false}
        >
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
              // marginBottom: 64,
              minHeight: height - 55 - 64,
              width: width - getInset() * 2,
              marginLeft: getInset(),
              marginRight: getInset()
            }}>
              <NavButton
                hasBottomBorder={true}
                hasTopBorder={true}
                icon={getRizzleButtonIcon('rss', hslString('rizzleText'))}
                onPress={() => {
                  this.props.setDisplayMode('unread')
                  this.props.navigation.navigate('Feeds')
                }}
                text='Your Feeds'
                viewStyle={{ paddingLeft: 5 }}
              />
              <NavButton
                hasBottomBorder={true}
                icon={getRizzleButtonIcon('saved', hslString('rizzleText'), hslString('rizzleBG'))}
                onPress={() => {
                  this.props.setDisplayMode('saved')
                  this.props.navigation.navigate('Items')
                }}
                text='Your Saved Stories'
                viewStyle={{ paddingLeft: 5 }}
              />
              { this.props.isFirstTime &&
                <View style={{
                  marginTop: 42
                }}>
                  <Text style={ textTipStyles }>If you already have an account with an RSS service, enter your details below. Alternatively you can use <Text style={italicStyles}>Reams Basic</Text> for free.</Text>
                </View>
              }
              <TextButton
                text={ 'Reams Basic' }
                { ...getAttributes('basic') }
                iconCollapsed={ getRizzleButtonIcon('reams', hslString(backend === 'basic' ? 'white' : 'rizzleText'), hslString(backend === 'basic' ? 'logo1' : 'buttonBG')) }
                iconExpanded={ getRizzleButtonIcon('reams', hslString(backend === 'basic' ? 'white' : 'rizzleText'), hslString(backend === 'basic' ? 'logo1' : 'buttonBG')) }
                buttonStyle={{ 
                  alignSelf: 'center',
                  marginBottom: 42,
                  marginTop: 42,
                }}
              />
              {Config.FLAG_PLUS && <TextButton
                text={ 'Reams +' }
                { ...getAttributes('rizzle') }
                iconCollapsed={ getRizzleButtonIcon('reams', hslString(backend === 'rizzle' ? 'white' : 'rizzleText'), hslString(backend === 'rizzle' ? 'logo1' : 'buttonBG')) }
                iconExpanded={ getRizzleButtonIcon('reams', hslString(backend === 'rizzle' ? 'white' : 'rizzleText'), hslString(backend === 'rizzle' ? 'logo1' : 'biuttonBG')) }
              />}
              <TextButton
                text={ 'Feedbin' }
                { ...getAttributes('feedbin') }
              />
              <TextButton
                text={ 'Feedwrangler' }
                { ...getAttributes('feedwrangler') }
                iconCollapsed={feedWranglerLogo}  
                iconExpanded={feedWranglerLogo}  
              />
              {/*<TextButton
                text="Feedly"
                buttonStyle={{ 
                  alignSelf: 'center',
                  marginBottom: 42,
                  // width: buttonWidth 
                }}
                iconBg={true}
                iconCollapsed={ getRizzleButtonIcon('feedly', null, hslString(backend === 'feedly' ? 'logo1' : 'buttonBG')) }
                iconExpanded={ getRizzleButtonIcon('feedly', null, hslString(backend === 'feedly' ? 'logo1' : 'buttonBG')) }
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
                />*/}
            </View>
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    )
  }
}

export default AccountScreen
