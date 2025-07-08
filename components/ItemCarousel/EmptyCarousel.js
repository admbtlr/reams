import { ItemType } from '@/store/items/types'
import React, { Fragment } from 'react'
import { Dimensions, Image, Text, View } from 'react-native'
import BackButton from '@/components/BackButton'
import { textInfoBoldStyle, textInfoStyle } from '@/utils/styles'
import { getStatusBarHeight } from '@/utils/dimensions'
import { getMargin } from '@/utils/dimensions'
import { fontSizeMultiplier } from '@/utils/dimensions'
import { useSelector } from 'react-redux'

const EmptyCarousel = ({ displayMode, navigation }) => {
  const filter = useSelector(state => state.config.filter)
  return <Fragment>
    <BackButton style={{
      position: 'absolute',
      top: getStatusBarHeight() - 60,
      left: getMargin() / 2,
    }}
      onPress={() => navigation.goBack()}
    />
    <View style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {displayMode === ItemType.saved ?
        (<>
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
            source={require('@/assets/images/reams-external-save.webp')}
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
        </>) :
        (<Text style={{
          ...textInfoStyle(),
          fontSize: 16 * fontSizeMultiplier(),
          padding: 48 * fontSizeMultiplier(),
          textAlign: 'center'
        }}>You have no unread stories{!!filter && (
          <> in <Text style={textInfoBoldStyle()}>{filter.title}</Text></>
        )}</Text>)
      }
    </View>
  </Fragment>
}

export default EmptyCarousel
