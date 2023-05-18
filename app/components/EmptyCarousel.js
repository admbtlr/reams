import { ItemType } from '../store/items/types'
import React, { Fragment } from 'react'
import { Dimensions, Image, Text, View } from 'react-native'
import BackButton from './BackButton'
import { textInfoBoldStyle, textInfoStyle } from '../utils/styles'
import { fontSizeMultiplier, getMargin, getStatusBarHeight } from '../utils'

const EmptyCarousel = ({ displayMode, navigation }) => {
  return <Fragment>
    <BackButton style={{
        position: 'absolute',
        top: getStatusBarHeight() - 60,
        left: getMargin() / 2,
      }}
      onPress={() => navigation.goBack()}
    />
          { displayMode === ItemType.saved ?
            (<View style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{
                ...textInfoStyle(),
                margin: getMargin(),
                lineHeight: 24,  
                width: '100%',
                paddingHorizontal: getMargin() * 2
              }}>Save stories from your feed with the library button.</Text>
              <Text style={{
                ...textInfoStyle(),
                margin: getMargin(),
                lineHeight: 24,  
                width: '100%',
                paddingHorizontal: getMargin() * 2
              }}>Save stories from your favourite websites with the Reams Share Extension:</Text>
              <Image 
                height={328}
                width={150}
                source={require('../assets/images/reams-external-save.webp')} 
                style={{
                  backgroundColor: 'white',
                  borderColor: 'rgba(0,0,0,0.8)',
                  borderWidth: 2,
                  width: 150,
                  height: 328,
                  margin: getMargin(),
                  borderRadius: 25
                }}
              />
            </View>) :
            (<Text style={{
              ...textInfoStyle(),
              fontSize: 16 * fontSizeMultiplier(),
              marginBottom: 24 * fontSizeMultiplier(),
              marginTop: 24 * fontSizeMultiplier(),
              marginLeft: 0,
              marginRight: 0,
              textAlign: 'center'
            }}>You have no unread stories.</Text>)
          }
  </Fragment>
}

export default EmptyCarousel
