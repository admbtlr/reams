import { ItemType } from '../store/items/types'
import React, { Fragment } from 'react'
import { Dimensions, Image, Text, View } from 'react-native'
import BackButton from './BackButton'
import { STATUS_BAR_HEIGHT } from './TopBar'
import { textInfoBoldStyle, textInfoStyle } from '../utils/styles'
import { fontSizeMultiplier } from '../utils'

const EmptyCarousel = ({ displayMode, navigation }) => {
  return <Fragment>
    <BackButton style={{
        position: 'absolute',
        top: STATUS_BAR_HEIGHT - 60,
        left: Dimensions.get('window').width * 0.025,
      }}
      onPress={() => navigation.goBack()}
    />
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '66%',
      marginLeft: '16.67%'
    }}>
        <View style={{ 
          flex: 1,
          justifyContent: 'center',
          alignItems: 'stretch'
        }}>
          <Image
            // resizeMode='contain'
            source={require('../assets/images/ream-sepia.png')}
            style={{
              // flex: 1,
              height: 217,
              width: 246
            }}
          />
          { displayMode === ItemType.saved ?
            (<Fragment>
              <Text style={{
                ...textInfoBoldStyle(),
                fontSize: 16 * fontSizeMultiplier(),
                marginTop: 24 * fontSizeMultiplier(),
                marginBottom: 24 * fontSizeMultiplier(),
                marginLeft: 0,
                marginRight: 0
              }}>This is the area for your saved stories, but you don’t have any right now.</Text>
              <Text style={{
                ...textInfoStyle(),
                fontSize: 16 * fontSizeMultiplier(),
                marginBottom: 24 * fontSizeMultiplier(),
                marginLeft: 0,
                marginRight: 0
              }}>You can save stories from your feed, or direct from Safari using the Rizzle Share Extension.</Text>
            </Fragment>) :
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
        </View>
    </View>
  </Fragment>
}

export default EmptyCarousel
