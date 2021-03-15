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
import AccountCredentialsForm from './AccountCredentialsForm'
import { hslString } from '../utils/colors'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import { fontSizeMultiplier, getInset } from '../utils'
import { textInfoStyle } from '../utils/styles'
import { ItemType } from '../store/items/types'

class AccountScreen extends React.Component {

  scrollAnim = new Animated.Value(0)

  constructor (props) {
    super(props)
    this.props = props
    this.state = {
      expandedBackend: null
    }
    this.setExpandedBackend = this.setExpandedBackend.bind(this)
  }

  redirectToItems () {
    const { backend, displayMode, isFirstTime } = this.props
    if (isFirstTime) {
      // let's onboard!
      this.props.navigation.push('Items')
    } else if (backend) {
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
      ...textInfoStyle(),
      marginTop: margin,
      marginBottom: margin,
      marginLeft: 0,
      marginRight: 0,
      // padding: 8 * fontSizeMultiplier(),
    }
    const italicStyles = {
      fontFamily: 'IBMPlexSans-Italic'
    }
    const textTipStyles = {
      ...textStyles,
      fontSize: 18 * fontSizeMultiplier(),
      lineHeight: 24 * fontSizeMultiplier(),
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
                <Animated.View style={{
                  transform: [
                    // {
                    //   translateY: this.scrollAnim.interpolate({
                    //     inputRange: [-1, 0, 1],
                    //     outputRange: [-1, 0, 0]
                    //   })
                    // }
                  ]
                }}>
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
                </Animated.View>
              }
              { !backend &&
                <View style={{
                  marginTop: 42
                }}>
                  <Text style={ textTipStyles }>You need an RSS service to use Reams. If you don’t have an account with one of the supported services, just use <Text style={italicStyles}>Reams Basic</Text>.</Text>
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
              { !backend &&
                <View style={{ marginBottom: 42 }}>
                  <Text style={textTipStyles}>Or, if you already have an account with a supported service, enter your details below:</Text>
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
          </View>
        </KeyboardAwareScrollView>
    )
  }
}

export default AccountScreen
