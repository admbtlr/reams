import React, { useContext, useEffect, useState } from 'react'
import { Image, PixelRatio, Pressable, Text, View } from 'react-native'
import { fontSizeMultiplier, getMargin } from '../utils/dimensions'
import { textInfoStyle } from '../utils/styles'
import { hslString } from '../utils/colors'
import { NativePressableScale } from './NativePressableScale'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import XButton from './XButton'
import { useNavigation } from '@react-navigation/native'
import Purchases from 'react-native-purchases'
import { prod } from '@tensorflow/tfjs'
import log from '../utils/log'
import { useDispatch } from 'react-redux'
import { ModalContext } from './ModalProvider'
import { SET_PREMIUM } from '../store/user/types'
import InAppBrowser from 'react-native-inappbrowser-reborn'

const textLargeStyle = {
  ...textInfoStyle(hslString('rizzleText')),
  fontSize: 24 * fontSizeMultiplier()
}

const textListStyle = {
  ...textInfoStyle((hslString('rizzleText'))),
  fontSize: 16 * fontSizeMultiplier(),
  textAlign: 'left',
  // marginBottom: 18 * fontSizeMultiplier(),
  marginLeft: getMargin() / 2
}

const textSmallStyle = {
  ...textInfoStyle(hslString('rizzleText')),
  fontSize: 12 * fontSizeMultiplier(),
}

const Subscribe = () => {
  const navigation = useNavigation()
  const [products, setProducts] = useState<{monthly: {}, annual: {}}>()

  useEffect(() => {
    const getPurchaseProducts = async () => {
      try {
        const offerings = await Purchases.getOfferings()
        if (offerings.current?.monthly && offerings.current?.annual) {
          const monthly = offerings.current.monthly.product
          const annual = offerings.current.annual.product
          setProducts({monthly, annual})
        }
      } catch (e) {}
    }

    getPurchaseProducts()
  }, [])

  return (
      <View 
        style={{
          flex: 1,
          marginTop: 0,
          paddingHorizontal: getMargin(),
          paddingTop: getMargin() * 2,
          paddingBottom: getMargin() * 2,
          justifyContent: 'space-between',
          height: '100%',
          backgroundColor: hslString('rizzleBG')
        }}>
        <XButton
          onPress={() => navigation.goBack()}
          style={{
            top: getMargin() / 2,
            right: getMargin() / 2
          }}
        />

        {/* <Image 
          source={require('../assets/images/ream.png')} 
          style={{
            width: 128,
            height: 128,
            alignSelf: 'center',
            margin: 32
          }}
        /> */}
        <Text style={{
          ...textLargeStyle,
          // textAlign: 'center',
          marginBottom: getMargin(),
        }}>Upgrade to <Text style={{ 
            color: hslString('logo1'),
            fontFamily: 'IBMPlexSans-Bold' 
          }}>Preamium</Text> and become <Text style={{ 
            color: hslString('logo2')
          }}>even more serious</Text>, <Text style={{ 
            color: hslString('logo2')
          }}>even more joyful</Text>, and <Text style={{ 
            color: hslString('logo2')
          }}>even more open</Text></Text>
        <View style={{
            backgroundColor: hslString('white', '', 0.3),
            borderRadius: 8,
            marginHorizontal: getMargin(),
          }}>
          <Benefit description='Unlimited feeds & newsletters' icon='rss' />
          <Benefit description='Unlimited saves to library' icon='saved' />
          <Benefit description='Unlimited highlights' icon='highlights' />
          <Benefit description='Unlimited gratitude' icon='heart' hideBottomBorder />
        </View>
        { products && (
          <View>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              // marginBottom: 32
            }}>
              <SubscribeButton 
                label='Annual' 
                price={products.annual.priceString} 
                productName='premium_annual'
                onPress={() => console.log('Annual')} 
              />
              <SubscribeButton 
                label='Monthly' 
                price={products.monthly.priceString}
                productName='premium_monthly'
                onPress={() => console.log('Monthly')} 
              />
            </View>
            <Text style={{
              ...textInfoStyle(hslString('rizzleText')),
              fontSize: 12 * fontSizeMultiplier(),
            }}>Payment will be charged to your Apple ID account at the confirmation of purchase. The subscription automatically renews unless it is cancelled at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours priosr to the end of the current period. You can manage and cancel your subscription in your App Store settings.</Text>

          </View>
        )}
        <View style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: getMargin() / 2
        }}>
          <Pressable onPress={() => {
            InAppBrowser.open('https://reams.app/privacy/')
          }}>
            <Text style={{
              ...textSmallStyle,
              textDecorationLine: 'underline',
              margin: 0
              }}>Privacy</Text>
          </Pressable>
          <Pressable onPress={() => {
            InAppBrowser.open('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')
          }}>
            <Text style={{
              ...textSmallStyle,
              textDecorationLine: 'underline'
              }}>Terms</Text>
          </Pressable>
        </View>  
      </View>
  )
}

