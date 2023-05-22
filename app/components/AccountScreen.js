import React from 'react'
import {
  Animated,
  Dimensions,
  Image,
  StatusBar,
  Text,
  View
} from 'react-native'
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'
import Config from "react-native-config"
import TextButton from './TextButton'
import AccountCredentialsForm from './AccountCredentialsForm'
import { hslString } from '../utils/colors'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import { fontSizeMultiplier, getInset, getMargin, getStatusBarHeight } from '../utils'
import { textInfoStyle } from '../utils/styles'
import { ItemType } from '../store/items/types'

class AccountScreen extends React.Component {

  scrollAnim = new Animated.Value(0)

  constructor (props) {
    super(props)
    this.props = props
    this.state = {
      expandedBackend: !!props.backend ? null : 'basic'
    }
    this.setExpandedBackend = this.setExpandedBackend.bind(this)
  }

  setExpandedBackend (backend) {
    this.setState({
      expandedBackend: backend
    })
  }

  redirectToItems (gotoFeeds = false, useTimeout = false) {
    const { backend, displayMode, navigation } = this.props
    let args = []
    if (backend) {
      if (displayMode === ItemType.saved) {
        args = ['Items']
      } else if (gotoFeeds) {
        args = ['Feeds', 'Items', 'Feeds']
      } else {
        args = ['Feeds', 'Items']
      }
    }

    const setNav = (navigation, args) => {
      if (navigation.canGoBack()) {
        navigation.popToTop()
      }
      args.forEach(arg => navigation.navigate(arg))
    }

    if (useTimeout) {
      setTimeout(() => setNav(navigation, args), 300)
    } else {
      setNav(navigation, args)
    }
  }

  componentDidMount () {
    const { backend, isOnboarding, navigation } = this.props
    if (!backend || backend === '') {
      navigation.setOptions({
        headerStyle: {
          backgroundColor: hslString('logo1'),
          
          // https://github.com/react-navigation/react-navigation/issues/6899
          shadowOffset: { height: 0, width: 0 }
        },
        headerTintColor: 'white'
      })
    }
  }

  componentDidUpdate (prevProps) {
    const { backend, hasFeeds, isOnboarding, navigation } = this.props
    if (prevProps.backend === '' && backend !== '') {
      this.redirectToItems(!hasFeeds, true)
    }
    if (backend?.length  > 0) {
      navigation.setOptions({
        headerStyle: {
          backgroundColor: hslString('rizzleBG'),
          height: getStatusBarHeight(),
          shadowOffset: { height: 0, width: 0 }
        }
      })
    }
  }


