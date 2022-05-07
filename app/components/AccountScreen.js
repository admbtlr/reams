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
import NavButton from './NavButton'
import {STATUS_BAR_HEIGHT} from './TopBar'
import AccountCredentialsForm from './AccountCredentialsForm'
import { hslString } from '../utils/colors'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import { fontSizeMultiplier, getInset } from '../utils'
import { textInfoBoldStyle, textInfoStyle } from '../utils/styles'
import { ItemType } from '../store/items/types'

import { Link } from '@react-navigation/native'

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

  redirectToItems (gotoFeeds = false, useTimeout = false) {
    const { backend, displayMode, isOnboarding } = this.props
    let args
    if (isOnboarding) {
      args = ['Items']
    } else if (backend) {
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
      setTimeout(() => setNav(this.props.navigation, args), 300)
    } else {
      setNav(this.props.navigation, args)
    }
  }

  componentDidMount () {
    const { backend, isOnboarding, navigation } = this.props
    if (isOnboarding) {
      this.redirectToItems()
    } else if (!backend || backend === '') {
      navigation.setOptions({
        headerStyle: {
          backgroundColor: hslString('logo1'),
          // https://github.com/react-navigation/react-navigation/issues/6899
          shadowOffset: { height: 0, width: 0 }
        }
      })
    }
  }

  componentDidUpdate (prevProps) {
    const { backend, hasFeeds, isOnboarding, navigation } = this.props
    if (isOnboarding) {
      // this.redirectToItems()
    }    
    if (prevProps.backend === '' && backend !== '') {
      this.redirectToItems(!hasFeeds, true)
    }
    if (backend?.length  > 0) {
      navigation.setOptions({
        headerStyle: {
          backgroundColor: hslString('rizzleBG'),
          height: STATUS_BAR_HEIGHT,
          shadowOffset: { height: 0, width: 0 }
        }
      })
    }
  }

  setExpandedBackend (backend) {
    this.setState({
      expandedBackend: backend
    })
  }

  render () {
    const { backend, hasFeeds, navigation } = this.props
    const { expandedBackend } = this.state
    const width = Dimensions.get('window').width
    const buttonWidth = width > 950 ?
      600 :
      '100%'

    const margin = width * 0.05
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
        padding: width * 0.05, 
        backgroundColor: hslString('logo1'), 
        marginLeft: -width * 0.1, 
        marginRight: -width * 0.1, 
        marginTop: 0 - STATUS_BAR_HEIGHT,
        paddingTop: STATUS_BAR_HEIGHT + width * 0.1,
        minHeight: STATUS_BAR_HEIGHT + width * 0.05 + 200,
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
            marginLeft: -width * 0.05,
            position: 'absolute',
            top: STATUS_BAR_HEIGHT + width * 0.025,
          }}
        />
        <View style={{ 
          // flex: 1, 
          marginTop: 0, 
          paddingTop: 0, 
          textAlign: 'center', 
          alignItems: 'center',
          paddingHorizontal: width * 0.1,
          maxWidth: 600 - width * 0.1,
        }}>
          {children}
        </View>
      </View>
    )

    const getAttributes = (service) => ({
      borderColor: backend === service && hslString('logo1'),
      buttonStyle: { 
        alignSelf: 'center',
        marginBottom: width * 0.1,
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

    // console.log(Config)

    return (
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
              width: width - getInset() * 2,
              marginLeft: getInset(),
              marginRight: getInset()
            }}>
              { !!backend &&
                <View>
                  <NavButton
                    hasBottomBorder={true}
                    hasTopBorder={true}
                    icon={getRizzleButtonIcon('rss', hslString('rizzleText'))}
                    onPress={() => {
                      this.props.setDisplayMode('unread')
                      this.props.navigation.navigate('Feeds')
                    }}
                    scrollAnim={this.scrollAnim}
                    index={0}
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
                    scrollAnim={this.scrollAnim}
                    index={1}
                    text='Your Saved Stories'
                    viewStyle={{ paddingLeft: 5 }}
                  />
                </View>
              }
              { !backend &&
                <HelpView>
                  <Text style={{ 
                    ...textTipStyles('white'),
                    textAlign: 'center',
                  }}>If you have an account with either Feedbin or Feed Wrangler, enter your login details below. Alternatively, you can just use Reams Basic.</Text>
                </HelpView>
              }
              <TextButton
                text={ 'Reams Basic' }
                { ...getAttributes('basic') }
                iconCollapsed={ getRizzleButtonIcon('reams', hslString(backend === 'basic' ? 'white' : 'rizzleText'), hslString(backend === 'basic' ? 'logo1' : 'buttonBG')) }
                iconExpanded={ getRizzleButtonIcon('reams', hslString(backend === 'basic' ? 'white' : 'rizzleText'), hslString(backend === 'basic' ? 'logo1' : 'buttonBG')) }
                buttonStyle={{ 
                  alignSelf: 'center',
                  marginBottom: width * 0.1,
                  marginTop: width * 0.1,
                }}
              />
              {Config.FLAG_PLUS && <TextButton
                text={ 'Reams +' }
                { ...getAttributes('rizzle') }
                iconCollapsed={ getRizzleButtonIcon('reams', hslString(backend === 'rizzle' ? 'white' : 'rizzleText'), hslString(backend === 'rizzle' ? 'logo1' : 'buttonBG')) }
                iconExpanded={ getRizzleButtonIcon('reams', hslString(backend === 'rizzle' ? 'white' : 'rizzleText'), hslString(backend === 'rizzle' ? 'logo1' : 'biuttonBG')) }
              />}
              { !backend &&
                <View style={{ marginBottom: width * 0.1 }}>
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
            </View>
            <Link to="/login-callback/?x=3" style={{ marginBottom: 30 }}>Go to login callback</Link>
            <Link to="/Feeds" style={{ marginBottom: 30 }}>Go to Feeds</Link>
          </View>
        </KeyboardAwareScrollView>
    )
  }
}

export default AccountScreen
