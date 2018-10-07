import React from 'react'
import {
  Animated,
  Dimensions,
  Image,
  Text,
  View
} from 'react-native'
import {Surface} from 'gl-react-native'
const {Image: GLImage} = require('gl-react-image')
import { hslString } from '../utils/colors'

class Feed extends React.Component {

  constructor (props) {
    super(props)
    this.props = props

    this.scaleAnim = new Animated.Value(1)
  }

  render = () => {
    const {
      coverImageDimensions,
      coverImagePath,
      feed,
      numFeedItems
    } = this.props

    const that = this
    const width = Dimensions.get('window').width
    const margin = width * 0.05
    const cardWidth = width - margin * 2
    const coverImageUrl = coverImagePath ? `file://${coverImagePath}` : null
    const coverImage = coverImageUrl ?
      (
        <Surface
          width={cardWidth}
          height={cardWidth * 0.5}
          backgroundColor="#000"
          key="456"
        >
          <GLImage
            center={[0.5, 0]}
            key={coverImagePath}
            resizeMode='cover'
            source={{
              uri: coverImageUrl,
              width: coverImageDimensions.width,
              height: coverImageDimensions.height
            }}
            imageSize={{
              width: cardWidth,
              height: cardWidth * 0.5
            }}
          />
        </Surface>
      ) :
      null

    const textStyles = {
      color: 'white',
      fontFamily: 'IBMPlexMono-Light',
      textAlign: 'center'
    }

    return (
      <Animated.View
        onStartShouldSetResponder={e => true}
        onResponderGrant={e => {
          console.log('Something happened')
          Animated.timing(that.scaleAnim, {
            toValue: 0.95,
            duration: 100,
            useNative: true
          }).start()
        }}
        onResponderRelease={e => {
          console.log('Something happened')
          Animated.spring(that.scaleAnim, {
            toValue: 1,
            duration: 150,
            spring: 30,
            bounciness: 12,
            useNative: true
          }).start()
        }}
        style={{
          height: cardWidth / 2,
          width: cardWidth,
          borderRadius: 20,
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          backgroundColor: hslString(feed.color, 'desaturated'),
          marginBottom: margin,
          overflow: 'hidden',
          position: 'relative',
          shadowColor: 'black',
          shadowRadius: 10,
          shadowOpacity: 0.3,
          // shadowOffset: {
          //   width: 10,
          //   height: 10
          // },
          overflow: 'visible',
          transform: [
            { scaleX: this.scaleAnim },
            { scaleY: this.scaleAnim }
          ]
        }}>
        {coverImage}
        <View style={{
          // borderTopLeftRadius: 19,
          // borderTopRightRadius: 19,
          // height: cardWidth / 2,
          width: '100%',
          height: '100%',
          borderRadius: 20,
          paddingTop: margin,
          paddingLeft: margin,
          paddingRight: margin,
          position: 'absolute',
          flex: 1,
          flexDirection: 'column',
          // justifyContent: 'center',
          // alignItems: 'center',
          // justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }}>
          <Text style={{
            ...textStyles,
            fontSize: 20,
            marginBottom: 12
          }}>{feed.title}</Text>
          <Text style={{
            ...textStyles,
            fontSize: 16
          }}>{numFeedItems} unread</Text>
          <View style={{
            position: 'absolute',
            bottom: margin,
            left: margin,
            alignSelf: 'baseline',
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%'
          }}>
            <Text style={{
              ...textStyles,
              textDecorationLine: 'underline',
              fontSize: 16
            }}>Remove all</Text>
            <Text style={{
              ...textStyles,
              textDecorationLine: 'underline',
              fontSize: 16
            }}>Unsubscribe</Text>
          </View>
        </View>
      </Animated.View>
    )
  }
}

export default Feed