  render () {
    const { backend, hasFeeds, isPortrait, navigation, isReadwise } = this.props
    const { expandedBackend } = this.state
    const width = Dimensions.get('window').width
    const buttonWidth = width > 950 ?
      600 :
      '100%'

    const margin = getMargin()
    const height = Dimensions.get('window').height
    const textStyles = (color) => ({
      ...textInfoStyle(color),
      marginTop: margin,
      marginBottom: margin,
      marginLeft: 0,
      marginRight: 0,
      // padding: 8 * fontSizeMultiplier(),
    })
    const italicStyles = {
      fontFamily: 'IBMPlexSans-Italic'
    }
    const textTipStyles = (color) => ({
      ...textStyles(color),
      fontSize: 18 * fontSizeMultiplier(),
      lineHeight: 26 * fontSizeMultiplier(),
      marginTop: 0,
      marginBottom: 0,
      color
    })
    const textTipStylesBold = (color) => ({
      ...textTipStyles(color),
      fontFamily: 'IBMPlexSans-Bold'
    })
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

    const HelpView = ({children, title, style }) => (
      <View style={{
        padding: getMargin(), 
        backgroundColor: hslString('logo1'), 
        marginLeft: -getMargin() * 2, 
        marginRight: -getMargin() * 2, 
        marginTop: 0 - getStatusBarHeight(),
        marginBottom: getMargin() * 2,
        paddingTop: getStatusBarHeight() + getMargin() * 2,
        minHeight: getStatusBarHeight() + getMargin() + 200,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...style 
      }}>
        <Image 
          source={require('../assets/images/feeds-screen-onboarding-bg.png')} 
          style={{
            alignSelf: 'center',
            width: 200 / 311 * 1238,
            height: 200,
            marginLeft: 0 - getMargin(),
            position: 'absolute',
            top: getStatusBarHeight() + getMargin(),
          }}
        />
        <View style={{ 
          // flex: 1, 
          marginTop: 0, 
          paddingTop: 0, 
          textAlign: 'center', 
          alignItems: 'center',
          paddingHorizontal: getMargin() * 2,
          maxWidth: 600 - getMargin() * 2,
        }}>
          {children}
        </View>
      </View>
    )

    const Separator = ({title}) => (
      <View style={{
        borderTopColor: hslString('rizzleText', '', 0.3),
        borderTopWidth: 1,
        marginVertical: margin,
        paddingTop: margin / 2,
        // flex: 1,
        flexDirection: 'row',
        // justifyContent: 'space-between',
      }}>
        <Text style={{
          ...textInfoStyle(),
          fontFamily: 'IBMPlexSans-Bold',
          fontSize: 22 * fontSizeMultiplier(),
          padding: 0,
          marginLeft: 0,
          flex: 4
        }}>{title}</Text> 
      </View>
    )

    const isBackendActive = (service) => service === 'readwise' 
      ? isReadwise 
      : backend === service

    const getAttributes = (service) => {
      const bgColor = isBackendActive(service) ? hslString('logo1') : hslString('buttonBG')
      const fgColor = isBackendActive(service) ? 'white' : hslString('rizzleText')
      return {
        borderColor: isBackendActive(service) && hslString('logo1'),
        buttonStyle: { 
          alignSelf: 'center',
          marginBottom: getMargin() * 2,
          // width: buttonWidth 
        },
        iconBg: true,
        iconCollapsed:  getRizzleButtonIcon(service, fgColor, bgColor), 
        iconExpanded:  getRizzleButtonIcon(service, fgColor, bgColor),
        isExpandable: true,
        isExpanded: isBackendActive(service) || expandedBackend === service,
        isInverted: isBackendActive(service),
        fgColor:  isBackendActive(service) && hslString('logo1'),
        onExpand: () => this.setExpandedBackend(service),
        renderExpandedView: () => <AccountCredentialsForm
          isActive={service === 'readwise' ? isReadwise : backend === service}
          service={service}
          setBackend={this.props.setBackend}
          unsetBackend={this.props.unsetBackend}
          setExtraBackend={this.props.setExtraBackend}
          unsetExtraBackend={this.props.unsetExtraBackend}
          user={this.props.user}
        />,
        testID: `${service}-button`
      }
    }

    // console.log(Config)  
  
    return (
      <View>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          // onScroll={Animated.event(
          //   [{ nativeEvent: {
          //     contentOffset: { y: this.scrollAnim }
          //   }}],
          //   {
          //     useNativeDriver: true
          //   }
          // )}
          // scrollEventThrottle={1}
          style={{
            backgroundColor: hslString('rizzleBG')
          }}
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
              width: width - getInset() * (isPortrait ? 2 : 4),
              marginHorizontal: getInset() * (isPortrait ? 1 : 2)
            }}>
              { !backend &&
                <HelpView>
                  <Text style={{ 
                    ...textTipStyles('white'),
                    textAlign: 'center',
                    marginBottom: getMargin() * 2,
                  }}>You don't need one to use Reams, but if you have an account with one of the RSS servives below, enter your login details.</Text>
                  <TextButton
                    onPress={() => this.props.setBackend('basic')} 
                    text='I don’t have an account'></TextButton>
                </HelpView>
              }
              {/* <TextButton
                text={ 'Reams Basic' }
                { ...getAttributes('basic') }
                iconCollapsed={ getRizzleButtonIcon('reams', hslString(backend === 'basic' ? 'white' : 'rizzleText'), hslString(backend === 'basic' ? 'logo1' : 'buttonBG')) }
                iconExpanded={ getRizzleButtonIcon('reams', hslString(backend === 'basic' ? 'white' : 'rizzleText'), hslString(backend === 'basic' ? 'logo1' : 'buttonBG')) }
                buttonStyle={{ 
                  alignSelf: 'center',
                  marginBottom: getMargin() * 2,
                  marginTop: getMargin() * 2,
                }}
              /> */}
              <Separator title='RSS' />
              {Config.FLAG_PLUS && <TextButton
                text={ 'Reams +' }
                { ...getAttributes('rizzle') }
                iconCollapsed={ getRizzleButtonIcon('reams', hslString(backend === 'rizzle' ? 'white' : 'rizzleText'), hslString(backend === 'rizzle' ? 'logo1' : 'buttonBG')) }
                iconExpanded={ getRizzleButtonIcon('reams', hslString(backend === 'rizzle' ? 'white' : 'rizzleText'), hslString(backend === 'rizzle' ? 'logo1' : 'biuttonBG')) }
              />}
              { !backend &&
                <View style={{ marginBottom: getMargin() * 2 }}>
                  <Text style={textInfoStyle(undefined, 0)}>Or, if you already have an account with a supported service, enter your details below:</Text>
                </View>
              }
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
              <Separator title='Highlights' />
              <TextButton
                text={ 'Readwise' }
                { ...getAttributes('readwise') }
              />
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>
    )
  }
}

export default AccountScreen
