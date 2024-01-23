import React from 'react'
import {
  Animated,
  Dimensions,
  Image,
  Platform,
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
    const { backend, navigation } = this.props
    // if (!backend || backend === '') {
    //   navigation.setOptions({
    //     headerStyle: {
    //       backgroundColor: hslString('logo1'),
          
    //       // https://github.com/react-navigation/react-navigation/issues/6899
    //       shadowOffset: { height: 0, width: 0 }
    //     },
    //     headerTintColor: 'white'
    //   })
    // }
  }

  componentDidUpdate (prevProps) {
    const { backend, hasFeeds, navigation } = this.props
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
    const { backend, hasFeeds, isPortrait, navigation, isFeedbin, isReadwise } = this.props
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
      : service === 'feedbin' ?
        isFeedbin :
        true

    const that = this
    let gradientIndex = 0
    const getAttributes = (service) => {
      const bgColor = isBackendActive(service) ? hslString('logo1') : hslString('buttonBG')
      const fgColor = isBackendActive(service) ? 'white' : hslString('rizzleText')
      const isActive = isBackendActive(service)
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
        isGradient: isBackendActive(service),
        gradientIndex: gradientIndex++,
        fgColor:  isBackendActive(service) && hslString('logo1'),
        onExpand: () => that.setExpandedBackend(service),
        expandedView: (
          <AccountCredentialsForm
            isActive={isActive}
            service={service}
            setBackend={that.props.setBackend}
            unsetBackend={that.props.unsetBackend}
            user={that.props.user}
          />
        ),
        testID: `${service}-button`
      }
    }

    // console.log(Config)  
  
    return (
      <View style={
        Platform.OS === 'web' ?
          {
            flex: 1,
            backgroundColor: hslString('rizzleBG'),
            paddingTop: getStatusBarHeight(),
          } : {}
      }>
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
              alignItems: 'center',
              alignSelf: Platform.OS === 'web' ? 'center' : undefined,
              flex: 1,
              justifyContent: 'center',
              maxWidth: Platform.OS === 'web' ? 600 : undefined,
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
              marginHorizontal: getInset() * (isPortrait ? 1 : 2),
              marginTop: getMargin() * 2,
            }}>
              <TextButton
                text={ 'Reams' }
                { ...getAttributes('reams') }
              />
              <Separator title='RSS' />
              <TextButton
                text={ 'Feedbin' }
                { ...getAttributes('feedbin') }
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