const Benefit = ({ description, icon, hideBottomBorder }: { description: string, icon: string, hideBottomBorder?: boolean }) => (
  <View style={{
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderBottomWidth: hideBottomBorder ? 0 : 1 / PixelRatio.get(),
    borderBottomColor: hslString('rizzleText', undefined, 0.5),
    marginHorizontal: getMargin() / 2,
    paddingHorizontal: getMargin() / 2,
    paddingVertical: getMargin()
  }}>
    <View style={{
      width: 32,
      height: 32,
      marginRight: getMargin() / 2
    }}>
      { getRizzleButtonIcon(icon, hslString('rizzleText'), 'transparent') }
    </View>
    <Text style={ textListStyle }>{ description }</Text>
  </View>
)

const SubscribeButton = ({
  label, price, productName, navigation}: 
  {label: string, price: string, productName: string, navigation: any}) => {
  const dispatch = useDispatch()
  const context = useContext(ModalContext)
  const { openModal } = context

  return (
    <NativePressableScale
      onPress={async () => {
        try {
          const products = await Purchases.getProducts([productName])
          const { customerInfo } = await Purchases.purchaseStoreProduct(products[0])
          if (
            typeof customerInfo.entitlements.active["my_entitlement_identifier"] !==
            "undefined"
          ) {
            // shut the subscribe page and throw up a modal saying thank you
            // and set the user's entitlements
            navigation.goBack()
            dispatch({
              type: SET_PREMIUM,
              isPremium: true
            })
            openModal({
              modalText: [
                {
                  text: 'Subscription Successful',
                  style: ['title']
                },
                {
                  text: 'Thank you for subscribing to Preamium! You now have full access to all app features, as well as the warm feeling of knowing that you contribute to its sustained development.', 
                  style: ['text']
                },
                {
                  text: 'If you have any questions or feedback, please don\'t hesitate to get in touch with me at adam@reams.app.', 
                  style: ['text']
                }
              ],
              modalHideCancel: true,
              modalOnOk: () => {}
            })
                  }
        } catch (e: any) {
          if (!e.userCancelled) {
            log(e)
          }
        }
      }}
      style={{
        flex: 1,
        alignContent: 'center',
        // marginRight: getMargin(),
      }}
    >
      <View style={{
        backgroundColor: hslString('white', '', 0.7),
        borderColor: hslString('rizzleText'),
        borderWidth: 1 / PixelRatio.get(),
        padding: 16,
        borderRadius: 8,
        margin: getMargin(),
        // flex: 1,
        alignItems: 'center',
      }}>
        <Text style={{
          fontFamily: 'IBMPlexSans-Regular',
          color: hslString('rizzleText'),
          fontSize: 18 * fontSizeMultiplier(),
          marginBottom: 8 * fontSizeMultiplier()
        }}>{ label }</Text>
        <Text style={{
          fontFamily: 'IBMPlexSans-Regular',
          color: hslString('rizzleText'),
          fontSize: 24 * fontSizeMultiplier()
        }}>{ price }</Text>
      </View>
    </NativePressableScale>
  )
  
}

export default Subscribe
